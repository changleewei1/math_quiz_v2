/**
 * 報表分析邏輯（重用現有的分析函數）
 */

import { supabaseServer } from './supabaseServer';
import type { TypeStatistics } from './analysis';

/**
 * 分析單一學生的最近一次診斷測驗
 */
export async function analyzeStudentLatestSession(studentId: string) {
  const supabase = supabaseServer();

  // 1. 取得最近一次診斷測驗 session
  const { data: latestSession, error: sessionError } = await supabase
    .from('student_sessions')
    .select('*, chapters(title)')
    .eq('student_id', studentId)
    .eq('mode', 'diagnostic')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (sessionError) {
    return { error: '查詢診斷測驗記錄失敗: ' + sessionError.message };
  }

  if (!latestSession) {
    return { error: '找不到診斷測驗記錄' };
  }

  // 2. 取得該 session 的所有作答記錄
  const { data: attempts, error: attemptsError } = await supabase
    .from('question_attempts')
    .select('*')
    .eq('session_id', latestSession.id);

  if (attemptsError) {
    return { error: '取得作答記錄失敗' };
  }

  if (!attempts || attempts.length === 0) {
    return { error: '沒有作答記錄' };
  }

  // 3. 取得題型資訊
  const typeIds = [...new Set(attempts.map((a) => a.type_id).filter(Boolean))];
  const { data: types } = await supabase
    .from('question_types')
    .select('id, code, name')
    .in('id', typeIds);

  const typeMap = new Map(types?.map((t) => [t.id, t]) || []);

  // 4. 依題型統計（重用現有邏輯）
  const typeStatsMap = new Map<string, TypeStatistics>();

  for (const attempt of attempts) {
    if (!attempt.type_id) continue;

    const type = typeMap.get(attempt.type_id);
    if (!type) continue;

    if (!typeStatsMap.has(attempt.type_id)) {
      typeStatsMap.set(attempt.type_id, {
        typeId: attempt.type_id,
        typeCode: type.code,
        typeName: type.name,
        total: 0,
        correct: 0,
        wrong: 0,
        accuracy: 0,
        byDifficulty: {
          easy: { total: 0, correct: 0 },
          medium: { total: 0, correct: 0 },
          hard: { total: 0, correct: 0 },
        },
        priority: 0,
        recommendation: '',
      });
    }

    const stats = typeStatsMap.get(attempt.type_id)!;
    stats.total++;
    if (attempt.is_correct) {
      stats.correct++;
    } else {
      stats.wrong++;
    }

    // 依難度統計
    if (attempt.difficulty) {
      const diffStats = stats.byDifficulty[attempt.difficulty as 'easy' | 'medium' | 'hard'];
      if (diffStats) {
        diffStats.total++;
        if (attempt.is_correct) {
          diffStats.correct++;
        }
      }
    }
  }

  // 5. 計算正確率和優先級
  const typeStatistics: TypeStatistics[] = [];
  let totalQuestions = 0;
  let correctQuestions = 0;

  for (const stats of typeStatsMap.values()) {
    stats.accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
    
    // 計算優先級：priority = wrong*10 + hardWrong*5 + mediumWrong*3
    const hardWrong = stats.byDifficulty.hard.total - stats.byDifficulty.hard.correct;
    const mediumWrong = stats.byDifficulty.medium.total - stats.byDifficulty.medium.correct;
    stats.priority = stats.wrong * 10 + hardWrong * 5 + mediumWrong * 3;

    // 生成建議
    if (stats.wrong >= 2) {
      stats.recommendation = '主要弱點，建議先從簡單題開始練習，熟練後再挑戰中等和困難題';
    } else if (hardWrong >= 1) {
      stats.recommendation = '進階題目待加強，建議先鞏固基礎後再挑戰困難題';
    } else if (stats.accuracy === 100) {
      stats.recommendation = '表現良好，可進入下一題型';
    } else {
      stats.recommendation = '表現尚可，建議繼續練習以提升熟練度';
    }

    totalQuestions += stats.total;
    correctQuestions += stats.correct;
    typeStatistics.push(stats);
  }

  // 6. 排序並取得 Top 3 弱點
  typeStatistics.sort((a, b) => b.priority - a.priority);
  const topWeakTypes = typeStatistics.slice(0, 3);

  const overallAccuracy = totalQuestions > 0 ? (correctQuestions / totalQuestions) * 100 : 0;
  const chapterTitle = (latestSession.chapters as any)?.title || '未知章節';

  return {
    session: latestSession,
    typeStatistics,
    topWeakTypes,
    totalQuestions,
    correctQuestions,
    overallAccuracy,
    chapterTitle,
    chapterId: latestSession.chapter_id,
    attempts, // 包含錯題清單
  };
}

/**
 * 分析班級總覽（每位學生取最近一次診斷）
 * @param classId 班級 ID
 * @param range 'latest' | '30d' - 時間範圍
 */
export async function analyzeClassOverview(classId: string, range: 'latest' | '30d' = 'latest') {
  const supabase = supabaseServer();

  // 1. 取得班級成員
  const { data: members, error: membersError } = await supabase
    .from('class_members')
    .select('student_id, students(id, name)')
    .eq('class_id', classId)
    .eq('is_active', true);

  if (membersError || !members || members.length === 0) {
    return { error: '找不到班級成員' };
  }

  // student_id 在 class_members 中是 UUID（對應 students.id）
  // 但在 student_sessions 中是 TEXT（可能是學生的名字或其他識別符）
  // 這裡我們先假設 class_members.student_id 是 UUID，然後轉換為字串
  const studentIds = members.map(m => {
    const studentId = (m.students as any)?.id || m.student_id;
    // 如果是 UUID，轉換為字串；如果是字串，直接使用
    return typeof studentId === 'string' ? studentId : String(studentId);
  });

  // 計算日期範圍（如果是 30 天）
  const thirtyDaysAgo = range === '30d' 
    ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    : null;

  // 2. 取得每位學生最近一次診斷測驗
  const studentSessions: Array<{ studentId: string; session: any; stats: any; latestSessionDate: string | null }> = [];

  for (const studentId of studentIds) {
    let query = supabase
      .from('student_sessions')
      .select('*, chapters(title)')
      .eq('student_id', studentId)
      .eq('mode', 'diagnostic');
    
    // 如果是 30 天範圍，加上時間篩選
    if (range === '30d' && thirtyDaysAgo) {
      query = query.gte('started_at', thirtyDaysAgo);
    }
    
    const { data: session } = await query
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (session) {
      // 取得該 session 的作答記錄
      const { data: attempts } = await supabase
        .from('question_attempts')
        .select('*')
        .eq('session_id', session.id);

      if (attempts && attempts.length > 0) {
        // 取得題型資訊
        const typeIds = [...new Set(attempts.map((a: any) => a.type_id).filter(Boolean))];
        const { data: types } = await supabase
          .from('question_types')
          .select('id, code, name')
          .in('id', typeIds);

        const typeMap = new Map(types?.map(t => [t.id, t]) || []);
        
        // 簡單統計
        const stats = await analyzeAttemptsForTypesWithTypes(attempts, typeMap);
        studentSessions.push({ 
          studentId, 
          session, 
          stats,
          latestSessionDate: session.started_at
        });
      }
    }
  }

  // 3. 匯總班級統計
  const typeStatsMap = new Map<string, {
    totalStudents: number;
    totalQuestions: number;
    totalCorrect: number;
    weakCount: number; // wrong >= 2 的學生數
    totalWrong: number;
  }>();

  for (const { stats } of studentSessions) {
    for (const typeStat of stats) {
      if (!typeStatsMap.has(typeStat.typeId)) {
        typeStatsMap.set(typeStat.typeId, {
          totalStudents: 0,
          totalQuestions: 0,
          totalCorrect: 0,
          weakCount: 0,
          totalWrong: 0,
        });
      }

      const classStat = typeStatsMap.get(typeStat.typeId)!;
      classStat.totalStudents++;
      classStat.totalQuestions += typeStat.total;
      classStat.totalCorrect += typeStat.correct;
      classStat.totalWrong += typeStat.wrong;
      if (typeStat.wrong >= 2) {
        classStat.weakCount++;
      }
    }
  }

  // 4. 計算班級平均正確率
  const classSummaryByType = Array.from(typeStatsMap.entries()).map(([typeId, stat]) => {
    const typeInfo = studentSessions[0]?.stats.find((s: any) => s.typeId === typeId);
    const avgWrong = stat.totalStudents > 0 ? stat.totalWrong / stat.totalStudents : 0;
    return {
      typeId,
      typeCode: typeInfo?.typeCode || '',
      typeName: typeInfo?.typeName || '',
      avgAccuracy: stat.totalQuestions > 0 ? (stat.totalCorrect / stat.totalQuestions) * 100 : 0,
      weakCount: stat.weakCount,
      avgWrong,
      priority: stat.weakCount * 10 + avgWrong * 5,
    };
  });

  // 5. Top 5 弱點題型
  classSummaryByType.sort((a, b) => b.priority - a.priority);
  const topWeakTypes = classSummaryByType.slice(0, 5);

  // 6. 學生列表（含總正確率和弱點）
  const students = studentSessions.map(({ studentId, session, stats, latestSessionDate }) => {
    // 比對時需要考慮類型轉換
    // studentId 來自 student_sessions.student_id（TEXT），可能是學生的名字或 UUID
    // 需要比對 students.id（UUID）或 students.name
    const member = members.find(m => {
      const memberStudentId = (m.students as any)?.id || m.student_id;
      const memberIdStr = typeof memberStudentId === 'string' ? memberStudentId : String(memberStudentId);
      const memberName = (m.students as any)?.name;
      // 比對 ID（轉為字串）或名字
      return memberIdStr === studentId || memberName === studentId;
    });
    const studentName = (member?.students as any)?.name || studentId || '未知';

    let totalQuestions = 0;
    let totalCorrect = 0;
    const weaknesses: Array<{ typeCode: string; typeName: string }> = [];

    for (const stat of stats) {
      totalQuestions += stat.total;
      totalCorrect += stat.correct;
      if (stat.wrong >= 2) {
        weaknesses.push({ typeCode: stat.typeCode, typeName: stat.typeName });
      }
    }

    const overallAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
    weaknesses.sort((a, b) => {
      const aPriority = stats.find((s: any) => s.typeCode === a.typeCode)?.priority || 0;
      const bPriority = stats.find((s: any) => s.typeCode === b.typeCode)?.priority || 0;
      return bPriority - aPriority;
    });

    return {
      studentId,
      studentName,
      overallAccuracy,
      topWeaknesses: weaknesses.slice(0, 2),
      hasReport: true,
      latestSessionDate: latestSessionDate || null,
    };
  });

  // 7. 未測驗的學生
  // 建立已測驗學生的識別符集合（可能是 ID 或名字）
  const testedStudentIdentifiers = new Set<string>();
  for (const { studentId } of studentSessions) {
    testedStudentIdentifiers.add(studentId);
    // 同時也加入對應的 UUID（如果有找到）
    const member = members.find(m => {
      const memberName = (m.students as any)?.name;
      return memberName === studentId;
    });
    if (member) {
      const memberId = (member.students as any)?.id || member.student_id;
      testedStudentIdentifiers.add(typeof memberId === 'string' ? memberId : String(memberId));
    }
  }

  for (const member of members) {
    const studentIdRaw = (member.students as any)?.id || member.student_id;
    const studentId = typeof studentIdRaw === 'string' ? studentIdRaw : String(studentIdRaw);
    const studentName = (member.students as any)?.name;
    // 檢查是否已測驗（比對 ID 或名字）
    const isTested = testedStudentIdentifiers.has(studentId) || 
                     (studentName && testedStudentIdentifiers.has(studentName));
    
    if (!isTested) {
      students.push({
        studentId,
        studentName: studentName || '未知',
        overallAccuracy: 0,
        topWeaknesses: [],
        hasReport: false,
        latestSessionDate: null,
      });
    }
  }

  return {
    classSummaryByType,
    topWeakTypes,
    students,
  };
}

/**
 * 分析作答記錄，依題型統計（輔助函數，帶題型資訊）
 */
async function analyzeAttemptsForTypesWithTypes(
  attempts: any[],
  typeMap: Map<string, { id: string; code: string; name: string }>
): Promise<TypeStatistics[]> {
  const typeStatsMap = new Map<string, TypeStatistics>();

  for (const attempt of attempts) {
    if (!attempt.type_id) continue;

    const type = typeMap.get(attempt.type_id);
    if (!type) continue;

    if (!typeStatsMap.has(attempt.type_id)) {
      typeStatsMap.set(attempt.type_id, {
        typeId: attempt.type_id,
        typeCode: type.code,
        typeName: type.name,
        total: 0,
        correct: 0,
        wrong: 0,
        accuracy: 0,
        byDifficulty: {
          easy: { total: 0, correct: 0 },
          medium: { total: 0, correct: 0 },
          hard: { total: 0, correct: 0 },
        },
        priority: 0,
        recommendation: '',
      });
    }

    const stats = typeStatsMap.get(attempt.type_id)!;
    stats.total++;
    if (attempt.is_correct) {
      stats.correct++;
    } else {
      stats.wrong++;
    }

    if (attempt.difficulty) {
      const diffStats = stats.byDifficulty[attempt.difficulty as 'easy' | 'medium' | 'hard'];
      if (diffStats) {
        diffStats.total++;
        if (attempt.is_correct) {
          diffStats.correct++;
        }
      }
    }
  }

  // 計算統計
  const typeStatistics: TypeStatistics[] = [];

  for (const stats of typeStatsMap.values()) {
    stats.accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
    const hardWrong = stats.byDifficulty.hard.total - stats.byDifficulty.hard.correct;
    const mediumWrong = stats.byDifficulty.medium.total - stats.byDifficulty.medium.correct;
    stats.priority = stats.wrong * 10 + hardWrong * 5 + mediumWrong * 3;
    typeStatistics.push(stats);
  }

  return typeStatistics;
}

/**
 * 更新題型資訊（補齊 code 和 name）
 */
export async function enrichTypeStatistics(typeStats: TypeStatistics[]): Promise<TypeStatistics[]> {
  const supabase = supabaseServer();
  const typeIds = typeStats.map(s => s.typeId);
  
  const { data: types } = await supabase
    .from('question_types')
    .select('id, code, name')
    .in('id', typeIds);

  const typeMap = new Map(types?.map(t => [t.id, t]) || []);

  return typeStats.map(stat => {
    const type = typeMap.get(stat.typeId);
    if (type) {
      return {
        ...stat,
        typeCode: type.code,
        typeName: type.name,
      };
    }
    return stat;
  });
}

