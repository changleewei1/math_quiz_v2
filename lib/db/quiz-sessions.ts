import { createSupabaseServerClient } from '@/lib/supabase/server';
import { enrichMvpReport, type MvpAnalysisResult } from '@/lib/analysis';
import type { LeadRow, QuizSessionRow } from '@/types/database';

export async function createQuizSession(leadId: string): Promise<QuizSessionRow | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('quiz_sessions')
    .insert({
      lead_id: leadId,
      started_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error || !data) {
    console.error('createQuizSession', error);
    return null;
  }
  return data as QuizSessionRow;
}

export async function getQuizSessionById(sessionId: string): Promise<QuizSessionRow | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from('quiz_sessions').select('*').eq('id', sessionId).single();
  if (error || !data) return null;
  return data as QuizSessionRow;
}

export type QuizSessionResultUpdate = {
  total_score: number;
  overall_level: string;
  dimension_scores: unknown;
  weakness_summary: string | null;
  study_suggestions: string[];
  recommended_courses: unknown;
  /** MVP 報告未產出此欄時可傳 null */
  enrollment_cta?: string | null;
  mvp_report_snapshot: MvpAnalysisResult;
};

export async function updateQuizSessionResult(
  sessionId: string,
  payload: QuizSessionResultUpdate
): Promise<boolean> {
  const supabase = createSupabaseServerClient();
  const snapshot = JSON.parse(JSON.stringify(payload.mvp_report_snapshot)) as MvpAnalysisResult;

  const { error } = await supabase
    .from('quiz_sessions')
    .update({
      completed_at: new Date().toISOString(),
      total_score: payload.total_score,
      overall_level: payload.overall_level,
      dimension_scores: payload.dimension_scores,
      weakness_summary: payload.weakness_summary,
      study_suggestions: payload.study_suggestions,
      recommended_courses: payload.recommended_courses,
      enrollment_cta: payload.enrollment_cta ?? null,
      mvp_report_snapshot: snapshot,
    })
    .eq('id', sessionId);

  if (error) {
    console.error('updateQuizSessionResult', error);
    return false;
  }
  return true;
}

export type QuizReportBundle = {
  lead: LeadRow;
  session: QuizSessionRow;
  report: MvpAnalysisResult;
};

export async function getQuizReportBySessionId(sessionId: string): Promise<QuizReportBundle | null> {
  const supabase = createSupabaseServerClient();
  const { data: session, error: sErr } = await supabase.from('quiz_sessions').select('*').eq('id', sessionId).single();
  if (sErr || !session) return null;

  const { data: lead, error: lErr } = await supabase.from('leads').select('*').eq('id', session.lead_id).single();
  if (lErr || !lead) return null;

  const snap = session.mvp_report_snapshot as MvpAnalysisResult | null;
  if (!snap) return null;

  const report = enrichMvpReport(snap);
  return {
    lead: lead as LeadRow,
    session: session as QuizSessionRow,
    report,
  };
}
