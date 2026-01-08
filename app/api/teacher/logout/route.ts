import { NextRequest, NextResponse } from 'next/server';
import { clearTeacherSession } from '@/lib/teacherAuth';

export async function POST(request: NextRequest) {
  await clearTeacherSession();
  return NextResponse.json({ success: true });
}

