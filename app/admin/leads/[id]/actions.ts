'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { contactLogSchema } from '@/lib/validations/contact-log-form';
import { trialBookingSchema } from '@/lib/validations/trial-booking-form';
import { enrollmentSchema } from '@/lib/validations/enrollment-form';
import { getCurrentProfile } from '@/lib/auth/guards';
import { createBindToken } from '@/lib/line/bindings';

export async function addContactLogAction(leadId: string, formData: FormData) {
  const parsed = contactLogSchema.safeParse({
    contact_type: formData.get('contact_type'),
    contact_result: formData.get('contact_result'),
    summary: formData.get('summary'),
    next_follow_up_at: formData.get('next_follow_up_at'),
  });

  if (!parsed.success) {
    return { ok: false, message: '請確認聯絡紀錄內容是否完整。' };
  }

  const profile = await getCurrentProfile();
  const supabase = createSupabaseServerClient();
  const nextFollowUpAt = parsed.data.next_follow_up_at || null;

  const { error } = await supabase.from('lead_contact_logs').insert({
    lead_id: leadId,
    contact_type: parsed.data.contact_type,
    contact_result: parsed.data.contact_result,
    summary: parsed.data.summary,
    next_follow_up_at: nextFollowUpAt,
    created_by: profile?.id ?? null,
  });

  if (error) {
    return { ok: false, message: '新增聯絡紀錄失敗，請稍後再試。' };
  }

  const updates: Record<string, any> = {
    last_contacted_at: new Date().toISOString(),
  };
  if (nextFollowUpAt) {
    updates.next_follow_up_at = nextFollowUpAt;
  }
  if (parsed.data.contact_result === 'booked_trial') {
    updates.status = 'trial_booked';
  }
  if (parsed.data.contact_result === 'enrolled') {
    updates.status = 'enrolled';
  }

  await supabase.from('leads').update(updates).eq('id', leadId);

  return { ok: true };
}

export async function addTrialBookingAction(leadId: string, formData: FormData) {
  const parsed = trialBookingSchema.safeParse({
    trial_date: formData.get('trial_date'),
    course_name: formData.get('course_name'),
    status: formData.get('status'),
    notes: formData.get('notes'),
  });

  if (!parsed.success) {
    return { ok: false, message: '請確認試聽資料是否完整。' };
  }

  const profile = await getCurrentProfile();
  const supabase = createSupabaseServerClient();

  const { error } = await supabase.from('trial_bookings').insert({
    lead_id: leadId,
    trial_date: parsed.data.trial_date,
    course_name: parsed.data.course_name,
    status: parsed.data.status,
    notes: parsed.data.notes || null,
    created_by: profile?.id ?? null,
  });

  if (error) {
    return { ok: false, message: '新增試聽預約失敗，請稍後再試。' };
  }

  await supabase.from('leads').update({ status: 'trial_booked' }).eq('id', leadId);

  return { ok: true };
}

export async function addEnrollmentAction(leadId: string, formData: FormData) {
  const parsed = enrollmentSchema.safeParse({
    enrolled_course: formData.get('enrolled_course'),
    tuition_amount: formData.get('tuition_amount'),
    enrolled_at: formData.get('enrolled_at'),
    notes: formData.get('notes'),
  });

  if (!parsed.success) {
    return { ok: false, message: '請確認報名資料是否完整。' };
  }

  const profile = await getCurrentProfile();
  const supabase = createSupabaseServerClient();

  const tuition = parsed.data.tuition_amount ? Number(parsed.data.tuition_amount) : null;

  const { error } = await supabase.from('enrollment_records').insert({
    lead_id: leadId,
    enrolled_course: parsed.data.enrolled_course,
    tuition_amount: tuition,
    enrolled_at: parsed.data.enrolled_at,
    notes: parsed.data.notes || null,
    created_by: profile?.id ?? null,
  });

  if (error) {
    return { ok: false, message: '新增報名紀錄失敗，請稍後再試。' };
  }

  await supabase.from('leads').update({ status: 'enrolled' }).eq('id', leadId);

  return { ok: true };
}

export async function updateLeadStatusQuickAction(leadId: string, status: string): Promise<void> {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from('leads').update({ status }).eq('id', leadId);
  if (error) {
    return;
  }
  return;
}

export async function createLeadLineBindTokenAction(leadId: string) {
  const result = await createBindToken({ targetType: 'lead', targetId: leadId });
  if (!result.ok) {
    return { ok: false, message: result.errorMessage ?? '建立綁定碼失敗' };
  }
  return { ok: true, token: result.token, expiresAt: result.expiresAt };
}

