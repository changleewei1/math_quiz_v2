import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { TrialBookingInsert } from '@/types/database';

export async function createTrialBooking(data: TrialBookingInsert): Promise<boolean> {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from('funnel_trial_bookings').insert({
    lead_id: data.lead_id,
    student_name: data.student_name.trim(),
    parent_name: data.parent_name.trim(),
    phone: data.phone.trim(),
    preferred_time: data.preferred_time.trim(),
    note: data.note?.trim() || null,
    overall_level: data.overall_level?.trim() || null,
    weak_dimensions: data.weak_dimensions,
    recommended_course: data.recommended_course?.trim() || null,
  });

  if (error) {
    console.error('createTrialBooking', error);
    return false;
  }
  return true;
}
