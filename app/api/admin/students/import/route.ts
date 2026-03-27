import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * 延後建立 Supabase client，避免在 import / build collect page data 階段
 * 因缺少環境變數而拋錯（舊版 @/lib/supabaseServer 會在模組頂層 throw）。
 */
function createSupabaseForImport() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url?.trim() || !anon?.trim()) {
    return { ok: false as const, message: '伺服器未設定 NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY' };
  }
  const key = service?.trim() || anon;
  return {
    ok: true as const,
    client: createClient(url, key, {
      auth: { persistSession: false },
    }),
  };
}

export async function POST(request: NextRequest) {
  const supabaseInit = createSupabaseForImport();
  if (!supabaseInit.ok) {
    return NextResponse.json({ error: supabaseInit.message }, { status: 500 });
  }
  const supabase = supabaseInit.client;

  try {
    const body = await request.json();
    const { students } = body;

    if (!Array.isArray(students)) {
      return NextResponse.json({ error: 'students 必須是陣列' }, { status: 400 });
    }

    if (students.length === 0) {
      return NextResponse.json({ error: '請提供至少一名學生' }, { status: 400 });
    }

    const errors: string[] = [];
    const success: string[] = [];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];

      if (!student.name || typeof student.name !== 'string') {
        errors.push(`第 ${i + 1} 筆：缺少或無效的 name（必須是字串）`);
        continue;
      }

      if (!student.password || typeof student.password !== 'string') {
        errors.push(`第 ${i + 1} 筆：缺少或無效的 password（必須是字串）`);
        continue;
      }

      const passwordHash = crypto.createHash('sha256').update(student.password).digest('hex');

      try {
        const { error: insertError } = await supabase
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
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : '新增失敗';
        errors.push(`第 ${i + 1} 筆：${msg}`);
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '批次匯入失敗';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
