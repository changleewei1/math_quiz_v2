import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = supabaseServer();

    const { data: session, error } = await supabase
      .from('diagnostic_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    const questionIds = (session?.scope_ref?.question_ids || []) as string[];
    if (questionIds.length === 0) {
      return NextResponse.json({ session, questions: [] });
    }

    const { data: questions, error: qError } = await supabase
      .from('questions')
      .select('*')
      .in('id', questionIds);

    if (qError) throw qError;

    const questionMap = new Map((questions || []).map((q: any) => [q.id, q]));
    const ordered = questionIds.map((id) => questionMap.get(id)).filter(Boolean);

    return NextResponse.json({ session, questions: ordered });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '載入診斷階段失敗' },
      { status: 500 }
    );
  }
}


