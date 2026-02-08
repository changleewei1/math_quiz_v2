import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { getStudentSession } from '@/lib/studentAuth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, exam_year } = body || {};

    if (!subject || !exam_year) {
      return NextResponse.json(
        { error: '缺少 subject 或 exam_year' },
        { status: 400 }
      );
    }

    const studentId = await getStudentSession();
    const supabase = supabaseServer();

    const { data: session, error } = await supabase
      .from('student_sessions')
      .insert({
        mode: 'diagnostic',
        subject,
        quiz_mode: 'mock_exam',
        exam_year: Number(exam_year),
        source: 'CAP',
        student_id: studentId,
        settings: { source: 'CAP' },
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ session });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '建立測驗失敗' },
      { status: 500 }
    );
  }
}

