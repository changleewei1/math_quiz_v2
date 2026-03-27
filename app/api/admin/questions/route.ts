import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, supabaseServer } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get('chapterId');
    const typeId = searchParams.get('typeId');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');

    if (!chapterId || !typeId) {
      return NextResponse.json(
        { error: '缺少 chapterId 或 typeId 參數' },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();
    let query = supabase
      .from('questions')
      .select('*')
      .eq('chapter_id', chapterId)
      .eq('type_id', typeId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    if (search) {
      const escaped = search.replace(/%/g, '\\%').replace(/_/g, '\\_');
      query = query.or(`prompt.ilike.%${escaped}%,prompt_md.ilike.%${escaped}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '取得題目失敗' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
      const body = await request.json();
      const {
        chapter_id,
        type_id,
        difficulty,
        qtype,
        prompt,
        prompt_md,
        prompt_content,
        answer,
        answer_md,
        choices,
        choices_content,
        correct_choice_index,
        equation,
        tags,
        video_url,
        explain,
        explain_md,
        explain_content,
        created_at,
      } = body;

    const resolvedPrompt = prompt_md || prompt || '';
    const hasPrompt = Boolean(resolvedPrompt || prompt_content);
    if (!chapter_id || !type_id || !difficulty || !qtype || !hasPrompt || !answer) {
      return NextResponse.json(
        { error: '缺少必要欄位' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    const insertData: any = {
      chapter_id,
      type_id,
      difficulty,
      qtype,
      prompt: resolvedPrompt,
      prompt_md: prompt_md || null,
      prompt_content: prompt_content || null,
      answer,
      answer_md: answer_md || null,
      choices: choices || null,
      choices_content: choices_content || null,
      correct_choice_index: correct_choice_index || null,
      equation: equation || null,
      tags: tags || null,
      video_url: video_url || null,
      explain: explain || null,
      explain_md: explain_md || null,
      explain_content: explain_content || null,
      is_active: true,
    };

    // 如果指定了 created_at（用於插入功能），則使用它
    if (created_at) {
      insertData.created_at = created_at;
    }

    const { data, error } = await supabase
      .from('questions')
      .insert(insertData)
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


