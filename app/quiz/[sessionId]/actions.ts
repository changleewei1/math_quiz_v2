'use server';

import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { calculateQuizResult } from '@/lib/quiz/analysis';
import { fetchActiveQuestions, fetchCourses, fetchQuizSession } from '@/lib/quiz/fetchers';
import type { QuizAnswerInput } from '@/lib/quiz/types';
import { calculateResult, enrichMvpReport } from '@/lib/analysis';
import { isAnswerCorrect, QUESTIONS } from '@/lib/questions';
import { getLeadById, markLeadFinishedQuiz } from '@/lib/db/leads';
import { getQuizSessionById, updateQuizSessionResult } from '@/lib/db/quiz-sessions';
import { saveQuizAnswers } from '@/lib/db/answers';

export interface SubmitQuizResult {
  ok: boolean;
  error?: string;
}

const sessionIdSchema = z.string().uuid();

export type MvpFunnelAnswerInput = { questionId: string; selected: string };

/** 升國一 MVP 漏斗：題庫為 `lib/questions.ts`，作答寫入 `funnel_answers` + 報告快照 */
export async function submitMvpFunnelQuiz(
  sessionId: string,
  answers: MvpFunnelAnswerInput[]
): Promise<SubmitQuizResult> {
  const idParsed = sessionIdSchema.safeParse(sessionId);
  if (!idParsed.success) {
    return { ok: false, error: '測驗連結無效，請從填寫資料重新開始。' };
  }

  const session = await getQuizSessionById(sessionId);
  if (!session) {
    return { ok: false, error: '找不到測驗紀錄，請重新開始。' };
  }
  if (session.completed_at) {
    return { ok: false, error: '此測驗已完成，無法重複送出。' };
  }

  const lead = await getLeadById(session.lead_id);
  if (!lead) {
    return { ok: false, error: '找不到報名資料，請重新填寫。' };
  }

  if (answers.length !== QUESTIONS.length) {
    return { ok: false, error: '尚有未作答題目，請完成後再送出。' };
  }

  const map = new Map(answers.map((a) => [a.questionId, a.selected]));
  for (const q of QUESTIONS) {
    const sel = map.get(q.id);
    if (!sel || !sel.trim()) {
      return { ok: false, error: '尚有未作答題目，請完成後再送出。' };
    }
  }

  const mvpAnswers = QUESTIONS.map((q) => ({ questionId: q.id, selected: map.get(q.id)! }));
  const funnelRows = QUESTIONS.map((q) => {
    const selected = map.get(q.id)!;
    return {
      session_id: sessionId,
      question_id: q.id,
      selected_answer: selected,
      is_correct: isAnswerCorrect(q, selected),
      dimension: q.dimension,
      concept_tag: q.concept_tag,
    };
  });

  const saved = await saveQuizAnswers(sessionId, funnelRows);
  if (!saved) {
    return { ok: false, error: '儲存作答失敗，請稍後再試。' };
  }

  const base = calculateResult(QUESTIONS, mvpAnswers, { studentName: lead.student_name });
  const enriched = enrichMvpReport(base);

  const updated = await updateQuizSessionResult(sessionId, {
    total_score: enriched.totalScore,
    overall_level: enriched.overallLevel,
    dimension_scores: enriched.dimensionScores,
    weakness_summary: enriched.weaknessSummaryParagraph ?? null,
    study_suggestions: enriched.studySuggestions ?? enriched.suggestions ?? [],
    recommended_courses: enriched.recommendedCoursesV2 ?? enriched.recommendedCourses,
    enrollment_cta: null,
    mvp_report_snapshot: enriched,
  });

  if (!updated) {
    return { ok: false, error: '更新分析結果失敗，請稍後再試。' };
  }

  await markLeadFinishedQuiz(session.lead_id);
  return { ok: true };
}

export async function submitQuizSession(
  sessionId: string,
  answers: QuizAnswerInput[]
): Promise<SubmitQuizResult> {
  const supabase = createSupabaseServerClient();

  const session = await fetchQuizSession(sessionId);
  if (!session) {
    return { ok: false, error: '找不到測驗紀錄，請重新開始。' };
  }
  if (session.completed_at) {
    return { ok: false, error: '此測驗已完成，無法重複送出。' };
  }

  const questions = await fetchActiveQuestions();
  if (questions.length === 0) {
    return { ok: false, error: '目前沒有可用的題目，請稍後再試。' };
  }

  if (answers.length !== questions.length) {
    return { ok: false, error: '尚有未作答題目，請完成後再送出。' };
  }

  const unanswered = answers.find((item) => !item.selectedAnswer);
  if (unanswered) {
    return { ok: false, error: '尚有未作答題目，請完成後再送出。' };
  }

  const answerRows = answers.map((answer) => {
    const question = questions.find((item) => item.id === answer.questionId);
    const isCorrect = question ? question.correct_answer === answer.selectedAnswer : false;
    return {
      session_id: sessionId,
      question_id: answer.questionId,
      selected_answer: answer.selectedAnswer,
      is_correct: isCorrect,
      answered_at: new Date().toISOString(),
    };
  });

  await supabase.from('answers').delete().eq('session_id', sessionId);

  const { error: insertError } = await supabase.from('answers').insert(answerRows);
  if (insertError) {
    return { ok: false, error: '送出答案失敗，請稍後再試。' };
  }

  const courses = await fetchCourses();
  const analysis = calculateQuizResult(questions, answers, { courses });

  const { error: updateSessionError } = await supabase
    .from('quiz_sessions')
    .update({
      completed_at: new Date().toISOString(),
      total_score: analysis.totalScore,
      overall_level: analysis.overallLevel,
      dimension_scores: analysis.dimensionScores,
      weakness_summary: analysis.weaknessSummary,
      enrollment_cta: analysis.enrollmentCTA,
      recommended_courses: analysis.recommendedCourses,
    })
    .eq('id', sessionId);

  if (updateSessionError) {
    return { ok: false, error: '更新分析結果失敗，請稍後再試。' };
  }

  await supabase
    .from('leads')
    .update({ status: 'finished_quiz' })
    .eq('id', session.lead_id);

  return { ok: true };
}

