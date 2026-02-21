import { NextRequest, NextResponse } from 'next/server';
import { analyzeDiagnosticSession } from '@/lib/analysis';
import { generateAndUploadChart } from '@/lib/chart';
import { createDiagnosticReportFlex } from '@/lib/flexTemplates';
import { pushMessageToRecipients } from '@/lib/line';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: '缺少 sessionId 參數' },
        { status: 400 }
      );
    }

    // 分析作答記錄
    const analysis = await analyzeDiagnosticSession(sessionId);

    // 嘗試取得圖表 URL
    const supabase = supabaseServer();
    const studentIdForPath = analysis.studentId || 'anonymous';
    const filePath = `${studentIdForPath}/${sessionId}/accuracy.png`;
    const { data: urlData } = supabase.storage
      .from('reports')
      .getPublicUrl(filePath);

    const date = new Date().toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // 取得錯題清單（含題幹/答案圖片）
    const { data: attempts, error: attemptsError } = await supabase
      .from('question_attempts')
      .select('question_id, type_id, difficulty, qtype, prompt_snapshot, user_answer, selected_choice_index, is_correct, time_spent_sec')
      .eq('session_id', sessionId)
      .eq('is_correct', false);

    if (attemptsError) throw attemptsError;

    const questionIds = (attempts || []).map((a: any) => a.question_id).filter(Boolean);
    let questionMap = new Map<string, any>();
    if (questionIds.length > 0) {
      const { data: questions, error: qError } = await supabase
        .from('questions')
        .select('id, prompt, prompt_md, answer, answer_md')
        .in('id', questionIds);
      if (qError) throw qError;
      questionMap = new Map((questions || []).map((q: any) => [q.id, q]));
    }

    const wrongAttempts = (attempts || []).map((a: any) => ({
      questionId: a.question_id,
      typeId: a.type_id,
      difficulty: a.difficulty,
      qtype: a.qtype,
      prompt: questionMap.get(a.question_id)?.prompt || a.prompt_snapshot,
      promptMd: questionMap.get(a.question_id)?.prompt_md || null,
      userAnswer: a.user_answer,
      selectedChoiceIndex: a.selected_choice_index,
      isCorrect: a.is_correct,
      timeSpent: a.time_spent_sec,
      correctAnswer: questionMap.get(a.question_id)?.answer || null,
      correctAnswerMd: questionMap.get(a.question_id)?.answer_md || null,
    }));

    return NextResponse.json({
      sessionId,
      chapterId: analysis.chapterId,
      chapterTitle: analysis.chapterTitle,
      date,
      totalQuestions: analysis.totalQuestions,
      correctQuestions: analysis.correctQuestions,
      overallAccuracy: analysis.overallAccuracy,
      imageUrl: urlData.publicUrl,
      typeStatistics: analysis.typeStatistics,
      topWeaknesses: analysis.topWeaknesses,
      summary: analysis.summary,
      attempts: wrongAttempts,
    });
  } catch (error: any) {
    console.error('取得報告失敗:', error);
    return NextResponse.json(
      { error: error.message || '取得報告失敗' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: '缺少 sessionId 參數' },
        { status: 400 }
      );
    }

    // 1. 分析作答記錄
    const analysis = await analyzeDiagnosticSession(sessionId);

    // 2. 生成圖表並上傳
    const imageUrl = await generateAndUploadChart(
      analysis.typeStatistics,
      analysis.studentId,
      sessionId
    );

    // 3. 取得接收者列表
    const supabase = supabaseServer();
    const { data: recipients, error: recipientsError } = await supabase
      .from('student_recipients')
      .select('line_user_id')
      .eq('student_id', analysis.studentId || 'anonymous')
      .eq('is_active', true);

    if (recipientsError) {
      console.error('取得接收者失敗:', recipientsError);
    }

    // 4. 生成 Flex Message
    const BASE_URL = process.env.APP_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('/rest/v1', '') || '';
    const date = new Date().toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const flexMessage = createDiagnosticReportFlex({
      sessionId,
      chapterTitle: analysis.chapterTitle,
      date,
      totalQuestions: analysis.totalQuestions,
      correctQuestions: analysis.correctQuestions,
      accuracy: analysis.overallAccuracy,
      imageUrl,
      topWeaknesses: analysis.topWeaknesses.map((w) => ({
        typeCode: w.typeCode,
        typeName: w.typeName,
        accuracy: w.accuracy,
        recommendation: w.recommendation,
        practiceUrl: `${BASE_URL}/practice?chapterId=${analysis.chapterId}&typeId=${w.typeId}`,
      })),
    });

    // 5. 發送 LINE 訊息
    let sentCount = 0;
    let sendErrors: string[] = [];

    if (recipients && recipients.length > 0) {
      const results = await pushMessageToRecipients(
        recipients,
        [flexMessage]
      );

      sentCount = results.filter((r) => r.success).length;
      sendErrors = results
        .filter((r) => !r.success)
        .map((r) => `${r.line_user_id}: ${r.error}`);
    }

    // 6. 生成報告 URL
    const reportUrl = `${BASE_URL}/report/${sessionId}`;

    return NextResponse.json({
      ok: true,
      reportUrl,
      imageUrl,
      sentTo: sentCount,
      totalRecipients: recipients?.length || 0,
      analysisSummary: {
        totalQuestions: analysis.totalQuestions,
        correctQuestions: analysis.correctQuestions,
        overallAccuracy: analysis.overallAccuracy,
        topWeaknesses: analysis.topWeaknesses.map((w) => ({
          typeCode: w.typeCode,
          typeName: w.typeName,
          accuracy: w.accuracy,
        })),
      },
      errors: sendErrors.length > 0 ? sendErrors : undefined,
    });
  } catch (error: any) {
    console.error('生成報告失敗:', error);
    return NextResponse.json(
      { error: error.message || '生成報告失敗' },
      { status: 500 }
    );
  }
}

