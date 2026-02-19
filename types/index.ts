export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'input' | 'mcq' | 'word';
export type SessionMode = 'diagnostic' | 'practice';

import type { Subject, QuizMode } from './quizMode';

import type { GradeId, Term } from './grade';

export interface Chapter {
  id: string;
  title: string;
  grade_id: GradeId;  // 年級（科目）ID
  term: Term;          // 學期：upper (上學期) 或 lower (下學期)
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface QuestionTypeData {
  id: string;
  chapter_id: string;
  name: string;
  code: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

import type { MediaBlock } from './media';

export interface Question {
  id: string;
  chapter_id: string;
  type_id: string;
  skill_id?: string | null;
  difficulty: Difficulty;
  qtype: QuestionType;
  prompt: string;
  prompt_md?: string | null;
  answer: string;
  choices: string[] | null;
  correct_choice_index: number | null;
  equation: string | null;
  tags: string[] | null;
  video_url: string | null;
  explain: string | null;
  explain_md?: string | null;
  media: MediaBlock | null; // 題目媒體資源（圖片、圖表等）
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  student_id: string | null;
  mode: SessionMode;  // 舊的模式：diagnostic | practice（保留向後相容）
  subject: Subject | null;  // 科目：math | science
  quiz_mode: QuizMode | null;  // 新模式：exam_term | mock_exam | daily_practice | speed_training | error_diagnosis | teacher_diagnosis
  scope_id: string | null;  // 範圍 ID（用於段考範圍等）
  chapter_id: string | null;
  type_id: string | null;
  settings: Record<string, any> | null;
  started_at: string;
  ended_at: string | null;
}

export interface Attempt {
  id: string;
  session_id: string;
  question_id: string | null;
  chapter_id: string | null;
  type_id: string | null;
  difficulty: Difficulty | null;
  qtype: QuestionType | null;
  prompt_snapshot: string | null;
  user_answer: string | null;
  selected_choice_index: number | null;
  is_correct: boolean;
  time_spent_sec: number | null;
  time_spent_ms?: number | null;
  created_at: string;
}

export interface DiagnosticAnalysis {
  type_id: string;
  type_name: string;
  type_code: string;
  wrong_count: number;
  total_count: number;
  priority: 'high' | 'medium' | 'low';
  recommendation: string;
  recommended_difficulty: Difficulty;
}


