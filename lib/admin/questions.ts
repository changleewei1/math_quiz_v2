'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { QuestionListItem, QuestionFormInput } from '@/lib/admin/types';

const QUESTIONS_TABLE = 'admission_questions';

interface QuestionQueryParams {
  search?: string;
  dimension?: string;
  difficulty?: string;
  isActive?: string;
}

export async function fetchQuestions(params: QuestionQueryParams): Promise<QuestionListItem[]> {
  const supabase = createSupabaseServerClient();
  const query = supabase
    .from(QUESTIONS_TABLE)
    .select('id, prompt, dimension, difficulty, is_active, sort_order, created_at')
    .order('sort_order', { ascending: true });

  if (params.dimension) {
    query.eq('dimension', params.dimension);
  }
  if (params.difficulty) {
    query.eq('difficulty', params.difficulty);
  }
  if (params.isActive === 'true') {
    query.eq('is_active', true);
  }
  if (params.isActive === 'false') {
    query.eq('is_active', false);
  }
  if (params.search) {
    query.ilike('prompt', `%${params.search}%`);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as QuestionListItem[];
}

export async function fetchQuestionById(id: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(QUESTIONS_TABLE)
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function createQuestion(input: QuestionFormInput) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from(QUESTIONS_TABLE).insert({
    prompt: input.prompt,
    explanation: input.explanation ?? null,
    choices: [input.choice_1, input.choice_2, input.choice_3, input.choice_4],
    correct_answer: input.correct_answer,
    dimension: input.dimension,
    difficulty: input.difficulty,
    sort_order: input.sort_order,
    is_active: input.is_active,
  });

  if (error) {
    return { ok: false, message: '新增題目失敗，請稍後再試。' };
  }
  return { ok: true };
}

export async function updateQuestion(id: string, input: QuestionFormInput) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from(QUESTIONS_TABLE)
    .update({
      prompt: input.prompt,
      explanation: input.explanation ?? null,
      choices: [input.choice_1, input.choice_2, input.choice_3, input.choice_4],
      correct_answer: input.correct_answer,
      dimension: input.dimension,
      difficulty: input.difficulty,
      sort_order: input.sort_order,
      is_active: input.is_active,
    })
    .eq('id', id);

  if (error) {
    return { ok: false, message: '更新題目失敗，請稍後再試。' };
  }
  return { ok: true };
}

export async function toggleQuestionActive(id: string, isActive: boolean): Promise<void> {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from(QUESTIONS_TABLE)
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) {
    return;
  }
  return;
}

export async function deleteQuestion(id: string): Promise<void> {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from(QUESTIONS_TABLE)
    .delete()
    .eq('id', id);

  if (error) {
    return;
  }
  return;
}


