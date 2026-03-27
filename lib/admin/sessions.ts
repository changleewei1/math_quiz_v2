'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { SessionListItem } from '@/lib/admin/types';
import type { QuestionDimension } from '@/types/quiz';

interface SessionQueryParams {
  search?: string;
  overallLevel?: string;
  completed?: string;
  weakDimension?: QuestionDimension;
}

export async function fetchSessions(params: SessionQueryParams): Promise<SessionListItem[]> {
  const supabase = createSupabaseServerClient();
  const query = supabase
    .from('quiz_sessions')
    .select('id, lead_id, started_at, completed_at, total_score, overall_level, dimension_scores, weakness_summary, leads(student_name,status)')
    .order('started_at', { ascending: false });

  if (params.overallLevel) {
    query.eq('overall_level', params.overallLevel);
  }
  if (params.completed === 'true') {
    query.not('completed_at', 'is', null);
  }
  if (params.completed === 'false') {
    query.is('completed_at', null);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  const normalized = data.map((item: any) => ({
    id: item.id,
    lead_id: item.lead_id,
    student_name: item.leads?.student_name ?? '未命名',
    started_at: item.started_at,
    completed_at: item.completed_at,
    total_score: item.total_score,
    overall_level: item.overall_level,
    dimension_scores: item.dimension_scores ?? null,
    weakness_summary: item.weakness_summary ?? null,
    lead_status: item.leads?.status ?? 'new',
  }));

  const searchKeyword = params.search?.toLowerCase().trim();
  let result = normalized;

  if (searchKeyword) {
    result = result.filter((item) => item.student_name.toLowerCase().includes(searchKeyword));
  }

  const weakDimension = params.weakDimension;
  if (weakDimension) {
    result = result.filter((item) => {
      const score = item.dimension_scores?.[weakDimension] ?? null;
      return score !== null && Number(score) < 60;
    });
  }

  return result;
}


