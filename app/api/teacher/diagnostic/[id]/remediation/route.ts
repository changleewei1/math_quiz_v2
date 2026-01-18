import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { supabaseServer } from '@/lib/supabaseServer';
import { getTeacherSession } from '@/lib/teacherAuth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teacherSession = await getTeacherSession();
    if (!teacherSession.authenticated || !teacherSession.teacherId) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const body = await request.json();
    const { student_id, chapter_id, action_type, action_payload } = body || {};

    if (!student_id || !chapter_id || !action_type) {
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 });
    }

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('remediation_actions')
      .insert({
        id: `ra_${nanoid(12)}`,
        diagnostic_session_id: params.id,
        student_id,
        chapter_id,
        assigned_by_teacher_id: teacherSession.teacherId,
        action_type,
        action_payload: action_payload || {},
        status: 'assigned',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '指派補救失敗' },
      { status: 500 }
    );
  }
}


