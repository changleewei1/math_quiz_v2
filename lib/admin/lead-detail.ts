'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { LeadDetailData } from '@/lib/admin/crm-types';

export async function fetchLeadDetail(leadId: string): Promise<LeadDetailData | null> {
  const supabase = createSupabaseServerClient();
  const { data: lead, error } = await supabase
    .from('leads')
    .select(
      'id, student_name, parent_name, phone, line_id, elementary_school, junior_high_school, status, assigned_to, last_contacted_at, next_follow_up_at, created_at, profiles!leads_assigned_to_fkey(id,full_name,role,is_active)'
    )
    .eq('id', leadId)
    .single();

  if (error || !lead) return null;

  const { data: sessions } = await supabase
    .from('quiz_sessions')
    .select('id, total_score, overall_level, dimension_scores, completed_at')
    .eq('lead_id', leadId)
    .order('completed_at', { ascending: false })
    .limit(1);

  const { data: contactLogs } = await supabase
    .from('lead_contact_logs')
    .select('id, lead_id, contact_type, contact_result, summary, next_follow_up_at, created_by, created_at, profiles(id,full_name,role,is_active)')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false });

  const { data: trialBookings } = await supabase
    .from('trial_bookings')
    .select('id, lead_id, trial_date, course_name, status, notes, created_by, created_at, profiles(id,full_name,role,is_active)')
    .eq('lead_id', leadId)
    .order('trial_date', { ascending: false });

  const { data: enrollmentRecords } = await supabase
    .from('enrollment_records')
    .select('id, lead_id, enrolled_course, tuition_amount, enrolled_at, notes, created_by, created_at, profiles(id,full_name,role,is_active)')
    .eq('lead_id', leadId)
    .order('enrolled_at', { ascending: false });

  return {
    id: lead.id,
    student_name: lead.student_name,
    parent_name: lead.parent_name,
    phone: lead.phone,
    line_id: lead.line_id,
    elementary_school: lead.elementary_school,
    junior_high_school: lead.junior_high_school,
    status: lead.status,
    assigned_to: lead.assigned_to,
    assigned_profile: Array.isArray(lead.profiles) ? lead.profiles[0] ?? null : (lead.profiles ?? null),
    last_contacted_at: lead.last_contacted_at,
    next_follow_up_at: lead.next_follow_up_at,
    created_at: lead.created_at,
    latest_session: sessions && sessions.length > 0 ? sessions[0] : null,
    contact_logs: (contactLogs ?? []).map((item: any) => ({
      ...item,
      created_by_profile: item.profiles ?? null,
    })),
    trial_bookings: (trialBookings ?? []).map((item: any) => ({
      ...item,
      created_by_profile: item.profiles ?? null,
    })),
    enrollment_records: (enrollmentRecords ?? []).map((item: any) => ({
      ...item,
      created_by_profile: item.profiles ?? null,
    })),
  };
}


