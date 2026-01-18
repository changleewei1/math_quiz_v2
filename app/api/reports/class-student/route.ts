import { NextRequest, NextResponse } from 'next/server';
import { analyzeStudentLatestSession, analyzeClassOverview, enrichTypeStatistics } from '@/lib/reportAnalysis';
import { supabaseServer } from '@/lib/supabaseServer';
import { getTeacherSession } from '@/lib/teacherAuth';
import { verifyAdminCookie } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 驗證老師或管理員權限
    const teacherSession = await getTeacherSession();
    const adminAuth = await verifyAdminCookie();
    
    if (!teacherSession.authenticated && !adminAuth.authenticated) {
      return NextResponse.json(
        { error: '未授權，請先登入' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const studentId = searchParams.get('studentId');

    if (!classId || !studentId) {
      return NextResponse.json(
        { error: '缺少 classId 或 studentId 參數' },
        { status: 400 }
      );
    }

    // 驗證學生是否屬於該班級
    const supabase = supabaseServer();
    const { data: member } = await supabase
      .from('class_members')
      .select('*')
      .eq('class_id', classId)
      .eq('student_id', studentId)
      .single();

    if (!member) {
      return NextResponse.json(
        { error: '該學生不屬於此班級' },
        { status: 404 }
      );
    }

    // 取得學生報表
    const studentResult = await analyzeStudentLatestSession(studentId);
    if ('error' in studentResult) {
      return NextResponse.json(
        { error: studentResult.error },
        { status: 404 }
      );
    }

    // 取得班級平均（只取正確率）
    const classResult = await analyzeClassOverview(classId);
    if ('error' in classResult) {
      return NextResponse.json(
        { error: classResult.error },
        { status: 404 }
      );
    }

    // 補齊題型資訊
    const enrichedTypeStats = await enrichTypeStatistics(studentResult.typeStatistics);
    const enrichedTopWeakTypes = await enrichTypeStatistics(studentResult.topWeakTypes);

    // 建立班平均對照資料
    const classAvgByType = classResult.classSummaryByType.map(summary => ({
      typeId: summary.typeId,
      typeCode: summary.typeCode,
      typeName: summary.typeName,
      avgAccuracy: summary.avgAccuracy,
    }));

    return NextResponse.json({
      studentReport: {
        latestSession: {
          id: studentResult.session.id,
          chapterId: studentResult.chapterId,
          chapterTitle: studentResult.chapterTitle,
          subject: studentResult.session.subject || 'math',
          quizMode: studentResult.session.quiz_mode || 'daily_practice',
          startedAt: studentResult.session.started_at,
          endedAt: studentResult.session.ended_at,
        },
        statsByType: enrichedTypeStats,
        topWeakTypes: enrichedTopWeakTypes,
        totalQuestions: studentResult.totalQuestions,
        correctQuestions: studentResult.correctQuestions,
        overallAccuracy: studentResult.overallAccuracy,
      },
      classAvgByType,
    });
  } catch (error: any) {
    console.error('取得班級學生報表失敗:', error);
    return NextResponse.json(
      { error: error.message || '取得班級學生報表失敗' },
      { status: 500 }
    );
  }
}

