import { NextRequest, NextResponse } from 'next/server';
import { analyzeStudentLatestSession, enrichTypeStatistics } from '@/lib/reportAnalysis';
import { supabaseServer } from '@/lib/supabaseServer';
import { verifyReportToken } from '@/lib/reportToken';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const token = request.headers.get('X-Report-Token') || searchParams.get('token');

    if (!studentId) {
      return NextResponse.json(
        { error: '缺少 studentId 參數' },
        { status: 400 }
      );
    }

    // 驗證 token
    if (!token) {
      return NextResponse.json(
        { error: '缺少 token 參數' },
        { status: 401 }
      );
    }

    const tokenResult = verifyReportToken(token);
    if (!tokenResult.valid) {
      if (tokenResult.expired) {
        return NextResponse.json(
          { error: '連結已失效，請向老師索取最新連結' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: '無效的 token' },
        { status: 401 }
      );
    }

    if (tokenResult.studentId !== studentId) {
      return NextResponse.json(
        { error: 'token 與學生 ID 不匹配' },
        { status: 403 }
      );
    }

    // 分析學生最近一次診斷測驗
    const result = await analyzeStudentLatestSession(studentId);

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      );
    }

    // 補齊題型資訊
    const enrichedTypeStats = await enrichTypeStatistics(result.typeStatistics);
    const enrichedTopWeakTypes = await enrichTypeStatistics(result.topWeakTypes);

    // 取得錯題清單
    const wrongAttempts = result.attempts
      .filter((a: any) => !a.is_correct)
      .map((a: any) => ({
        questionId: a.question_id,
        typeId: a.type_id,
        difficulty: a.difficulty,
        qtype: a.qtype,
        prompt: a.prompt_snapshot,
        userAnswer: a.user_answer,
        selectedChoiceIndex: a.selected_choice_index,
        isCorrect: a.is_correct,
        timeSpent: a.time_spent_sec,
      }));

    return NextResponse.json({
      latestSession: {
        id: result.session.id,
        chapterId: result.chapterId,
        chapterTitle: result.chapterTitle,
        subject: result.session.subject || 'math',
        quizMode: result.session.quiz_mode || 'daily_practice',
        startedAt: result.session.started_at,
        endedAt: result.session.ended_at,
      },
      statsByType: enrichedTypeStats,
      topWeakTypes: enrichedTopWeakTypes,
      totalQuestions: result.totalQuestions,
      correctQuestions: result.correctQuestions,
      overallAccuracy: result.overallAccuracy,
      attempts: wrongAttempts,
    });
  } catch (error: any) {
    console.error('取得學生報表失敗:', error);
    return NextResponse.json(
      { error: error.message || '取得學生報表失敗' },
      { status: 500 }
    );
  }
}

