import type {
  DimensionAnalysis,
  DimensionScoreMap,
  OverallLevel,
  Question,
} from '@/types/quiz';

export type QuizQuestion = Pick<
  Question,
  | 'id'
  | 'prompt'
  | 'image_url'
  | 'choices'
  | 'correct_answer'
  | 'dimension'
  | 'explanation'
  | 'sort_order'
>;

export interface QuizAnswerInput {
  questionId: string;
  selectedAnswer: string;
}

export interface QuizAnswerRecord {
  session_id: string;
  question_id: string;
  selected_answer: string;
  is_correct: boolean;
  answered_at: string;
}

export interface QuizAnalysisResult {
  totalScore: number;
  overallLevel: OverallLevel;
  dimensionScores: DimensionScoreMap;
  dimensionAnalysis: DimensionAnalysis[];
  weaknessSummary: string;
  enrollmentCTA: string;
  studySuggestions: string[];
  recommendedCourses: Array<{
    id: string;
    title: string;
    cta_link?: string | null;
  }>;
}

