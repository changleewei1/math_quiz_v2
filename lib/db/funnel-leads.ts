import { createSupabaseServerClient } from '@/lib/supabase/server';

export type FunnelLeadListItem = {
  id: string;
  student_name: string;
  parent_name: string;
  phone: string;
  elementary_school: string;
  junior_high_school: string | null;
  created_at: string;
  /** 最新一筆測驗工作階段（依 created_at） */
  session_id: string | null;
  quiz_completed: boolean;
  total_score: number | null;
  overall_level: string | null;
  has_trial_booking: boolean;
};

type QuizSessionEmbed = {
  id: string;
  completed_at: string | null;
  total_score: number | null;
  overall_level: string | null;
  created_at: string;
};

type LeadEmbedRow = {
  id: string;
  student_name: string;
  parent_name: string;
  phone: string;
  elementary_school: string;
  junior_high_school: string | null;
  created_at: string;
  quiz_sessions: QuizSessionEmbed[] | null;
};

function escapeIlike(q: string): string {
  return q.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

function pickLatestSession(sessions: QuizSessionEmbed[] | null | undefined): QuizSessionEmbed | null {
  if (!sessions?.length) return null;
  return [...sessions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];
}

export type FetchFunnelLeadsFilters = {
  search?: string;
  /** all | completed | incomplete */
  quiz?: string;
  /** all | yes | no */
  trial?: string;
  limit?: number;
};

export async function fetchFunnelLeads(filters: FetchFunnelLeadsFilters = {}): Promise<FunnelLeadListItem[]> {
  const supabase = createSupabaseServerClient();
  const limit = Math.min(filters.limit ?? 500, 2000);
  const search = filters.search?.trim() ?? '';
  const quiz = filters.quiz ?? 'all';
  const trial = filters.trial ?? 'all';

  let q = supabase
    .from('leads')
    .select(
      `
      id,
      student_name,
      parent_name,
      phone,
      elementary_school,
      junior_high_school,
      created_at,
      quiz_sessions (
        id,
        completed_at,
        total_score,
        overall_level,
        created_at
      )
    `
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (search) {
    const s = escapeIlike(search);
    q = q.or(`student_name.ilike.%${s}%,parent_name.ilike.%${s}%,phone.ilike.%${s}%`);
  }

  const { data: leads, error } = await q;
  if (error) {
    console.error('fetchFunnelLeads leads', error);
    return [];
  }

  const { data: trialRows, error: trialErr } = await supabase
    .from('funnel_trial_bookings')
    .select('lead_id')
    .not('lead_id', 'is', null);

  if (trialErr) {
    console.error('fetchFunnelLeads trial', trialErr);
  }

  const trialLeadIds = new Set(
    (trialRows ?? [])
      .map((r) => r.lead_id as string | null)
      .filter((id): id is string => typeof id === 'string' && id.length > 0)
  );

  const rows = (leads ?? []) as LeadEmbedRow[];

  let out: FunnelLeadListItem[] = rows.map((row) => {
    const latest = pickLatestSession(row.quiz_sessions);
    const quiz_completed = Boolean(latest?.completed_at);
    return {
      id: row.id,
      student_name: row.student_name,
      parent_name: row.parent_name,
      phone: row.phone,
      elementary_school: row.elementary_school,
      junior_high_school: row.junior_high_school,
      created_at: row.created_at,
      session_id: latest?.id ?? null,
      quiz_completed,
      total_score: latest?.total_score ?? null,
      overall_level: latest?.overall_level ?? null,
      has_trial_booking: trialLeadIds.has(row.id),
    };
  });

  if (quiz === 'completed') {
    out = out.filter((r) => r.quiz_completed);
  } else if (quiz === 'incomplete') {
    out = out.filter((r) => !r.quiz_completed);
  }

  if (trial === 'yes') {
    out = out.filter((r) => r.has_trial_booking);
  } else if (trial === 'no') {
    out = out.filter((r) => !r.has_trial_booking);
  }

  return out;
}
