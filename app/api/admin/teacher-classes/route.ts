import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { verifyAdminCookie } from '@/lib/adminAuth';

// 取得老師管理的班級列表
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
    const teacherId = searchParams.get('teacherId');

    if (!teacherId) {
      return NextResponse.json(
        { error: '缺少 teacherId 參數' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    const { data: teacherClasses, error } = await supabase
      .from('teacher_classes')
      .select('class_id')
      .eq('teacher_id', teacherId);

    if (error) throw error;

    const classIds = (teacherClasses || []).map((tc: any) => tc.class_id);
    
    return NextResponse.json({ classIds });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '取得老師管理的班級失敗' },
      { status: 500 }
    );
  }
}

// 更新老師管理的班級
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
    const { teacherId, classIds } = body;

    if (!teacherId) {
      return NextResponse.json(
        { error: '缺少 teacherId 參數' },
        { status: 400 }
      );
    }

    if (!Array.isArray(classIds)) {
      return NextResponse.json(
        { error: 'classIds 必須是陣列' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // 刪除現有關聯
    const { error: deleteError } = await supabase
      .from('teacher_classes')
      .delete()
      .eq('teacher_id', teacherId);

    if (deleteError) throw deleteError;

    // 插入新的關聯
    if (classIds.length > 0) {
      const newRelations = classIds.map((classId: string) => ({
        teacher_id: teacherId,
        class_id: classId,
      }));

      const { error: insertError } = await supabase
        .from('teacher_classes')
        .insert(newRelations);

      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '更新老師管理的班級失敗' },
      { status: 500 }
    );
  }
}

