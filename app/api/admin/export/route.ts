import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get('chapterId');
    const typeId = searchParams.get('typeId');

    if (!chapterId || !typeId) {
      return NextResponse.json(
        { error: '缺少 chapterId 或 typeId 參數' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('chapter_id', chapterId)
      .eq('type_id', typeId)
      .order('created_at');

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '匯出失敗' },
      { status: 500 }
    );
  }
}


