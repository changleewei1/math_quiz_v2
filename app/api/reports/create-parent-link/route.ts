import { NextRequest, NextResponse } from 'next/server';
import { generateReportToken } from '@/lib/reportToken';
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
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: '缺少 studentId 參數' },
        { status: 400 }
      );
    }

    // 驗證學生是否存在
    const supabase = supabaseServer();
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, name')
      .eq('id', studentId)
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { error: '找不到該學生' },
        { status: 404 }
      );
    }

    // 取得 days 參數（預設 7 天）
    const { days = 7 } = body;

    // 生成 token（使用自訂天數）
    const token = generateReportToken(studentId, days);

    // 生成完整 URL
    const baseUrl = process.env.APP_PUBLIC_BASE_URL || 'http://localhost:3000';
    const reportUrl = `${baseUrl}/report/student/${studentId}?token=${token}`;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    return NextResponse.json({
      success: true,
      token,
      url: reportUrl,
      reportUrl, // 保留舊欄位以相容
      studentName: student.name,
      expiresAt: expiresAt.toISOString(),
      expiresIn: `${days}天`,
    });
  } catch (error: any) {
    console.error('產生家長連結失敗:', error);
    return NextResponse.json(
      { error: error.message || '產生家長連結失敗' },
      { status: 500 }
    );
  }
}

