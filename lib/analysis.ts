/**
 * 弱點分析統計邏輯
 */

import { supabaseServer } from './supabaseServer';

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

