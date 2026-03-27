import { createSupabaseServerClient } from '@/lib/supabase/server';
import { DIMENSION_LABELS, FUNNEL_LABELS } from '@/lib/admin/constants';
import type { DashboardStats, FunnelStage, RecentSessionItem, WeaknessChartItem } from '@/lib/admin/types';
import type { QuestionDimension } from '@/types/quiz';

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from('leads').select('status', { count: 'exact' });

  if (error || !data) {
    return {
      totalLeads: 0,
      startedQuiz: 0,
      finishedQuiz: 0,
      trialBooked: 0,
      enrolled: 0,
    };
  }

  const counts = data.reduce(
    (acc, lead: any) => {
      acc.totalLeads += 1;
      if (lead.status === 'started_quiz') acc.startedQuiz += 1;
      if (lead.status === 'finished_quiz') acc.finishedQuiz += 1;
      if (lead.status === 'trial_booked') acc.trialBooked += 1;
      if (lead.status === 'enrolled') acc.enrolled += 1;
      return acc;
    },
    {
      totalLeads: 0,
      startedQuiz: 0,
      finishedQuiz: 0,
      trialBooked: 0,
      enrolled: 0,
    } as DashboardStats
  );

  return counts;
}

export function buildFunnel(stats: DashboardStats): FunnelStage[] {
  const total = Math.max(stats.totalLeads, 1);
  return FUNNEL_LABELS.map((stage) => {
    let count = 0;
    if (stage.key === 'total') count = stats.totalLeads;
    if (stage.key === 'started_quiz') count = stats.startedQuiz;
    if (stage.key === 'finished_quiz') count = stats.finishedQuiz;
    if (stage.key === 'trial_booked') count = stats.trialBooked;
    if (stage.key === 'enrolled') count = stats.enrolled;
    return {
      key: stage.key,
      label: stage.label,
      count,
      percentage: Math.round((count / total) * 100),
    };
  });
}

export async function fetchWeaknessStats(): Promise<WeaknessChartItem[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('dimension_scores')
    .not('completed_at', 'is', null);

  const baseCounts: Record<QuestionDimension, number> = {
    number_sense: 0,
    algebra_logic: 0,
    word_problem: 0,
    geometry: 0,
    data_reasoning: 0,
  };

  if (error || !data) {
    return Object.entries(baseCounts).map(([dimension, count]) => ({
      dimension: dimension as QuestionDimension,
      label: DIMENSION_LABELS[dimension as QuestionDimension],
      weakCount: count,
    }));
  }

  data.forEach((row: any) => {
    const scores = row.dimension_scores || {};
    (Object.keys(baseCounts) as QuestionDimension[]).forEach((dimension) => {
      const score = Number(scores[dimension] ?? 0);
      if (score < 60) baseCounts[dimension] += 1;
    });
  });

  return Object.entries(baseCounts).map(([dimension, count]) => ({
    dimension: dimension as QuestionDimension,
    label: DIMENSION_LABELS[dimension as QuestionDimension],
    weakCount: count,
  }));
}

export async function fetchRecentSessions(limit = 8): Promise<RecentSessionItem[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('id, completed_at, total_score, overall_level, leads(student_name,status)')
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map((item: any) => ({
    sessionId: item.id,
    studentName: item.leads?.student_name ?? '未命名',
    completedAt: item.completed_at,
    totalScore: item.total_score,
    overallLevel: item.overall_level,
    leadStatus: item.leads?.status ?? 'new',
  }));
}

export async function buildActionSuggestions(stats: DashboardStats): Promise<string[]> {
  const suggestions: string[] = [];

  if (stats.startedQuiz > stats.finishedQuiz) {
    suggestions.push(`尚未完成測驗的名單有 ${stats.startedQuiz - stats.finishedQuiz} 位，建議優先提醒完成。`);
  }
  if (stats.finishedQuiz > stats.trialBooked) {
    suggestions.push(`已完成但未預約試聽的名單有 ${stats.finishedQuiz - stats.trialBooked} 位，建議安排追蹤。`);
  }
  if (stats.trialBooked > stats.enrolled) {
    suggestions.push(`已預約試聽但未報名的名單有 ${stats.trialBooked - stats.enrolled} 位，可安排進一步諮詢。`);
  }

  if (suggestions.length === 0) {
    suggestions.push('目前沒有待追蹤的高風險名單，可聚焦新名單轉換。');
  }

  return suggestions;
}

