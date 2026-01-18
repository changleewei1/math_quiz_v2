import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = supabaseServer();

    const { data: session, error: sessionError } = await supabase
      .from('diagnostic_sessions')
      .select('*')
      .eq('id', params.id)
      .single();

    if (sessionError) throw sessionError;

    const { data: result, error: resultError } = await supabase
      .from('diagnostic_results')
      .select('*')
      .eq('diagnostic_session_id', params.id)
      .single();

    if (resultError) throw resultError;

    return NextResponse.json({ session, result });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '載入診斷結果失敗' },
      { status: 500 }
    );
  }
}


