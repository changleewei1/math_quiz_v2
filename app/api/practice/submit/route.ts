import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      questionId,
      chapterId,
      typeId,
      difficulty,
      qtype,
      prompt,
      userAnswer,
      selectedChoiceIndex,
      isCorrect,
      timeSpent,
    } = body;

    if (!sessionId || !questionId) {
      return NextResponse.json(
        { error: '缺少必要參數' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // 記錄 attempt
    const { data: attempt, error } = await supabase
      .from('question_attempts')
      .insert({
        session_id: sessionId,
        question_id: questionId,
        chapter_id: chapterId,
        type_id: typeId,
        difficulty,
        qtype,
        prompt_snapshot: prompt,
        user_answer: userAnswer || null,
        selected_choice_index: selectedChoiceIndex || null,
        is_correct: isCorrect,
        time_spent_sec: timeSpent || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ attempt });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '提交失敗' },
      { status: 500 }
    );
  }
}


