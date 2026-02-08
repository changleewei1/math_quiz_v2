import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject') || 'math';
    const year = Number(searchParams.get('year'));

    if (!year) {
      return NextResponse.json({ error: '缺少年份' }, { status: 400 });
    }

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('exam_questions')
      .select('*')
      .eq('subject', subject)
      .eq('is_active', true)
      .eq('exam_year', year);

    if (error) throw error;

    const sorted = (data || []).sort((a: any, b: any) => {
      const aOrder = a.question_no ?? a.order_index ?? 0;
      const bOrder = b.question_no ?? b.order_index ?? 0;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return String(a.id).localeCompare(String(b.id));
    });

    return NextResponse.json({ questions: sorted });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '載入題庫失敗' },
      { status: 500 }
    );
  }
}

