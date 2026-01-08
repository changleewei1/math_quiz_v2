import { NextRequest, NextResponse } from 'next/server';
import { generateReportToken } from '@/lib/reportToken';
import { analyzeClassOverview } from '@/lib/reportAnalysis';
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
    const { classId, range = 'latest', days = 7 } = body;

    if (!classId) {
      return NextResponse.json(
        { error: '缺少 classId 參數' },
        { status: 400 }
      );
    }

    // 取得班級資訊和學生列表
    const result = await analyzeClassOverview(classId, range);

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      );
    }

    // 為每位學生產生連結
    const baseUrl = process.env.APP_PUBLIC_BASE_URL || 'http://localhost:3000';
    const items = result.students.map(student => {
      const token = generateReportToken(student.studentId);
      const url = `${baseUrl}/report/student/${student.studentId}?token=${token}`;
      const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

      return {
        studentId: student.studentId,
        studentName: student.studentName,
        url,
        expiresAt: expiresAt.toISOString(),
      };
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('批次產生家長連結失敗:', error);
    return NextResponse.json(
      { error: error.message || '批次產生家長連結失敗' },
      { status: 500 }
    );
  }
}

