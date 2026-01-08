export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'input' | 'mcq' | 'word';
export type SessionMode = 'diagnostic' | 'practice';

export interface Chapter {
  id: string;
  title: string;
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

export interface Question {
  id: string;
  chapter_id: string;
  type_id: string;
  difficulty: Difficulty;
  qtype: QuestionType;
  prompt: string;
  answer: string;
  choices: string[] | null;
  correct_choice_index: number | null;
  equation: string | null;
  tags: string[] | null;
  video_url: string | null;
  explain: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  student_id: string | null;
  mode: SessionMode;
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


