import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject') || 'math';

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('exam_questions')
      .select('exam_year, year, created_at')
      .eq('subject', subject);

    if (error) throw error;

    const map = new Map<number, { year: number; count: number; lastUpdated: string | null }>();
    (data || []).forEach((row: any) => {
      const y = Number(row.exam_year ?? row.year);
      if (!y) return;
      const existing = map.get(y) || { year: y, count: 0, lastUpdated: null };
      existing.count += 1;
      const createdAt = row.created_at ? new Date(row.created_at).toISOString() : null;
      if (createdAt && (!existing.lastUpdated || createdAt > existing.lastUpdated)) {
        existing.lastUpdated = createdAt;
      }
      map.set(y, existing);
    });

    const years = Array.from(map.values()).sort((a, b) => b.year - a.year);

    return NextResponse.json({ years });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '載入年份失敗' },
      { status: 500 }
    );
  }
}

