import type { LeadStatus, OverallLevel, QuestionDimension, QuestionDifficulty } from '@/types/quiz';

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: '新名單',
  started_quiz: '已開始測驗',
  finished_quiz: '已完成測驗',
  contacted: '已聯絡',
  trial_booked: '已預約試聽',
  enrolled: '已報名',
};

export const OVERALL_LEVEL_LABELS: Record<OverallLevel, string> = {
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
};

export const DIMENSION_LABELS: Record<QuestionDimension, string> = {
  number_sense: '數感與計算',
  algebra_logic: '代數與邏輯',
  word_problem: '文字題理解',
  geometry: '幾何與圖形',
  data_reasoning: '資料判讀',
};

export const DIFFICULTY_LABELS: Record<QuestionDifficulty, string> = {
  easy: '簡單',
  medium: '中等',
  hard: '困難',
};

export const FUNNEL_LABELS: Array<{ key: LeadStatus | 'total'; label: string }> = [
  { key: 'total', label: '留資料人數' },
  { key: 'started_quiz', label: '開始測驗人數' },
  { key: 'finished_quiz', label: '完成測驗人數' },
  { key: 'trial_booked', label: '預約試聽人數' },
  { key: 'enrolled', label: '報名人數' },
];


