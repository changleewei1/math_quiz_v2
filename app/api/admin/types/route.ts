import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get('chapterId');

    if (!chapterId) {
      return NextResponse.json(
        { error: '缺少 chapterId 參數' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('question_types')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('sort_order');

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '取得題型失敗' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chapter_id, name, code, description, sort_order } = body;

    if (!chapter_id || !name || !code) {
      return NextResponse.json(
        { error: '缺少必要欄位' },
        { status: 400 }
      );
    }

    // 生成安全的 id（使用 code 的安全版本）
    const id = code.toUpperCase().replace(/[^A-Z0-9]/g, '');

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('question_types')
      .insert({
        id,
        chapter_id,
        name,
        code,
        description: description || null,
        sort_order: sort_order || 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '新增題型失敗' },
      { status: 500 }
    );
  }
}


