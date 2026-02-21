import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chapterId, typeId, questions, clearFirst } = body;

    if (!chapterId || !typeId || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: '缺少必要參數或 questions 不是陣列' },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();

    // 可選：先清空
    if (clearFirst) {
      const { error: deleteError } = await supabase
        .from('questions')
        .delete()
        .eq('chapter_id', chapterId)
        .eq('type_id', typeId);

      if (deleteError) throw deleteError;
    }

    // 批次插入
    const questionsToInsert = questions.map((q: any) => {
      const resolvedPrompt = q.prompt_md || q.prompt;
      return {
      chapter_id: chapterId,
      type_id: typeId,
      difficulty: q.difficulty,
      qtype: q.qtype,
      prompt: resolvedPrompt,
      prompt_md: q.prompt_md || null,
      answer: q.answer,
      answer_md: q.answer_md || null,
      choices: q.choices || null,
      correct_choice_index: q.correct_choice_index ?? null,
      equation: q.equation || null,
      tags: q.tags || null,
      video_url: q.video_url || null,
      explain: q.explain || null,
      explain_md: q.explain_md || null,
      is_active: true,
    };
    });

    const { data, error } = await supabase
      .from('questions')
      .insert(questionsToInsert)
      .select();

    if (error) {
      // 提供更詳細的錯誤訊息
      return NextResponse.json(
        { 
          error: error.message || '批次新增失敗',
          details: error.details || null
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      count: data?.length || 0 
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '匯入失敗' },
      { status: 500 }
    );
  }
}


