import { NextRequest, NextResponse } from 'next/server';
import { getTeacherSession } from '@/lib/teacherAuth';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    // 驗證老師權限
    const session = await getTeacherSession();
    
    if (!session.authenticated || !session.teacherId) {
      return NextResponse.json(
        { error: '未授權，請先登入' },
        { status: 401 }
      );
    }

    const supabase = supabaseServer();

    // 取得該老師管理的班級
    const { data: teacherClasses, error: tcError } = await supabase
      .from('teacher_classes')
      .select('class_id, classes(id, name, school_year, semester)')
      .eq('teacher_id', session.teacherId);

    if (tcError) throw tcError;

    // 提取班級資料
    const classes = (teacherClasses || [])
      .map((tc: any) => tc.classes)
      .filter(Boolean)
      .map((cls: any) => ({
        id: cls.id,
        name: cls.name,
        school_year: cls.school_year,
        semester: cls.semester,
      }));

    return NextResponse.json({ classes });
  } catch (error: any) {
    console.error('取得班級列表失敗:', error);
    return NextResponse.json(
      { error: error.message || '取得班級列表失敗' },
      { status: 500 }
    );
  }
}

