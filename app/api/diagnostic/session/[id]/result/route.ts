import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = supabaseServer();

    const { data: session, error: sessionError } = await supabase
      .from('diagnostic_sessions')
      .select('*')
      .eq('id', params.id)
      .single();

    if (sessionError) throw sessionError;

    const { data: result, error: resultError } = await supabase
      .from('diagnostic_results')
      .select('*')
      .eq('diagnostic_session_id', params.id)
      .single();

    if (resultError) throw resultError;

    const { data: answers, error: answersError } = await supabase
      .from('diagnostic_answers')
      .select('id, question_id, is_correct, user_answer, time_spent_ms, chapter_id')
      .eq('diagnostic_session_id', params.id);

    if (answersError) throw answersError;

    const questionIds = (answers || []).map((a: any) => a.question_id).filter(Boolean);
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, prompt, answer, answer_md, correct_choice_index, qtype')
      .in('id', questionIds);

    if (questionsError) throw questionsError;

    const questionMap = new Map((questions || []).map((q: any) => [q.id, q]));
    const mergedAnswers = (answers || []).map((answer: any) => ({
      ...answer,
      question: questionMap.get(answer.question_id) || null,
    }));

    return NextResponse.json({ session, result, answers: mergedAnswers });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '載入診斷結果失敗' },
      { status: 500 }
    );
  }
}


