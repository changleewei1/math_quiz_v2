import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionIds } = body;

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json(
        { error: '請提供要刪除的題目 ID 陣列' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    
    // 批次刪除
    const { error } = await supabase
      .from('questions')
      .delete()
      .in('id', questionIds);

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      deletedCount: questionIds.length 
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '批次刪除失敗' },
      { status: 500 }
    );
  }
}

