import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { getTeacherSession } from '@/lib/teacherAuth';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teacherSession = await getTeacherSession();
    if (!teacherSession.authenticated) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const supabase = supabaseServer();
    const { data: session, error } = await supabase
      .from('diagnostic_sessions')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) throw error;

    const { data: result, error: resultError } = await supabase
      .from('diagnostic_results')
      .select('*')
      .eq('diagnostic_session_id', params.id)
      .single();

    if (resultError) throw resultError;

    const { data: remediation, error: remediationError } = await supabase
      .from('remediation_actions')
      .select('*')
      .eq('diagnostic_session_id', params.id)
      .order('updated_at', { ascending: false });

    if (remediationError) throw remediationError;

    return NextResponse.json({ session, result, remediation });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '載入診斷詳情失敗' },
      { status: 500 }
    );
  }
}


