import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { verifyAdminCookie } from '@/lib/adminAuth';

// 取得學生所屬的班級列表
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
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { error: '缺少 studentId 參數' },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();
    const { data: studentClasses, error } = await supabase
      .from('class_members')
      .select('class_id')
      .eq('student_id', studentId)
      .eq('is_active', true);

    if (error) throw error;

    const classIds = (studentClasses || []).map((sc: any) => sc.class_id);
    
    return NextResponse.json({ classIds });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '取得學生所屬的班級失敗' },
      { status: 500 }
    );
  }
}

// 更新學生所屬的班級
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
    const { studentId, classIds } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: '缺少 studentId 參數' },
        { status: 400 }
      );
    }

    if (!Array.isArray(classIds)) {
      return NextResponse.json(
        { error: 'classIds 必須是陣列' },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();

    // 先停用所有現有關聯（軟刪除）
    const { error: deactivateError } = await supabase
      .from('class_members')
      .update({ is_active: false })
      .eq('student_id', studentId);

    if (deactivateError) throw deactivateError;

    // 插入新的關聯（如果有的話）
    if (classIds.length > 0) {
      // 檢查哪些關聯已存在，如果存在則重新啟用，否則新增
      for (const classId of classIds) {
        // 檢查是否已存在（即使 is_active = false）
        const { data: existing } = await supabase
          .from('class_members')
          .select('id')
          .eq('student_id', studentId)
          .eq('class_id', classId)
          .maybeSingle();

        if (existing) {
          // 重新啟用
          const { error: updateError } = await supabase
            .from('class_members')
            .update({ is_active: true })
            .eq('id', existing.id);

          if (updateError) throw updateError;
        } else {
          // 新增
          const { error: insertError } = await supabase
            .from('class_members')
            .insert({
              student_id: studentId,
              class_id: classId,
              is_active: true,
            });

          if (insertError) throw insertError;
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '更新學生所屬的班級失敗' },
      { status: 500 }
    );
  }
}

