import { supabaseServer } from './supabaseServer';

export type SessionReportSkillStat = {
  skillId: string;
  skillName: string;
  total: number;
  correct: number;
  accuracy: number;
  avgTimeSec?: number | null;
};

export type SessionReport = {
  sessionId: string;
  subject: string | null;
  mode: string | null;
  examYear?: number | null;
  overall: {
    answered: number;
    correct: number;
    accuracy: number;
    avgTimeSec?: number | null;
  };
  skillStats: SessionReportSkillStat[];
  weakTop5: SessionReportSkillStat[];
};

export async function getSessionReport(sessionId: string): Promise<SessionReport> {
  const supabase = supabaseServer();

  const { data: session, error: sessionError } = await supabase
    .from('student_sessions')
    .select('id, subject, mode, quiz_mode, exam_year')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    throw new Error('找不到測驗記錄');
  }

  const { data: attempts, error: attemptsError } = await supabase
    .from('question_attempts')
    .select('question_id, is_correct, time_spent_ms')
    .eq('session_id', sessionId);

  if (attemptsError) {
    throw new Error('取得作答紀錄失敗');
  }

  const answered = attempts?.length || 0;
  const correct = (attempts || []).filter((a) => a.is_correct).length;
  const accuracy = answered > 0 ? Math.round((correct / answered) * 1000) / 10 : 0;

  const times = (attempts || [])
    .map((a) => (typeof a.time_spent_ms === 'number' ? a.time_spent_ms : null))
    .filter((t): t is number => typeof t === 'number');
  const avgTimeSec =
    times.length > 0 ? Math.round((times.reduce((sum, t) => sum + t, 0) / times.length) / 100) / 10 : null;

  if (!attempts || attempts.length === 0) {
    return {
      sessionId,
      subject: session.subject || null,
      mode: (session.quiz_mode || session.mode || null) as string | null,
      examYear: session.exam_year ?? null,
      overall: { answered: 0, correct: 0, accuracy: 0, avgTimeSec: null },
      skillStats: [],
      weakTop5: [],
    };
  }

  const questionIds = attempts.map((a) => a.question_id).filter(Boolean);
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('id, skill_id')
    .in('id', questionIds as string[]);

  if (questionsError) {
    throw new Error('取得題目技能失敗');
  }

  const questionSkillMap = new Map<string, string | null>();
  for (const q of questions || []) {
    questionSkillMap.set(q.id, q.skill_id || null);
  }

  const statsMap = new Map<
    string,
    { total: number; correct: number; timeMs: number; timeCount: number }
  >();

  for (const attempt of attempts) {
    const skillId = questionSkillMap.get(attempt.question_id as string);
    if (!skillId) continue;
    if (!statsMap.has(skillId)) {
      statsMap.set(skillId, { total: 0, correct: 0, timeMs: 0, timeCount: 0 });
    }
    const stat = statsMap.get(skillId)!;
    stat.total += 1;
    if (attempt.is_correct) stat.correct += 1;
    if (typeof attempt.time_spent_ms === 'number') {
      stat.timeMs += attempt.time_spent_ms;
      stat.timeCount += 1;
    }
  }

  const skillIds = Array.from(statsMap.keys());
  let skillMetaMap = new Map<string, string>();
  if (skillIds.length > 0) {
    const { data: types } = await supabase
      .from('question_types')
      .select('id, name')
      .in('id', skillIds);
    skillMetaMap = new Map((types || []).map((t) => [t.id, t.name]));
  }

  const skillStats: SessionReportSkillStat[] = skillIds.map((skillId) => {
    const stat = statsMap.get(skillId)!;
    const skillName = skillMetaMap.get(skillId) || skillId;
    const skillAccuracy = stat.total > 0 ? Math.round((stat.correct / stat.total) * 1000) / 10 : 0;
    const skillAvgTimeSec =
      stat.timeCount > 0 ? Math.round((stat.timeMs / stat.timeCount) / 100) / 10 : null;
    return {
      skillId,
      skillName,
      total: stat.total,
      correct: stat.correct,
      accuracy: skillAccuracy,
      avgTimeSec: skillAvgTimeSec,
    };
  });

  const weakTop5 = [...skillStats]
    .filter((s) => s.total >= 2)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5);

  return {
    sessionId,
    subject: session.subject || null,
    mode: (session.quiz_mode || session.mode || null) as string | null,
    examYear: session.exam_year ?? null,
    overall: { answered, correct, accuracy, avgTimeSec },
    skillStats,
    weakTop5,
  };
}

