import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
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

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json(
        { error: '缺少 classId 參數' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    const { data: members, error } = await supabase
      .from('class_members')
      .select('*, students(id, name)')
      .eq('class_id', classId)
      .eq('is_active', true);

    if (error) throw error;

    return NextResponse.json({ members: members || [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '取得班級成員失敗' },
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
    const { class_id, student_id, student_number } = body;

    if (!class_id || !student_id) {
      return NextResponse.json(
        { error: '缺少必要參數' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('class_members')
      .insert([{ class_id, student_id, student_number }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ member: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '加入班級成員失敗' },
      { status: 500 }
    );
  }
}

