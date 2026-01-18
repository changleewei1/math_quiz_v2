import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { getTeacherSession } from '@/lib/teacherAuth';

export async function GET(_request: NextRequest) {
  try {
    const teacherSession = await getTeacherSession();
    if (!teacherSession.authenticated) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const supabase = supabaseServer();
    const { data: sessions, error } = await supabase
      .from('diagnostic_sessions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const studentIds = Array.from(
      new Set((sessions || []).map((s: any) => s.student_id).filter(Boolean))
    );

    let studentMap = new Map<string, any>();
    if (studentIds.length > 0) {
      const { data: students, error: studentError } = await supabase
        .from('students')
        .select('id, name')
        .in('id', studentIds);
      if (studentError) throw studentError;
      studentMap = new Map((students || []).map((s: any) => [s.id, s]));
    }

    const rows = (sessions || []).map((session: any) => ({
      ...session,
      student: session.student_id ? studentMap.get(session.student_id) || null : null,
    }));

    return NextResponse.json({ data: rows });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '載入診斷列表失敗' },
      { status: 500 }
    );
  }
}


