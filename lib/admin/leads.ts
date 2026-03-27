'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { LeadListItem } from '@/lib/admin/types';

interface LeadQueryParams {
  search?: string;
  status?: string;
  followUp?: 'today' | 'overdue';
}

export async function fetchLeads(params: LeadQueryParams): Promise<LeadListItem[]> {
  const supabase = createSupabaseServerClient();
  const query = supabase
    .from('leads')
    .select('id, student_name, parent_name, phone, elementary_school, junior_high_school, status, assigned_to, last_contacted_at, next_follow_up_at, created_at, profiles(full_name), quiz_sessions(id, completed_at, total_score, overall_level)')
    .order('created_at', { ascending: false });

  if (params.status) {
    query.eq('status', params.status);
  }
  if (params.search) {
    const keyword = `%${params.search}%`;
    query.or(
      `student_name.ilike.${keyword},parent_name.ilike.${keyword},phone.ilike.${keyword},elementary_school.ilike.${keyword},junior_high_school.ilike.${keyword}`
    );
  }
  if (params.followUp === 'today') {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    query.gte('next_follow_up_at', todayStart.toISOString());
    query.lte('next_follow_up_at', todayEnd.toISOString());
  }
  if (params.followUp === 'overdue') {
    query.lt('next_follow_up_at', new Date().toISOString());
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((lead: any) => {
    const sessions = Array.isArray(lead.quiz_sessions) ? lead.quiz_sessions : [];
    const latestSession = sessions.sort((a: any, b: any) => {
      const aTime = new Date(a.completed_at || a.created_at || 0).getTime();
      const bTime = new Date(b.completed_at || b.created_at || 0).getTime();
      return bTime - aTime;
    })[0];

    return {
      id: lead.id,
      student_name: lead.student_name,
      parent_name: lead.parent_name,
      phone: lead.phone,
      elementary_school: lead.elementary_school,
      junior_high_school: lead.junior_high_school,
      status: lead.status,
      assigned_to: lead.assigned_to,
      assigned_profile: Array.isArray(lead.profiles) ? lead.profiles[0] ?? null : (lead.profiles ?? null),
      last_contacted_at: lead.last_contacted_at,
      next_follow_up_at: lead.next_follow_up_at,
      created_at: lead.created_at,
      latest_session: latestSession
        ? {
            id: latestSession.id,
            completed_at: latestSession.completed_at,
            total_score: latestSession.total_score,
            overall_level: latestSession.overall_level,
          }
        : null,
    };
  });
}

export async function updateLeadStatus(leadId: string, status: string) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from('leads').update({ status }).eq('id', leadId);
  if (error) {
    return { ok: false };
  }
  return { ok: true };
}

export async function updateLeadStatusAction(formData: FormData) {
  const leadId = String(formData.get('leadId') || '');
  const status = String(formData.get('status') || '');
  if (!leadId || !status) return;
  await updateLeadStatus(leadId, status);
}

