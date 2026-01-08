import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chapter_id, after_sort_order, increment } = body;

    if (!chapter_id || after_sort_order === undefined || increment === undefined) {
      return NextResponse.json(
        { error: '缺少必要參數' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    
    // 將該章節下所有 sort_order > after_sort_order 的題型排序加 1
    const { data: typesToUpdate, error: fetchError } = await supabase
      .from('question_types')
      .select('id, sort_order')
      .eq('chapter_id', chapter_id)
      .gt('sort_order', after_sort_order)
      .order('sort_order');

    if (fetchError) throw fetchError;

    if (typesToUpdate && typesToUpdate.length > 0) {
      // 批量更新
      for (const type of typesToUpdate) {
        const { error: updateError } = await supabase
          .from('question_types')
          .update({ sort_order: type.sort_order + (increment ? 1 : -1) })
          .eq('id', type.id);
        
        if (updateError) throw updateError;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '重新排序失敗' },
      { status: 500 }
    );
  }
}

