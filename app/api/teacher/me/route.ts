import { NextRequest, NextResponse } from 'next/server';
import { getTeacherSession } from '@/lib/teacherAuth';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    const session = await getTeacherSession();
    
    if (!session.authenticated || !session.teacherId) {
      return NextResponse.json(
        { error: '未登入' },
        { status: 401 }
      );
    }

    const supabase = supabaseServer();
    const { data: teacher, error } = await supabase
      .from('teachers')
      .select('id, username, nickname, is_active')
      .eq('id', session.teacherId)
      .single();

    if (error || !teacher) {
      return NextResponse.json(
        { error: '找不到老師資料' },
        { status: 404 }
      );
    }

    if (!teacher.is_active) {
      return NextResponse.json(
        { error: '帳號已停用' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      teacher: {
        id: teacher.id,
        username: teacher.username,
        nickname: teacher.nickname,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '取得老師資訊失敗' },
      { status: 500 }
    );
  }
}

