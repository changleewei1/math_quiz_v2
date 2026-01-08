import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chapterId } = body;

    if (!chapterId) {
      return NextResponse.json(
        { error: '缺少 chapterId' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // 取得該章節所有題型
    const { data: types, error: typesError } = await supabase
      .from('question_types')
      .select('*')
      .eq('chapter_id', chapterId)
      .eq('is_active', true)
      .order('sort_order');

    if (typesError) throw typesError;

    if (!types || types.length === 0) {
      return NextResponse.json(
        { error: '該章節沒有可用題型' },
        { status: 400 }
      );
    }

    // 固定出 9 題：easy、medium、hard 各 3 題
    const paper: any[] = [];
    const warnings: string[] = [];
    const difficultyCounts = { easy: 3, medium: 3, hard: 3 };

    // 為每種難度各抽 3 題（從所有題型中隨機選擇）
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      const needed = difficultyCounts[difficulty];
      let selected = 0;

      // 取得該難度的所有題目（從所有題型）
      const typeIds = types.map(t => t.id);
      const { data: allQuestions, error: allQError } = await supabase
        .from('questions')
        .select('*')
        .eq('chapter_id', chapterId)
        .eq('difficulty', difficulty)
        .eq('is_active', true)
        .in('type_id', typeIds);

      if (allQError) throw allQError;

      if (!allQuestions || allQuestions.length === 0) {
        warnings.push(`${difficulty} 難度題目不足，需要 ${needed} 題但找不到任何題目`);
        continue;
      }

      // 如果題目數量不足，發出警告但盡可能選擇
      if (allQuestions.length < needed) {
        warnings.push(`${difficulty} 難度題目不足，需要 ${needed} 題但只有 ${allQuestions.length} 題`);
      }

      // 隨機打亂題目順序
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);

      // 選擇所需的題目數量（最多 3 題）
      for (let i = 0; i < Math.min(needed, shuffled.length); i++) {
        const question = shuffled[i];
        const type = types.find(t => t.id === question.type_id);
        
        if (type) {
          paper.push({
            ...question,
            type_name: type.name,
            type_code: type.code,
          });
          selected++;
        }
      }
    }

    // 再次隨機打亂整個試卷的順序
    const shuffledPaper = paper.sort(() => Math.random() - 0.5);

    return NextResponse.json({
      paper: shuffledPaper,
      warnings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '建立試卷失敗' },
      { status: 500 }
    );
  }
}


