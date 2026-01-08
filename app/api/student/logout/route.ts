import { NextRequest, NextResponse } from 'next/server';
import { clearStudentSession } from '@/lib/studentAuth';

export async function POST(request: NextRequest) {
  try {
    await clearStudentSession();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '登出失敗' },
      { status: 500 }
    );
  }
}

