import { supabaseServer } from './supabaseServer';

export type SkillStat = {
  skill_id: string;
  skill_name?: string | null;
  skill_code?: string | null;
  total: number;
  correct: number;
  accuracy: number;
};

export type DailyPracticeSummary = {
  skill_stats: SkillStat[];
  weak_skills: SkillStat[];
  overall_accuracy: number;
};

/**
 * 產生 daily_practice 的最小可用弱點分析（以 skill_id 聚合）
 */
export async function buildDailyPracticeSummary(sessionId: string): Promise<DailyPracticeSummary> {
  const supabase = supabaseServer();

  // 1) 取得作答紀錄
  const { data: attempts, error: attemptsError } = await supabase
    .from('question_attempts')
    .select('question_id, is_correct')
    .eq('session_id', sessionId);

  if (attemptsError) {
    throw new Error('取得作答紀錄失敗');
  }

  if (!attempts || attempts.length === 0) {
    return { skill_stats: [], weak_skills: [], overall_accuracy: 0 };
  }

  // 2) 取得題目 skill_id
  const questionIds = attempts.map((a) => a.question_id).filter(Boolean);
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('id, skill_id')
    .in('id', questionIds as string[]);

  if (questionsError) {
    throw new Error('取得題目 skill_id 失敗');
  }

  const questionSkillMap = new Map<string, string | null>();
  for (const q of questions || []) {
    questionSkillMap.set(q.id, q.skill_id || null);
  }

  // 3) 聚合到 skill_id
  const statsMap = new Map<string, { total: number; correct: number }>();
  let totalQuestions = 0;
  let totalCorrect = 0;

  for (const attempt of attempts) {
    const questionId = attempt.question_id as string;
    const skillId = questionSkillMap.get(questionId);
    if (!skillId) continue;

    if (!statsMap.has(skillId)) {
      statsMap.set(skillId, { total: 0, correct: 0 });
    }
    const stat = statsMap.get(skillId)!;
    stat.total += 1;
    if (attempt.is_correct) {
      stat.correct += 1;
    }

    totalQuestions += 1;
    if (attempt.is_correct) {
      totalCorrect += 1;
    }
  }

  // 4) 取得技能名稱（若 skill_id 對應到題型）
  const skillIds = Array.from(statsMap.keys());
  let skillMetaMap = new Map<string, { name: string; code: string }>();
  if (skillIds.length > 0) {
    const { data: types } = await supabase
      .from('question_types')
      .select('id, name, code')
      .in('id', skillIds);
    skillMetaMap = new Map((types || []).map((t) => [t.id, { name: t.name, code: t.code }]));
  }

  const skillStats: SkillStat[] = skillIds.map((skillId) => {
    const meta = skillMetaMap.get(skillId);
    const stat = statsMap.get(skillId)!;
    const accuracy = stat.total > 0 ? Math.round((stat.correct / stat.total) * 1000) / 10 : 0;
    return {
      skill_id: skillId,
      skill_name: meta?.name || null,
      skill_code: meta?.code || null,
      total: stat.total,
      correct: stat.correct,
      accuracy,
    };
  });

  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 1000) / 10 : 0;

  // 5) 弱點技能 Top 5（total >= 2 且 accuracy 最低）
  const weakSkills = [...skillStats]
    .filter((s) => s.total >= 2)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5);

  return {
    skill_stats: skillStats,
    weak_skills: weakSkills,
    overall_accuracy: overallAccuracy,
  };
}


