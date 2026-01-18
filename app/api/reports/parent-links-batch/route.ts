import { NextRequest, NextResponse } from 'next/server';
import { generateReportToken } from '@/lib/reportToken';
import { analyzeClassOverview } from '@/lib/reportAnalysis';
import { supabaseServer } from '@/lib/supabaseServer';
import { getTeacherSession } from '@/lib/teacherAuth';
import { verifyAdminCookie } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

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
    // 優先使用環境變數，如果未設定或設定錯誤，則根據環境自動判斷
    let baseUrl = process.env.APP_PUBLIC_BASE_URL;
    
    // 如果未設定或設定為空，則根據環境使用預設值
    if (!baseUrl || baseUrl.trim() === '') {
      if (process.env.NODE_ENV === 'production') {
        // 生產環境：嘗試從 request 獲取
        const host = request.headers.get('host');
        const protocol = request.headers.get('x-forwarded-proto') || 'https';
        baseUrl = host ? `${protocol}://${host}` : 'http://localhost:3000';
      } else {
        // 開發環境
        baseUrl = 'http://localhost:3000';
      }
    }
    
    // 確保 baseUrl 沒有尾隨斜線
    baseUrl = baseUrl.replace(/\/$/, '');
    
    const items = result.students.map(student => {
      const token = generateReportToken(student.studentId, days);
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

