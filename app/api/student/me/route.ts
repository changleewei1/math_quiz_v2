import { NextRequest, NextResponse } from 'next/server';
import { getStudentSession } from '@/lib/studentAuth';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    const studentId = await getStudentSession();

    if (!studentId) {
      return NextResponse.json(
        { error: '未登入' },
        { status: 401 }
      );
    }

    const supabase = supabaseServer();
    const { data: student, error } = await supabase
      .from('students')
      .select('id, name, is_active')
      .eq('id', studentId)
      .single();

    if (error || !student) {
      return NextResponse.json(
        { error: '找不到學生資料' },
        { status: 404 }
      );
    }

    if (!student.is_active) {
      return NextResponse.json(
        { error: '帳號已停用' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '取得學生資料失敗' },
      { status: 500 }
    );
  }
}

