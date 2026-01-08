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
      .from('students')
      .select('id, name, is_active, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '取得學生列表失敗' },
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
      .from('students')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '刪除學生失敗' },
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
    const { name, password, is_active } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: '缺少或無效的 name（必須是非空字串）' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || !password.trim()) {
      return NextResponse.json(
        { error: '缺少或無效的 password（必須是非空字串）' },
        { status: 400 }
      );
    }

    // 計算密碼 hash
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('students')
      .insert({
        name: name.trim(),
        password_hash: passwordHash,
        is_active: is_active !== undefined ? is_active : true,
      })
      .select('id, name, is_active, created_at')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: `學生「${name}」已存在` },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '新增學生失敗' },
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
    const updateData: any = { ...body };
    if (body.password) {
      updateData.password_hash = crypto.createHash('sha256').update(body.password).digest('hex');
      delete updateData.password;
    }

    const { data, error } = await supabase
      .from('students')
      .update(updateData)
      .eq('id', id)
      .select('id, name, is_active, created_at')
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '更新學生失敗' },
      { status: 500 }
    );
  }
}

