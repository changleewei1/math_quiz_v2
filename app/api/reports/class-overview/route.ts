import { NextRequest, NextResponse } from 'next/server';
import { analyzeClassOverview, enrichTypeStatistics } from '@/lib/reportAnalysis';
import { supabaseServer } from '@/lib/supabaseServer';
import { getTeacherSession } from '@/lib/teacherAuth';
import { verifyAdminCookie } from '@/lib/adminAuth';

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
    const range = (searchParams.get('range') || 'latest') as 'latest' | '30d';

    if (!classId) {
      return NextResponse.json(
        { error: '缺少 classId 參數' },
        { status: 400 }
      );
    }

    if (range !== 'latest' && range !== '30d') {
      return NextResponse.json(
        { error: 'range 參數必須是 latest 或 30d' },
        { status: 400 }
      );
    }

    // 取得班級資訊
    const supabase = supabaseServer();
    const { data: classInfo } = await supabase
      .from('classes')
      .select('id, name, school_year, semester')
      .eq('id', classId)
      .single();

    if (!classInfo) {
      return NextResponse.json(
        { error: '找不到班級' },
        { status: 404 }
      );
    }

    // 分析班級總覽
    const result = await analyzeClassOverview(classId, range);

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      );
    }

    // 補齊題型資訊
    const enrichedClassSummary = await enrichTypeStatistics(
      result.classSummaryByType.map(s => ({
        typeId: s.typeId,
        typeCode: s.typeCode,
        typeName: s.typeName,
        total: 0,
        correct: 0,
        wrong: 0,
        accuracy: s.avgAccuracy,
        byDifficulty: {
          easy: { total: 0, correct: 0 },
          medium: { total: 0, correct: 0 },
          hard: { total: 0, correct: 0 },
        },
        priority: s.priority,
        recommendation: '',
      }))
    );

    const enrichedTopWeakTypes = await enrichTypeStatistics(
      result.topWeakTypes.map(s => ({
        typeId: s.typeId,
        typeCode: s.typeCode,
        typeName: s.typeName,
        total: 0,
        correct: 0,
        wrong: 0,
        accuracy: s.avgAccuracy,
        byDifficulty: {
          easy: { total: 0, correct: 0 },
          medium: { total: 0, correct: 0 },
          hard: { total: 0, correct: 0 },
        },
        priority: s.priority,
        recommendation: '',
      }))
    );

    return NextResponse.json({
      classInfo: {
        id: classInfo.id,
        name: classInfo.name,
        schoolYear: classInfo.school_year,
        semester: classInfo.semester,
      },
      range, // 回傳使用的時間範圍
      classSummaryByType: enrichedClassSummary.map((stat, idx) => ({
        ...stat,
        avgAccuracy: result.classSummaryByType[idx].avgAccuracy,
        weakCount: result.classSummaryByType[idx].weakCount,
        avgWrong: result.classSummaryByType[idx].avgWrong,
      })),
      topWeakTypes: enrichedTopWeakTypes.map((stat, idx) => ({
        ...stat,
        avgAccuracy: result.topWeakTypes[idx].avgAccuracy,
        weakCount: result.topWeakTypes[idx].weakCount,
        avgWrong: result.topWeakTypes[idx].avgWrong,
      })),
      students: result.students,
    });
  } catch (error: any) {
    console.error('取得班級總覽失敗:', error);
    return NextResponse.json(
      { error: error.message || '取得班級總覽失敗' },
      { status: 500 }
    );
  }
}

