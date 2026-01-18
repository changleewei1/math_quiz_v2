import { supabaseServer } from '@/lib/supabaseServer';

type ChapterSummary = {
  chapter_id: string;
  total: number;
  correct: number;
  accuracy: number;
  level: 'high' | 'medium' | 'low';
};

export const analyzeDiagnosticSession = async (sessionId: string) => {
  const supabase = supabaseServer();

  const { data: answers, error } = await supabase
    .from('diagnostic_answers')
    .select('*')
    .eq('diagnostic_session_id', sessionId);

  if (error) throw error;

  const grouped: Record<string, { total: number; correct: number }> = {};
  let total = 0;
  let correct = 0;

  (answers || []).forEach((answer: any) => {
    total += 1;
    if (answer.is_correct) correct += 1;
    if (!grouped[answer.chapter_id]) {
      grouped[answer.chapter_id] = { total: 0, correct: 0 };
    }
    grouped[answer.chapter_id].total += 1;
    if (answer.is_correct) grouped[answer.chapter_id].correct += 1;
  });

  const chapterSummary: ChapterSummary[] = Object.entries(grouped).map(([chapter_id, stats]) => {
    const accuracy = stats.total === 0 ? 0 : stats.correct / stats.total;
    let level: ChapterSummary['level'] = 'low';
    if (accuracy < 0.5) level = 'high';
    else if (accuracy < 0.8) level = 'medium';
    return {
      chapter_id,
      total: stats.total,
      correct: stats.correct,
      accuracy,
      level,
    };
  });

  const overallAccuracy = total === 0 ? 0 : correct / total;
  const overallSummary = {
    total,
    correct,
    accuracy: overallAccuracy,
    score: overallAccuracy * 100,
  };

  const { data: result, error: insertError } = await supabase
    .from('diagnostic_results')
    .insert({
      id: `dr_${sessionId}`,
      diagnostic_session_id: sessionId,
      overall_summary: overallSummary,
      chapter_summary: chapterSummary,
    })
    .select()
    .single();

  if (insertError) throw insertError;

  await supabase
    .from('diagnostic_sessions')
    .update({
      accuracy: overallAccuracy,
      score: overallSummary.score,
    })
    .eq('id', sessionId);

  return result;
};


