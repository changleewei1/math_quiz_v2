'use server';

import { z } from 'zod';
import { mvpTrialBookingSchema, mvpPreferredTimeLabel } from '@/lib/validations/mvp-trial-booking-form';
import { createTrialBooking } from '@/lib/db/trial-bookings';
import type { Dimension } from '@/lib/questions';

export type TrialBookingActionState =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

function parseWeakDimensionsJson(raw: unknown): Dimension[] | null {
  if (typeof raw !== 'string' || !raw.trim()) return null;
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return null;
    return v.filter((x): x is Dimension => typeof x === 'string') as Dimension[];
  } catch {
    return null;
  }
}

export async function submitTrialBooking(
  _prev: TrialBookingActionState | undefined,
  formData: FormData
): Promise<TrialBookingActionState> {
  const raw = {
    student_name: formData.get('student_name'),
    parent_name: formData.get('parent_name'),
    phone: formData.get('phone'),
    preferred_time: formData.get('preferred_time'),
    note: formData.get('note') || '',
  };

  const parsed = mvpTrialBookingSchema.safeParse({
    student_name: typeof raw.student_name === 'string' ? raw.student_name : '',
    parent_name: typeof raw.parent_name === 'string' ? raw.parent_name : '',
    phone: typeof raw.phone === 'string' ? raw.phone : '',
    preferred_time: typeof raw.preferred_time === 'string' ? raw.preferred_time : '',
    note: typeof raw.note === 'string' ? raw.note : '',
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path[0];
      if (typeof path === 'string' && !fieldErrors[path]) fieldErrors[path] = issue.message;
    }
    return { ok: false, message: '請確認表單欄位', fieldErrors };
  }

  const overall_level = formData.get('overall_level');
  const recommended_course = formData.get('recommended_course');
  const leadRaw = formData.get('lead_id');
  const weakJson = formData.get('weak_dimensions_json');

  let lead_id: string | null = null;
  if (typeof leadRaw === 'string' && leadRaw.trim()) {
    const lid = z.string().uuid().safeParse(leadRaw.trim());
    if (lid.success) lead_id = lid.data;
  }

  const weak_dimensions = parseWeakDimensionsJson(weakJson);

  const ok = await createTrialBooking({
    lead_id,
    student_name: parsed.data.student_name,
    parent_name: parsed.data.parent_name,
    phone: parsed.data.phone,
    preferred_time: mvpPreferredTimeLabel(parsed.data.preferred_time),
    note: parsed.data.note?.trim() || null,
    overall_level: typeof overall_level === 'string' ? overall_level || null : null,
    weak_dimensions,
    recommended_course: typeof recommended_course === 'string' ? recommended_course || null : null,
  });

  if (!ok) {
    return {
      ok: false,
      message: '送出失敗，請稍後再試或改以電話聯繫。',
    };
  }

  return { ok: true };
}
