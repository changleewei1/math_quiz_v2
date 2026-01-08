import { NextRequest, NextResponse } from 'next/server';
import { setAdminSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      return NextResponse.json(
        { error: '伺服器設定錯誤' },
        { status: 500 }
      );
    }

    if (password !== adminPassword) {
      return NextResponse.json(
        { error: '密碼錯誤' },
        { status: 401 }
      );
    }

    await setAdminSession();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: '登入失敗' },
      { status: 500 }
    );
  }
}


