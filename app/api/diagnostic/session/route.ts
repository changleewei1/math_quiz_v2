import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { supabaseServer } from '@/lib/supabaseServer';
import { getStudentSession } from '@/lib/studentAuth';
import { buildDiagnosticTest } from '@/lib/diagnostic/buildDiagnosticTest';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, scope_type, scope_ref, total_questions } = body || {};

    if (!subject || !scope_type || !scope_ref) {
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 });
    }

    const parsedTotal = Number(total_questions || 20);
    const studentId = await getStudentSession();
    const sessionId = `ds_${nanoid(12)}`;

    const { questionIds, scopeRef } = await buildDiagnosticTest({
      student_id: studentId,
      subject,
      scope_type,
      scope_ref,
      total_questions: parsedTotal,
    });

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('diagnostic_sessions')
      .insert({
        id: sessionId,
        student_id: studentId,
        subject,
        scope_type,
        scope_ref: {
          ...scopeRef,
          question_ids: questionIds,
        },
        total_questions: parsedTotal,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      session: data,
      questionCount: questionIds.length,
      missing: Boolean(scopeRef?.missing),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '建立診斷階段失敗' },
      { status: 500 }
    );
  }
}


