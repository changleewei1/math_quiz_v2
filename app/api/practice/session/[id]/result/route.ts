import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = supabaseServer();
    const { data: attempts, error } = await supabase
      .from('question_attempts')
      .select('id, question_id, prompt_snapshot, time_spent_ms, is_correct, created_at')
      .eq('session_id', params.id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const questionIds = (attempts || []).map((a: any) => a.question_id).filter(Boolean);
    let questionMap = new Map<string, any>();
    if (questionIds.length > 0) {
      const { data: questions, error: qError } = await supabase
        .from('questions')
        .select('id, answer, answer_md, prompt, prompt_md')
        .in('id', questionIds);
      if (qError) throw qError;
      questionMap = new Map((questions || []).map((q: any) => [q.id, q]));
    }

    const merged = (attempts || []).map((a: any) => ({
      ...a,
      question: questionMap.get(a.question_id) || null,
    }));

    return NextResponse.json({ attempts: merged });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '載入練習結果失敗' },
      { status: 500 }
    );
  }
}

