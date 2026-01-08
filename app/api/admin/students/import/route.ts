import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { students } = body;

    if (!Array.isArray(students)) {
      return NextResponse.json(
        { error: 'students 必須是陣列' },
        { status: 400 }
      );
    }

    if (students.length === 0) {
      return NextResponse.json(
        { error: '請提供至少一名學生' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    const errors: string[] = [];
    const success: string[] = [];

    // 批次處理
    for (let i = 0; i < students.length; i++) {
      const student = students[i];

      // 驗證必要欄位
      if (!student.name || typeof student.name !== 'string') {
        errors.push(`第 ${i + 1} 筆：缺少或無效的 name（必須是字串）`);
        continue;
      }

      if (!student.password || typeof student.password !== 'string') {
        errors.push(`第 ${i + 1} 筆：缺少或無效的 password（必須是字串）`);
        continue;
      }

      // 計算密碼 hash
      const passwordHash = crypto.createHash('sha256').update(student.password).digest('hex');

      try {
        const { data, error: insertError } = await supabase
          .from('students')
          .insert({
            name: student.name.trim(),
            password_hash: passwordHash,
            is_active: student.is_active !== undefined ? student.is_active : true,
          })
          .select('name')
          .single();

        if (insertError) {
          if (insertError.code === '23505') {
            errors.push(`第 ${i + 1} 筆：學生「${student.name}」已存在`);
          } else {
            errors.push(`第 ${i + 1} 筆：${insertError.message}`);
          }
        } else {
          success.push(student.name);
        }
      } catch (err: any) {
        errors.push(`第 ${i + 1} 筆：${err.message || '新增失敗'}`);
      }
    }

    return NextResponse.json({
      success: true,
      total: students.length,
      successCount: success.length,
      errorCount: errors.length,
      successNames: success,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '批次匯入失敗' },
      { status: 500 }
    );
  }
}

