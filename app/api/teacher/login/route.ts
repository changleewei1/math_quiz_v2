import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { setTeacherSession } from '@/lib/teacherAuth';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: '請輸入帳號和密碼' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // 查詢老師
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('id, username, password_hash, nickname, is_active')
      .eq('username', username)
      .single();

    if (teacherError || !teacher) {
      return NextResponse.json(
        { error: '帳號或密碼錯誤' },
        { status: 401 }
      );
    }

    if (!teacher.is_active) {
      return NextResponse.json(
        { error: '帳號已停用' },
        { status: 403 }
      );
    }

    // 驗證密碼（使用 SHA-256 hash）
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    
    if (passwordHash !== teacher.password_hash) {
      return NextResponse.json(
        { error: '帳號或密碼錯誤' },
        { status: 401 }
      );
    }

    // 設定 session
    await setTeacherSession(teacher.id);

    return NextResponse.json({
      success: true,
      teacher: {
        id: teacher.id,
        username: teacher.username,
        nickname: teacher.nickname,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '登入失敗' },
      { status: 500 }
    );
  }
}

