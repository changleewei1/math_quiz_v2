import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject') || 'math';
    const year = searchParams.get('year');

    const supabase = supabaseServer();
    let query = supabase
      .from('exam_questions')
      .select('*')
      .eq('subject', subject)
      .order('exam_year', { ascending: false })
      .order('question_no', { ascending: true })
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(500);

    if (year) {
      query = query.eq('exam_year', Number(year));
    }

    const { data, error } = await query;

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
    const { subject, records, exam_year } = body || {};

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
        const resolvedYear = row.exam_year ?? row.year ?? exam_year;
        payloads.push({
          id: `eq_${nanoid(12)}`,
          subject,
          source: row.source || 'CAP',
          exam_year: resolvedYear ? Number(resolvedYear) : null,
          year: resolvedYear ? Number(resolvedYear) : null,
          code: String(row.code).trim(),
          description: String(row.description).trim(),
          description_md: row.description_md ? String(row.description_md) : null,
          options: row.options ?? null,
          answer: row.answer,
          explanation: row.explanation || null,
          explanation_md: row.explanation_md ? String(row.explanation_md) : null,
          difficulty: row.difficulty || null,
          question_no: row.question_no ? Number(row.question_no) : null,
          order_index: row.order_index ? Number(row.order_index) : null,
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
      exam_year,
      source,
      code,
      description,
      description_md,
      options,
      answer,
      explanation,
      explanation_md,
      difficulty,
      is_active,
    } = body || {};

    if (!subject || !code || !description || !answer) {
      return NextResponse.json({ error: '缺少必要欄位' }, { status: 400 });
    }

    const payload = {
      id: `eq_${nanoid(12)}`,
      subject,
      source: source || 'CAP',
      exam_year: exam_year ? Number(exam_year) : year ? Number(year) : null,
      year: year ? Number(year) : exam_year ? Number(exam_year) : null,
      code,
      description,
      description_md: description_md || null,
      options: options ?? null,
      answer,
      explanation: explanation || null,
      explanation_md: explanation_md || null,
      difficulty: difficulty || null,
      question_no: body?.question_no ? Number(body.question_no) : null,
      order_index: body?.order_index ? Number(body.order_index) : null,
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

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      subject,
      year,
      exam_year,
      source,
      question_no,
      order_index,
      code,
      description,
      description_md,
      options,
      answer,
      explanation,
      explanation_md,
      difficulty,
      is_active,
    } = body || {};

    if (!id) {
      return NextResponse.json({ error: '缺少 id' }, { status: 400 });
    }
    if (!code || !description || answer === undefined || answer === null) {
      return NextResponse.json({ error: '缺少必要欄位' }, { status: 400 });
    }

    const supabase = supabaseServer();

    const resolvedYear = exam_year ?? year;
    const payload = {
      source: source || 'CAP',
      exam_year: resolvedYear ? Number(resolvedYear) : null,
      year: resolvedYear ? Number(resolvedYear) : null,
      question_no: question_no ? Number(question_no) : null,
      order_index: order_index ? Number(order_index) : null,
      code,
      description,
      description_md: description_md || null,
      options: options ?? null,
      answer,
      explanation: explanation || null,
      explanation_md: explanation_md || null,
      difficulty: difficulty || null,
      is_active: typeof is_active === 'boolean' ? is_active : true,
    };

    let query = supabase.from('exam_questions').update(payload).eq('id', id);
    if (subject) {
      query = query.eq('subject', subject);
    }

    const { data, error } = await query.select().single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '更新失敗' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { id, ids, subject } = body || {};

    const supabase = supabaseServer();

    if (Array.isArray(ids) && ids.length > 0) {
      const { error } = await supabase
        .from('exam_questions')
        .delete()
        .in('id', ids)
        .eq('subject', subject || 'math');

      if (error) throw error;
      return NextResponse.json({ deletedCount: ids.length });
    }

    if (!id) {
      return NextResponse.json({ error: '缺少 id' }, { status: 400 });
    }

    const { error } = await supabase
      .from('exam_questions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ deletedCount: 1 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '刪除失敗' },
      { status: 500 }
    );
  }
}


