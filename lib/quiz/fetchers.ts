import type { Course, Video } from '@/types/quiz';
import type { QuizQuestion } from '@/lib/quiz/types';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { mockCourses } from '@/lib/mock/mock-courses';
import { mockVideos } from '@/lib/mock/mock-videos';

const QUESTIONS_TABLE = 'admission_questions';

export async function fetchQuizSession(sessionId: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) {
    return null;
  }
  return data;
}

export async function fetchLead(leadId: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();

  if (error) {
    return null;
  }
  return data;
}

export async function fetchActiveQuestions(): Promise<QuizQuestion[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(QUESTIONS_TABLE)
    .select('id,prompt,image_url,choices,correct_answer,dimension,explanation,sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as QuizQuestion[];
}

export async function fetchCourses(): Promise<Course[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error || !data || data.length === 0) {
    return mockCourses;
  }
  return data as Course[];
}

export async function fetchVideos(): Promise<Video[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error || !data || data.length === 0) {
    return mockVideos;
  }
  return data as Video[];
}

export async function fetchCoursesByIds(ids: string[]): Promise<Course[]> {
  if (ids.length === 0) return [];
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .in('id', ids);

  if (error || !data) {
    return [];
  }
  return data as Course[];
}

export async function fetchVideosByIds(ids: string[]): Promise<Video[]> {
  if (ids.length === 0) return [];
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .in('id', ids);

  if (error || !data) {
    return [];
  }
  return data as Video[];
}


