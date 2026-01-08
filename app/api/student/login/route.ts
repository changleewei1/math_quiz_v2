import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { setStudentSession } from '@/lib/studentAuth';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, password } = body;

    if (!name || !password) {
      return NextResponse.json(
        { error: '請輸入姓名和密碼' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // 查詢學生
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, name, password_hash, is_active')
      .eq('name', name)
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { error: '姓名或密碼錯誤' },
        { status: 401 }
      );
    }

    if (!student.is_active) {
      return NextResponse.json(
        { error: '帳號已停用' },
        { status: 403 }
      );
    }

    // 驗證密碼（使用 SHA-256 hash）
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    
    if (passwordHash !== student.password_hash) {
      return NextResponse.json(
        { error: '姓名或密碼錯誤' },
        { status: 401 }
      );
    }

    // 設定 session
    await setStudentSession(student.id);

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        name: student.name,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '登入失敗' },
      { status: 500 }
    );
  }
}

