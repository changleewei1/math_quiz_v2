import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject') || 'math';

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('exam_questions')
      .select('*')
      .eq('subject', subject)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '載入題庫失敗' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, records } = body || {};

    const supabase = supabaseServer();

    if (Array.isArray(records)) {
      if (!subject) {
        return NextResponse.json({ error: '缺少 subject' }, { status: 400 });
      }

      let successCount = 0;
      const errors: string[] = [];
      const payloads: any[] = [];

      records.forEach((row: any, index: number) => {
        if (!row?.code || !row?.description || row.answer === undefined || row.answer === null) {
          errors.push(`第 ${index + 1} 筆：缺少 code / description / answer`);
          return;
        }
        payloads.push({
          id: `eq_${nanoid(12)}`,
          subject,
          year: row.year ? Number(row.year) : null,
          code: String(row.code).trim(),
          description: String(row.description).trim(),
          options: row.options ?? null,
          answer: row.answer,
          explanation: row.explanation || null,
          difficulty: row.difficulty || null,
          is_active: typeof row.is_active === 'boolean' ? row.is_active : true,
        });
      });

      if (payloads.length > 0) {
        const { data, error } = await supabase
          .from('exam_questions')
          .upsert(payloads, { onConflict: 'subject,code' })
          .select();

        if (error) throw error;
        successCount = data?.length || payloads.length;
      }

      return NextResponse.json({
        successCount,
        errorCount: errors.length,
        errors,
      });
    }

    const {
      year,
      code,
      description,
      options,
      answer,
      explanation,
      difficulty,
      is_active,
    } = body || {};

    if (!subject || !code || !description || !answer) {
      return NextResponse.json({ error: '缺少必要欄位' }, { status: 400 });
    }

    const payload = {
      id: `eq_${nanoid(12)}`,
      subject,
      year: year ? Number(year) : null,
      code,
      description,
      options: options ?? null,
      answer,
      explanation: explanation || null,
      difficulty: difficulty || null,
      is_active: typeof is_active === 'boolean' ? is_active : true,
    };

    const { data, error } = await supabase
      .from('exam_questions')
      .upsert(payload, { onConflict: 'subject,code' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '新增題目失敗' },
      { status: 500 }
    );
  }
}


