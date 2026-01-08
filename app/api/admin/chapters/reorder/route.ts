import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { after_sort_order, increment } = body;

    if (after_sort_order === undefined || increment === undefined) {
      return NextResponse.json(
        { error: '缺少必要參數' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    
    // 將所有 sort_order > after_sort_order 的章節排序加 1
    const { data: chaptersToUpdate, error: fetchError } = await supabase
      .from('chapters')
      .select('id, sort_order')
      .gt('sort_order', after_sort_order)
      .order('sort_order');

    if (fetchError) throw fetchError;

    if (chaptersToUpdate && chaptersToUpdate.length > 0) {
      // 批量更新
      const updates = chaptersToUpdate.map(ch => ({
        id: ch.id,
        sort_order: ch.sort_order + (increment ? 1 : -1),
      }));

      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('chapters')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
        
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

