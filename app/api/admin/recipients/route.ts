import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET() {
  try {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('student_recipients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '取得接收者列表失敗' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student_id, role, line_user_id } = body;

    if (!student_id || !role || !line_user_id) {
      return NextResponse.json(
        { error: '缺少必要欄位：student_id, role, line_user_id' },
        { status: 400 }
      );
    }

    if (role !== 'parent' && role !== 'teacher') {
      return NextResponse.json(
        { error: 'role 必須是 "parent" 或 "teacher"' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('student_recipients')
      .insert({
        student_id,
        role,
        line_user_id,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: '該接收者已存在' },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '新增接收者失敗' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
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
    const { data, error } = await supabase
      .from('student_recipients')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '更新接收者失敗' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
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
      .from('student_recipients')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '刪除接收者失敗' },
      { status: 500 }
    );
  }
}

