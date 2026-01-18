import { supabaseServer } from '@/lib/supabaseServer';
import { EXAM_CHAPTER_CODES } from '@/lib/examChapterCodes';

type ScopeType = 'chapter' | 'book' | 'exam';

type BuildDiagnosticParams = {
  student_id: string | null;
  subject: 'math' | 'science';
  scope_type: ScopeType;
  scope_ref: Record<string, any>;
  total_questions: number;
};

type BuildDiagnosticResult = {
  questionIds: string[];
  scopeRef: Record<string, any>;
};

const shuffle = <T,>(items: T[]) => {
  const cloned = [...items];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
};

const normalizeTerm = (value?: string) => {
  if (!value) return '';
  if (value === 'upper' || value === 'lower') return value;
  if (value === '上' || value === '上學期') return 'upper';
  if (value === '下' || value === '下學期') return 'lower';
  return '';
};

const normalizeGradeId = (subject: 'math' | 'science', grade?: string | number) => {
  if (!grade) return '';
  const numeric = typeof grade === 'string' ? parseInt(grade, 10) : grade;
  if (![1, 2, 3].includes(numeric)) return '';
  return `J${numeric}-${subject === 'math' ? 'MATH' : 'SCI'}`;
};

export const buildDiagnosticTest = async ({
  subject,
  scope_type,
  scope_ref,
  total_questions,
}: BuildDiagnosticParams): Promise<BuildDiagnosticResult> => {
  const supabase = supabaseServer();
  let chapterIds: string[] = [];
  const nextScopeRef = { ...scope_ref };

  if (scope_type === 'chapter') {
    if (scope_ref?.chapter_id) {
      chapterIds = [scope_ref.chapter_id];
    }
  } else if (scope_type === 'book') {
    const term = normalizeTerm(scope_ref?.term || scope_ref?.book);
    const gradeId =
      scope_ref?.grade_id ||
      normalizeGradeId(subject, scope_ref?.grade);

    if (term && gradeId) {
      const { data: chapters, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('grade_id', gradeId)
        .eq('term', term)
        .eq('is_active', true);

      if (error) throw error;
      chapterIds = (chapters || []).map((ch: any) => ch.id);
    }
  } else if (scope_type === 'exam') {
    const codes = EXAM_CHAPTER_CODES[subject] || [];
    if (codes.length > 0) {
      const { data: chapters, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      chapterIds = (chapters || [])
        .filter((ch: any) => codes.includes(ch.code || ch.id))
        .map((ch: any) => ch.id);
    }
  }

  if (chapterIds.length === 0) {
    nextScopeRef.missing = true;
    return { questionIds: [], scopeRef: nextScopeRef };
  }

  const { data: questions, error } = await supabase
    .from('questions')
    .select('id')
    .in('chapter_id', chapterIds)
    .eq('is_active', true);

  if (error) throw error;

  const uniqueIds = Array.from(new Set((questions || []).map((q: any) => q.id)));
  const shuffled = shuffle(uniqueIds);
  const selected = shuffled.slice(0, total_questions);

  if (selected.length < total_questions) {
    nextScopeRef.missing = true;
  }

  return { questionIds: selected, scopeRef: nextScopeRef };
};


