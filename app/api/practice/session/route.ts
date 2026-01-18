import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { getStudentSession } from '@/lib/studentAuth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chapterId, typeId, skillId } = body;

    if ((!chapterId || !typeId) && !skillId) {
      return NextResponse.json(
        { error: '缺少必要參數' },
        { status: 400 }
      );
    }

    // 取得學生 ID（如果已登入）
    const studentId = await getStudentSession();

    const supabase = supabaseServer();

    const { data: session, error } = await supabase
      .from('student_sessions')
      .insert({
        mode: 'practice',
        chapter_id: chapterId || null,
        type_id: typeId || null,
        student_id: studentId,
        settings: skillId ? { skillId } : {},
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ session });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '建立練習階段失敗' },
      { status: 500 }
    );
  }
}


