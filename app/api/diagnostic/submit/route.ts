import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { getStudentSession } from '@/lib/studentAuth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chapterId, answers } = body;

    if (!chapterId || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: '缺少必要參數' },
        { status: 400 }
      );
    }

    // 取得學生 ID（如果已登入）
    const studentId = await getStudentSession();

    const supabase = supabaseServer();

    // 建立 session
    const { data: session, error: sessionError } = await supabase
      .from('student_sessions')
      .insert({
        mode: 'diagnostic',
        chapter_id: chapterId,
        student_id: studentId,
        settings: {},
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    // 處理每題作答
    const attempts: any[] = [];
    const analysisMap: Record<string, { wrong: number; total: number; hardWrong: boolean }> = {};

    for (const answer of answers) {
      const { questionId, typeId, typeName, typeCode, difficulty, qtype, prompt, userAnswer, selectedChoiceIndex, timeSpent } = answer;

      // 取得正確答案
      const { data: question } = await supabase
        .from('questions')
        .select('answer, correct_choice_index')
        .eq('id', questionId)
        .single();

      let isCorrect = false;
      if (qtype === 'mcq') {
        isCorrect = selectedChoiceIndex === question?.correct_choice_index;
      } else {
        isCorrect = userAnswer?.trim() === question?.answer?.trim();
      }

      // 記錄 attempt
      attempts.push({
        session_id: session.id,
        question_id: questionId,
        chapter_id: chapterId,
        type_id: typeId,
        difficulty,
        qtype,
        prompt_snapshot: prompt,
        user_answer: userAnswer || null,
        selected_choice_index: selectedChoiceIndex || null,
        is_correct: isCorrect,
        time_spent_sec: timeSpent || null,
      });

      // 統計分析
      if (!analysisMap[typeId]) {
        analysisMap[typeId] = { wrong: 0, total: 0, hardWrong: false };
      }
      analysisMap[typeId].total++;
      if (!isCorrect) {
        analysisMap[typeId].wrong++;
        if (difficulty === 'hard') {
          analysisMap[typeId].hardWrong = true;
        }
      }
    }

    // 批次插入 attempts
    if (attempts.length > 0) {
      const { error: attemptsError } = await supabase
        .from('question_attempts')
        .insert(attempts);

      if (attemptsError) throw attemptsError;
    }

    // 更新 session 結束時間
    await supabase
      .from('student_sessions')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', session.id);

    // 生成分析結果
    const analysis = Object.entries(analysisMap).map(([typeId, stats]) => {
      const typeInfo = answers.find((a: any) => a.typeId === typeId);
      const wrongRate = stats.wrong / stats.total;

      let priority: 'high' | 'medium' | 'low' = 'low';
      let recommendation = '';
      let recommendedDifficulty: 'easy' | 'medium' | 'hard' = 'easy';

      if (stats.wrong >= 2) {
        priority = 'high';
        recommendation = '此題型需要加強練習，建議從基礎開始';
        recommendedDifficulty = 'easy';
      } else if (stats.hardWrong) {
        priority = 'medium';
        recommendation = '進階題目需要加強，建議先鞏固基礎';
        recommendedDifficulty = 'medium';
      } else if (stats.wrong === 1) {
        priority = 'medium';
        recommendation = '表現良好，建議繼續練習以提升熟練度';
        recommendedDifficulty = 'medium';
      } else {
        priority = 'low';
        recommendation = '表現優秀，可挑戰更高難度';
        recommendedDifficulty = 'hard';
      }

      return {
        type_id: typeId,
        type_name: typeInfo?.typeName || '',
        type_code: typeInfo?.typeCode || '',
        wrong_count: stats.wrong,
        total_count: stats.total,
        priority,
        recommendation,
        recommended_difficulty: recommendedDifficulty,
      };
    });

    // 依 priority 排序（high 在前）
    analysis.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // 嘗試生成報告並發送 LINE 訊息（非阻塞）
    let reportStatus: { sent: boolean; error?: string } | null = null;
    try {
      // 非同步呼叫報告 API（不等待結果）
      fetch(`${process.env.APP_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('/rest/v1', '') || 'http://localhost:3000'}/api/reports/diagnostic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id }),
      }).catch((err) => {
        console.error('生成報告失敗（非阻塞）:', err);
      });
    } catch (err) {
      // 忽略錯誤，不影響主要流程
      console.error('呼叫報告 API 失敗（非阻塞）:', err);
    }

    return NextResponse.json({
      sessionId: session.id,
      analysis,
      reportStatus,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '提交失敗' },
      { status: 500 }
    );
  }
}


