import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { supabaseServer } from '@/lib/supabaseServer';
import { analyzeDiagnosticSession } from '@/lib/diagnostic/analyzeDiagnosticSession';
import { isAnswerMatch } from '@/lib/answerMatch';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { answers } = body || {};
    const sessionId = params.id;

    if (!Array.isArray(answers)) {
      return NextResponse.json({ error: '缺少作答資料' }, { status: 400 });
    }

    const supabase = supabaseServer();
    const { data: session, error: sessionError } = await supabase
      .from('diagnostic_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError) throw sessionError;

    const questionIds = (session?.scope_ref?.question_ids || []) as string[];
    const { data: questions, error: qError } = await supabase
      .from('questions')
      .select('id, answer, correct_choice_index, qtype, chapter_id')
      .in('id', questionIds);

    if (qError) throw qError;

    const questionMap = new Map((questions || []).map((q: any) => [q.id, q]));
    const answerRows = answers.map((answer: any) => {
      const question = questionMap.get(answer.questionId);
      if (!question) return null;
      const isCorrect =
        question.qtype === 'mcq'
          ? answer.selectedChoiceIndex === question.correct_choice_index
          : isAnswerMatch(String(answer.userAnswer || ''), String(question.answer || ''));
      return {
        id: `da_${nanoid(12)}`,
        diagnostic_session_id: sessionId,
        question_id: question.id,
        chapter_id: question.chapter_id,
        is_correct: isCorrect,
        user_answer: answer.userAnswer ?? answer.selectedChoiceIndex ?? null,
        time_spent_ms: answer.timeSpent || 0,
      };
    }).filter(Boolean);

    if (answerRows.length > 0) {
      const { error: insertError } = await supabase
        .from('diagnostic_answers')
        .insert(answerRows);
      if (insertError) throw insertError;
    }

    await supabase
      .from('diagnostic_sessions')
      .update({ submitted_at: new Date().toISOString() })
      .eq('id', sessionId);

    const result = await analyzeDiagnosticSession(sessionId);

    return NextResponse.json({ result });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '提交失敗' },
      { status: 500 }
    );
  }
}


