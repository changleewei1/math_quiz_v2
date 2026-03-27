export type LeadStatus =
  | 'new'
  | 'started_quiz'
  | 'finished_quiz'
  | 'contacted'
  | 'trial_booked'
  | 'enrolled';

export type OverallLevel = 'A' | 'B' | 'C' | 'D';

export type QuestionDimension =
  | 'number_sense'
  | 'algebra_logic'
  | 'word_problem'
  | 'geometry'
  | 'data_reasoning';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export type DimensionStatus = 'weak' | 'watch' | 'strong';

export interface Lead {
  id: string;
  student_name: string;
  parent_name: string;
  phone: string;
  line_id: string | null;
  elementary_school: string;
  junior_high_school: string | null;
  source: string | null;
  status: LeadStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuizSession {
  id: string;
  lead_id: string;
  started_at: string;
  completed_at: string | null;
  total_score: number | null;
  overall_level: OverallLevel | null;
  dimension_scores: DimensionScoreMap | null;
  weakness_summary: string | null;
  enrollment_cta: string | null;
  recommended_courses: RecommendedCourseSummary[] | null;
  recommended_videos: RecommendedVideoSummary[] | null;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  prompt: string;
  prompt_md: string | null;
  image_url: string | null;
  choices: string[];
  correct_answer: string;
  explanation: string | null;
  dimension: QuestionDimension;
  difficulty: QuestionDifficulty;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Answer {
  id: string;
  session_id: string;
  question_id: string;
  selected_answer: string;
  is_correct: boolean | null;
  answered_at: string;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  target_weaknesses: QuestionDimension[];
  cta_link: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  title: string;
  youtube_url: string;
  dimension: QuestionDimension;
  tags: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type DimensionScoreMap = Record<QuestionDimension, number>;

export interface DimensionAnalysis {
  dimension: QuestionDimension;
  score: number;
  status: DimensionStatus;
  hint: string;
  description: string;
}

export interface RecommendedCourseSummary {
  id: string;
  title: string;
  cta_link?: string | null;
}

export interface RecommendedVideoSummary {
  id: string;
  title: string;
  youtube_url: string;
}

export interface QuizAnalysisResult {
  totalScore: number;
  overallLevel: OverallLevel;
  dimensionScores: DimensionScoreMap;
  dimensionAnalysis: DimensionAnalysis[];
  weaknessSummary: string;
  enrollmentCTA: string;
  studySuggestions: string[];
  recommendedCourses: RecommendedCourseSummary[];
}

export interface AnalysisScoreRule {
  min: number;
  max: number;
  status: DimensionStatus;
}

export interface OverallLevelRule {
  min: number;
  max: number;
  level: OverallLevel;
}

