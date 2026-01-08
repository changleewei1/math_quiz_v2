import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chapterId, typeId, difficulty } = body;

    if (!chapterId || !typeId || !difficulty) {
      return NextResponse.json(
        { error: '缺少必要參數' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // 隨機取得一題
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .eq('chapter_id', chapterId)
      .eq('type_id', typeId)
      .eq('difficulty', difficulty)
      .eq('is_active', true);

    if (error) throw error;

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: '題庫不足，請至後台補題', question: null },
        { status: 200 }
      );
    }

    // 隨機選一題
    const randomIndex = Math.floor(Math.random() * questions.length);
    const question = questions[randomIndex];

    return NextResponse.json({ question });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '取得題目失敗' },
      { status: 500 }
    );
  }
}


