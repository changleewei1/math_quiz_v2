import type {
  AnalysisScoreRule,
  DimensionStatus,
  LeadStatus,
  OverallLevel,
  OverallLevelRule,
  QuestionDimension,
  QuestionDifficulty,
} from '@/types/quiz';

export const LEAD_STATUSES: LeadStatus[] = [
  'new',
  'started_quiz',
  'finished_quiz',
  'contacted',
  'trial_booked',
  'enrolled',
];

export const OVERALL_LEVELS: OverallLevel[] = ['A', 'B', 'C', 'D'];

export const QUESTION_DIMENSIONS: QuestionDimension[] = [
  'number_sense',
  'algebra_logic',
  'word_problem',
  'geometry',
  'data_reasoning',
];

export const QUESTION_DIFFICULTIES: QuestionDifficulty[] = [
  'easy',
  'medium',
  'hard',
];

export const DIMENSION_STATUS_RULES: AnalysisScoreRule[] = [
  { min: 0, max: 59, status: 'weak' },
  { min: 60, max: 79, status: 'watch' },
  { min: 80, max: 100, status: 'strong' },
];

export const OVERALL_LEVEL_RULES: OverallLevelRule[] = [
  { min: 90, max: 100, level: 'A' },
  { min: 75, max: 89, level: 'B' },
  { min: 60, max: 74, level: 'C' },
  { min: 0, max: 59, level: 'D' },
];

export const DIMENSION_STATUS_LABELS: Record<DimensionStatus, string> = {
  weak: '需加強',
  watch: '可再加強',
  strong: '表現穩定',
};

export const RECOMMENDATION_RULES = {
  foundationCourseId: 'course-001',
  readingCourseId: 'course-002',
  geometryCourseId: 'course-003',
  comprehensiveCourseId: 'course-004',
  weakDimensionThreshold: 3,
};

export const WEAKNESS_COPY: Record<QuestionDimension, string> = {
  number_sense: '基礎計算與數感較弱，升國一後遇到整數與代數先備時可能較吃力。',
  algebra_logic: '未知數、規律與等式推理概念尚未穩定，建議先建立代數基礎。',
  word_problem: '從文字敘述轉成算式的能力需加強，建議練習題意拆解。',
  geometry: '圖形觀察與幾何基礎概念仍需補強，建議在暑假先建立基礎。',
  data_reasoning: '表格、統計圖與資料比較的判讀能力需要再加強。',
};

