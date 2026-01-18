/**
 * 弱點分析模式矩陣定義
 */

export type Subject = 'math' | 'science';

export type QuizMode = 
  | 'exam_term'        // 段考弱點分析
  | 'mock_exam'        // 模擬考弱點分析
  | 'daily_practice'  // 平常弱點分析
  | 'speed_training'   // 速度專項
  | 'error_diagnosis'  // 錯誤類型診斷
  | 'teacher_diagnosis'; // 教師診斷

/**
 * 模式列表（學生可選擇的）
 */
export const STUDENT_QUIZ_MODES: { id: QuizMode; name: string; description?: string }[] = [
  { id: 'exam_term', name: '段考', description: '段考弱點分析' },
  { id: 'mock_exam', name: '模擬考', description: '模擬考弱點分析' },
  { id: 'daily_practice', name: '平常', description: '平常弱點分析' },
  { id: 'speed_training', name: '速度', description: '速度專項訓練' },
  { id: 'error_diagnosis', name: '診斷', description: '錯誤類型診斷' },
  // teacher_diagnosis 不開放給學生
];

/**
 * 所有模式列表（包含教師模式）
 */
export const ALL_QUIZ_MODES: { id: QuizMode; name: string; description?: string; studentAccessible: boolean }[] = [
  { id: 'exam_term', name: '段考', description: '段考弱點分析', studentAccessible: true },
  { id: 'mock_exam', name: '模擬考', description: '模擬考弱點分析', studentAccessible: true },
  { id: 'daily_practice', name: '平常', description: '平常弱點分析', studentAccessible: true },
  { id: 'speed_training', name: '速度', description: '速度專項訓練', studentAccessible: true },
  { id: 'error_diagnosis', name: '診斷', description: '錯誤類型診斷', studentAccessible: true },
  { id: 'teacher_diagnosis', name: '教師', description: '教師診斷', studentAccessible: false },
];

/**
 * 取得模式的中文名稱
 */
export function getQuizModeName(mode: QuizMode): string {
  const modeObj = ALL_QUIZ_MODES.find(m => m.id === mode);
  return modeObj?.name || mode;
}

/**
 * 取得科目的中文名稱
 */
export function getSubjectName(subject: Subject): string {
  return subject === 'math' ? '數學' : '理化';
}


