import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { verifyAdminCookie } from '@/lib/adminAuth';
import crypto from 'crypto';

export async function GET() {
  try {
    // 驗證 admin 權限
    const adminAuth = await verifyAdminCookie();
    if (!adminAuth.authenticated) {
      return NextResponse.json(
        { error: '未授權，請先登入' },
        { status: 401 }
      );
    }

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('teachers')
      .select('id, username, nickname, is_active, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '取得老師列表失敗' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 驗證 admin 權限
    const adminAuth = await verifyAdminCookie();
    if (!adminAuth.authenticated) {
      return NextResponse.json(
        { error: '未授權，請先登入' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { username, password, nickname, is_active } = body;

    if (!username || typeof username !== 'string' || !username.trim()) {
      return NextResponse.json(
        { error: '缺少或無效的 username（必須是非空字串）' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || !password.trim()) {
      return NextResponse.json(
        { error: '缺少或無效的 password（必須是非空字串）' },
        { status: 400 }
      );
    }

    if (!nickname || typeof nickname !== 'string' || !nickname.trim()) {
      return NextResponse.json(
        { error: '缺少或無效的 nickname（必須是非空字串）' },
        { status: 400 }
      );
    }

    // 計算密碼 hash
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('teachers')
      .insert({
        username: username.trim(),
        password_hash: passwordHash,
        nickname: nickname.trim(),
        is_active: is_active !== undefined ? is_active : true,
      })
      .select('id, username, nickname, is_active, created_at')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: `帳號「${username}」已存在` },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '新增老師失敗' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // 驗證 admin 權限
    const adminAuth = await verifyAdminCookie();
    if (!adminAuth.authenticated) {
      return NextResponse.json(
        { error: '未授權，請先登入' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '缺少 id 參數' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const supabase = supabaseServer();

    // 如果更新密碼，需要重新 hash
    if (body.password) {
      body.password_hash = crypto.createHash('sha256').update(body.password).digest('hex');
      delete body.password;
    }

    const { data, error } = await supabase
      .from('teachers')
      .update(body)
      .eq('id', id)
      .select('id, username, nickname, is_active, created_at')
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '更新老師失敗' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 驗證 admin 權限
    const adminAuth = await verifyAdminCookie();
    if (!adminAuth.authenticated) {
      return NextResponse.json(
        { error: '未授權，請先登入' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '缺少 id 參數' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    const { error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '刪除老師失敗' },
      { status: 500 }
    );
  }
}

