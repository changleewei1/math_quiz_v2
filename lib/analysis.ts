/**
 * 弱點分析統計邏輯
 */

import { supabaseServer } from './supabaseServer';
import { isAnswerCorrect, type Dimension, type QuestionItem } from './questions';
import type { MvpMistakeRecord, MvpOverallLevel } from '@/types/mvp-funnel';
import {
  buildDimensionDetails,
  buildRadarNotes,
  getRecommendedCourses,
  type MvpDimensionDetail,
  type MvpEnrollmentCourse,
} from '@/lib/mvp/report-narrative';
import {
  generateActionableStudySuggestions,
  generateCourseRecommendation,
  generateExecutiveSummary,
  generateParentAdvice,
  generateStudyPlan,
  generateWeaknessSummary,
} from '@/lib/mvp/level-narrative';

function resolveWeakDimensionList(
  dimensionScores: MvpDimensionScore[],
  overallLevel: MvpOverallLevel
): Dimension[] {
  const weak = dimensionScores.filter((s) => s.percentage < 60).map((s) => s.dimension);
  if (weak.length > 0) return weak;
  if (overallLevel === 'C' || overallLevel === 'D') {
    return [...dimensionScores]
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 2)
      .map((s) => s.dimension);
  }
  return [];
}

export interface TypeStatistics {
  typeId: string;
  typeCode: string;
  typeName: string;
  total: number;
  correct: number;
  wrong: number;
  accuracy: number;
  byDifficulty: {
    easy: { total: number; correct: number };
    medium: { total: number; correct: number };
    hard: { total: number; correct: number };
  };
  priority: number;
  recommendation: string;
}

export interface DiagnosticAnalysisResult {
  sessionId: string;
  chapterId: string;
  chapterTitle: string;
  studentId: string | null;
  totalQuestions: number;
  correctQuestions: number;
  overallAccuracy: number;
  typeStatistics: TypeStatistics[];
  topWeaknesses: TypeStatistics[];
  summary: string;
}

/**
 * 分析診斷測驗的作答記錄
 */
export async function analyzeDiagnosticSession(
  sessionId: string
): Promise<DiagnosticAnalysisResult> {
  const supabase = supabaseServer();

  // 1. 取得 session 資訊
  const { data: session, error: sessionError } = await supabase
    .from('student_sessions')
    .select('*, chapters(title)')
    .eq('id', sessionId)
    .eq('mode', 'diagnostic')
    .single();

  if (sessionError || !session) {
    throw new Error('找不到診斷測驗記錄');
  }

  // 2. 取得所有作答記錄
  const { data: attempts, error: attemptsError } = await supabase
    .from('question_attempts')
    .select('*')
    .eq('session_id', sessionId);

  if (attemptsError) {
    throw new Error('取得作答記錄失敗');
  }

  if (!attempts || attempts.length === 0) {
    throw new Error('沒有作答記錄');
  }

  // 3. 取得題型資訊
  const typeIds = [...new Set(attempts.map((a) => a.type_id).filter(Boolean))];
  const { data: types } = await supabase
    .from('question_types')
    .select('id, code, name')
    .in('id', typeIds);

  const typeMap = new Map(types?.map((t) => [t.id, t]) || []);

  // 4. 依題型統計
  const typeStatsMap = new Map<string, TypeStatistics>();

  for (const attempt of attempts) {
    if (!attempt.type_id) continue;

    const type = typeMap.get(attempt.type_id);
    if (!type) continue;

    if (!typeStatsMap.has(attempt.type_id)) {
      typeStatsMap.set(attempt.type_id, {
        typeId: attempt.type_id,
        typeCode: type.code,
        typeName: type.name,
        total: 0,
        correct: 0,
        wrong: 0,
        accuracy: 0,
        byDifficulty: {
          easy: { total: 0, correct: 0 },
          medium: { total: 0, correct: 0 },
          hard: { total: 0, correct: 0 },
        },
        priority: 0,
        recommendation: '',
      });
    }

    const stats = typeStatsMap.get(attempt.type_id)!;
    stats.total++;
    if (attempt.is_correct) {
      stats.correct++;
    } else {
      stats.wrong++;
    }

    // 依難度統計
    if (attempt.difficulty) {
      const diffStats = stats.byDifficulty[attempt.difficulty as 'easy' | 'medium' | 'hard'];
      if (diffStats) {
        diffStats.total++;
        if (attempt.is_correct) {
          diffStats.correct++;
        }
      }
    }
  }

  // 5. 計算正確率和優先級
  const typeStatistics: TypeStatistics[] = [];
  let totalQuestions = 0;
  let correctQuestions = 0;

  for (const stats of typeStatsMap.values()) {
    stats.accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
    
    // 計算優先級：priority = wrong*10 + hardWrong*5 + mediumWrong*3
    const hardWrong = stats.byDifficulty.hard.total - stats.byDifficulty.hard.correct;
    const mediumWrong = stats.byDifficulty.medium.total - stats.byDifficulty.medium.correct;
    stats.priority = stats.wrong * 10 + hardWrong * 5 + mediumWrong * 3;

    // 生成建議
    if (stats.wrong >= 2) {
      stats.recommendation = '主要弱點，建議先從簡單題開始練習，熟練後再挑戰中等和困難題';
    } else if (hardWrong >= 1) {
      stats.recommendation = '進階題目待加強，建議先鞏固基礎後再挑戰困難題';
    } else if (stats.accuracy === 100) {
      stats.recommendation = '表現良好，可進入下一題型';
    } else {
      stats.recommendation = '表現尚可，建議繼續練習以提升熟練度';
    }

    totalQuestions += stats.total;
    correctQuestions += stats.correct;
    typeStatistics.push(stats);
  }

  // 6. 排序並取得 Top 3 弱點
  typeStatistics.sort((a, b) => b.priority - a.priority);
  const topWeaknesses = typeStatistics.slice(0, 3);

  // 7. 生成摘要
  const overallAccuracy = totalQuestions > 0 ? (correctQuestions / totalQuestions) * 100 : 0;
  const chapterTitle = (session.chapters as any)?.title || '未知章節';
  const date = new Date(session.started_at).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let summary = `本次測驗共 ${totalQuestions} 題，答對 ${correctQuestions} 題，總正確率 ${overallAccuracy.toFixed(1)}%。`;
  if (topWeaknesses.length > 0) {
    summary += `主要弱點為：${topWeaknesses.map((w) => w.typeName).join('、')}。`;
  }
  if (overallAccuracy >= 80) {
    summary += '整體表現良好，建議繼續保持。';
  } else if (overallAccuracy >= 60) {
    summary += '表現尚可，建議針對弱點加強練習。';
  } else {
    summary += '需要加強練習，建議從基礎題型開始。';
  }

  return {
    sessionId,
    chapterId: session.chapter_id || '',
    chapterTitle,
    studentId: session.student_id,
    totalQuestions,
    correctQuestions,
    overallAccuracy,
    typeStatistics,
    topWeaknesses,
    summary,
  };
}

export interface MvpAnswer {
  questionId: string;
  selected: string;
}

export interface MvpDimensionScore {
  dimension: Dimension;
  percentage: number;
}

export interface MvpAnalysisResult {
  /** 提交測驗時一併寫入，避免 URL / localStorage key 不一致時標題缺姓名 */
  studentName?: string;
  /** ISO 日期字串，報告抬頭用 */
  reportDate?: string;
  totalScore: number;
  overallLevel: 'A' | 'B' | 'C' | 'D';
  dimensionScores: MvpDimensionScore[];
  weaknesses: MvpDimensionScore[];
  /** 相容舊版：與 studySuggestions 內容對齊 */
  suggestions: string[];
  /** 相容舊版卡片：僅 title + description */
  recommendedCourses: Array<{ title: string; description: string }>;
  /** 招生版：顧問式總結 */
  executiveSummary?: string;
  weaknessSummaryParagraph?: string;
  studySuggestions?: string[];
  studyOrderSteps?: string[];
  parentAdviceParagraphs?: string[];
  dimensionDetails?: MvpDimensionDetail[];
  radarStableNote?: string;
  radarPriorityNote?: string;
  /** 招生版課程（含推薦理由、對象、CTA） */
  recommendedCoursesV2?: MvpEnrollmentCourse[];
  /** 答錯題目的概念／錯因，供分級弱點摘要 */
  mistakeRecords?: MvpMistakeRecord[];
  /** 用於預約頁等：優先關注向度（可能含分級補齊的次弱項） */
  weakDimensionKeys?: Dimension[];
}

function buildFullReportPayload(args: {
  studentName?: string;
  reportDate?: string;
  totalScore: number;
  overallLevel: MvpOverallLevel;
  dimensionScores: MvpDimensionScore[];
  weaknesses: MvpDimensionScore[];
  mistakeRecords?: MvpMistakeRecord[];
}): MvpAnalysisResult {
  const dimensionDetails = buildDimensionDetails(args.dimensionScores);
  const name = args.studentName?.trim() || '孩子';
  const weakDims = resolveWeakDimensionList(args.dimensionScores, args.overallLevel);
  const mistakes = args.mistakeRecords ?? [];

  const courseReasonMap = generateCourseRecommendation(args.overallLevel, weakDims);
  const coursesV2: MvpEnrollmentCourse[] = getRecommendedCourses(dimensionDetails).map((c) => ({
    ...c,
    recommendedReason: courseReasonMap[c.id] ?? c.recommendedReason,
  }));
  const studySuggestions = generateActionableStudySuggestions(args.overallLevel, weakDims);
  const radar = buildRadarNotes(dimensionDetails);

  const executiveSummary = generateExecutiveSummary(args.overallLevel, weakDims, {
    studentName: name,
    totalScore: args.totalScore,
  });

  return {
    studentName: args.studentName,
    reportDate: args.reportDate ?? new Date().toISOString(),
    totalScore: args.totalScore,
    overallLevel: args.overallLevel,
    dimensionScores: args.dimensionScores,
    weaknesses: args.weaknesses,
    suggestions: studySuggestions,
    recommendedCourses: coursesV2.map((c) => ({ title: c.title, description: c.description })),
    executiveSummary,
    weaknessSummaryParagraph: generateWeaknessSummary(args.overallLevel, mistakes),
    studySuggestions,
    studyOrderSteps: generateStudyPlan(args.overallLevel, weakDims),
    parentAdviceParagraphs: generateParentAdvice(args.overallLevel),
    dimensionDetails,
    radarStableNote: radar.stable,
    radarPriorityNote: radar.priority,
    recommendedCoursesV2: coursesV2,
    mistakeRecords: mistakes,
    weakDimensionKeys: weakDims,
  };
}

/** 舊版 localStorage 報告補齊招生欄位 */
export function enrichMvpReport(partial: MvpAnalysisResult): MvpAnalysisResult {
  return buildFullReportPayload({
    studentName: partial.studentName,
    reportDate: partial.reportDate,
    totalScore: partial.totalScore,
    overallLevel: partial.overallLevel,
    dimensionScores: partial.dimensionScores,
    weaknesses: partial.weaknesses,
    mistakeRecords: partial.mistakeRecords,
  });
}

export function calculateResult(
  questions: QuestionItem[],
  answers: MvpAnswer[],
  opts?: { studentName?: string }
): MvpAnalysisResult {
  const answerMap = new Map<string, string>(answers.map((item) => [item.questionId, item.selected]));
  const byDimension = new Map<Dimension, { total: number; correct: number }>();
  const mistakeRecords: MvpMistakeRecord[] = [];

  for (const q of questions) {
    const selected = answerMap.get(q.id) ?? '';
    const slot = byDimension.get(q.dimension) ?? { total: 0, correct: 0 };
    slot.total += 1;
    if (isAnswerCorrect(q, selected)) {
      slot.correct += 1;
    } else {
      mistakeRecords.push({
        dimension: q.dimension,
        concept_tag: q.concept_tag,
        mistake_type: q.mistake_type,
      });
    }
    byDimension.set(q.dimension, slot);
  }

  const totalCorrect = questions.filter((q) => isAnswerCorrect(q, answerMap.get(q.id) ?? '')).length;
  const totalScore = Math.round((totalCorrect / questions.length) * 100);
  const overallLevel: 'A' | 'B' | 'C' | 'D' =
    totalScore >= 90 ? 'A' : totalScore >= 75 ? 'B' : totalScore >= 60 ? 'C' : 'D';

  const dimensionScores: MvpDimensionScore[] = Array.from(byDimension.entries()).map(([dimension, stat]) => ({
    dimension,
    percentage: Math.round((stat.correct / stat.total) * 100),
  }));

  const weaknesses = dimensionScores.filter((item) => item.percentage < 60);

  return buildFullReportPayload({
    studentName: opts?.studentName,
    totalScore,
    overallLevel,
    dimensionScores,
    weaknesses,
    mistakeRecords,
  });
}

