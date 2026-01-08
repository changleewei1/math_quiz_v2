import { NextRequest, NextResponse } from 'next/server';
import { analyzeClassOverview, enrichTypeStatistics } from '@/lib/reportAnalysis';
import { supabaseServer } from '@/lib/supabaseServer';
import { getTeacherSession } from '@/lib/teacherAuth';
import { verifyAdminCookie } from '@/lib/adminAuth';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { classId, range = 'latest', selectedTypeIds } = body;

    if (!classId || !selectedTypeIds || !Array.isArray(selectedTypeIds) || selectedTypeIds.length === 0) {
      return NextResponse.json(
        { error: '缺少必要參數' },
        { status: 400 }
      );
    }

    // 取得班級總覽資料
    const result = await analyzeClassOverview(classId, range);

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      );
    }

    const supabase = supabaseServer();

    // 建立補救名單
    const remedialStudentsMap = new Map<string, {
      studentId: string;
      studentName: string;
      remedialTypes: Array<{ typeCode: string; typeName: string }>;
      overallAccuracy: number;
      latestSessionDate: string | null;
    }>();

    // 遍歷每位學生，檢查是否在選定的題型中有弱點（wrong >= 2）
    for (const student of result.students) {
      if (!student.hasReport) continue;

      // 取得該學生的完整統計資料（需要重新查詢）
      let query = supabase
        .from('student_sessions')
        .select('id, started_at')
        .eq('student_id', student.studentId)
        .eq('mode', 'diagnostic');
      
      if (range === '30d') {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('started_at', thirtyDaysAgo);
      }
      
      const { data: sessions } = await query.order('started_at', { ascending: false }).limit(1);

      if (!sessions || sessions.length === 0) continue;

      const session = sessions[0];

      // 取得該 session 的作答記錄
      const { data: attempts } = await supabase
        .from('question_attempts')
        .select('*')
        .eq('session_id', session.id);

      if (!attempts || attempts.length === 0) continue;

      // 取得題型資訊
      const typeIds = [...new Set(attempts.map((a: any) => a.type_id).filter(Boolean))];
      const { data: types } = await supabase
        .from('question_types')
        .select('id, code, name')
        .in('id', typeIds);

      const typeMap = new Map(types?.map(t => [t.id, t]) || []);

      // 依題型統計
      const typeStatsMap = new Map<string, { wrong: number; typeCode: string; typeName: string }>();

      for (const attempt of attempts) {
        if (!attempt.type_id) continue;
        if (!selectedTypeIds.includes(attempt.type_id)) continue; // 只檢查選定的題型

        const type = typeMap.get(attempt.type_id);
        if (!type) continue;

        if (!typeStatsMap.has(attempt.type_id)) {
          typeStatsMap.set(attempt.type_id, {
            wrong: 0,
            typeCode: type.code,
            typeName: type.name,
          });
        }

        const stats = typeStatsMap.get(attempt.type_id)!;
        if (!attempt.is_correct) {
          stats.wrong++;
        }
      }

      // 找出弱點題型（wrong >= 2）
      const remedialTypes = Array.from(typeStatsMap.values())
        .filter(stat => stat.wrong >= 2)
        .map(stat => ({ typeCode: stat.typeCode, typeName: stat.typeName }));

      if (remedialTypes.length > 0) {
        remedialStudentsMap.set(student.studentId, {
          studentId: student.studentId,
          studentName: student.studentName,
          remedialTypes,
          overallAccuracy: student.overallAccuracy,
          latestSessionDate: student.latestSessionDate,
        });
      }
    }

    const remedialStudents = Array.from(remedialStudentsMap.values());

    // 生成 CSV
    const baseUrl = process.env.APP_PUBLIC_BASE_URL || 'http://localhost:3000';
    const csvRows = [
      ['學生ID', '學生姓名', '需要補救的題型', '總正確率', '最新測驗日期', '報告連結'].join(','),
      ...remedialStudents.map(s => {
        const remedialTypesStr = s.remedialTypes.map(t => t.typeCode).join('、');
        const reportUrl = `${baseUrl}/teacher/class/${classId}/student/${s.studentId}`;
        const dateStr = s.latestSessionDate 
          ? new Date(s.latestSessionDate).toLocaleDateString('zh-TW')
          : '';
        return [
          s.studentId,
          s.studentName,
          `"${remedialTypesStr}"`,
          `${Math.round(s.overallAccuracy * 10) / 10}%`,
          dateStr,
          reportUrl,
        ].join(',');
      }),
    ];

    const csvText = csvRows.join('\n');

    return NextResponse.json({
      remedialStudents,
      csvText,
    });
  } catch (error: any) {
    console.error('產生補救名單失敗:', error);
    return NextResponse.json(
      { error: error.message || '產生補救名單失敗' },
      { status: 500 }
    );
  }
}

