import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { verifyAdminCookie } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  try {
    // 驗證 admin 權限
    const adminAuth = await verifyAdminCookie();
    if (!adminAuth.authenticated) {
      return NextResponse.json(
        { error: '未授權，請先登入' },
        { status: 401 }
      );
    }

    const supabase = supabaseAdmin();
    // 管理員可以查看所有班級（包括停用的），以便管理
    const { data: classes, error } = await supabase
      .from('classes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ classes: classes || [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '取得班級列表失敗' },
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
    const { name, school_year, semester } = body;

    if (!name) {
      return NextResponse.json(
        { error: '班級名稱不能為空' },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();
    const { data, error } = await supabase
      .from('classes')
      .insert([{ name, school_year, semester }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ class: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '建立班級失敗' },
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
    const supabase = supabaseAdmin();

    const { data, error } = await supabase
      .from('classes')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ class: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '更新班級失敗' },
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

    const supabase = supabaseAdmin();
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '刪除班級失敗' },
      { status: 500 }
    );
  }
}

