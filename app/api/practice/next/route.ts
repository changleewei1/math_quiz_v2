import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chapterId, typeId, difficulty, skillId } = body;

    if (!difficulty || (!skillId && (!chapterId || !typeId))) {
      return NextResponse.json(
        { error: '缺少必要參數' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // 隨機取得一題
    let query = supabase
      .from('questions')
      .select('*')
      .eq('difficulty', difficulty)
      .eq('is_active', true);

    if (skillId) {
      query = query.eq('skill_id', skillId);
    } else {
      query = query.eq('chapter_id', chapterId).eq('type_id', typeId);
    }

    const { data: questions, error } = await query;

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


