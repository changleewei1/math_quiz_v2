import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

const DEFAULT_QUESTION_COUNT = 25;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject') || 'math';
    const limit = Number(searchParams.get('limit') || DEFAULT_QUESTION_COUNT);

    const supabase = supabaseServer();
    const { data: questions, error } = await supabase
      .from('exam_questions')
      .select('*')
      .eq('subject', subject)
      .eq('is_active', true);

    if (error) throw error;

    if (!questions || questions.length === 0) {
      return NextResponse.json({ questions: [], missing: true });
    }

    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, limit);
    const missing = selected.length < limit;

    return NextResponse.json({ questions: selected, missing });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '載入會考題庫失敗' },
      { status: 500 }
    );
  }
}


