import { DIMENSION_LABEL, type Dimension } from '@/lib/questions';
import { ENROLLMENT_COURSE_TEMPLATES } from '@/lib/mvp/enrollment-courses';
import type { MvpOverallLevel } from '@/types/mvp-funnel';

const DIMENSION_KEYS: Dimension[] = [
  'number_sense',
  'algebra_logic',
  'word_problem',
  'geometry',
  'data_reasoning',
];

export function parseWeakDimensions(raw: string | undefined): Dimension[] {
  if (!raw?.trim()) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is Dimension => DIMENSION_KEYS.includes(s as Dimension));
}

export function levelDisplayLabel(level: string): string {
  if (level === 'A') return 'A（90 分以上）';
  if (level === 'B') return 'B（75～89 分）';
  if (level === 'C') return 'C（60～74 分）';
  if (level === 'D') return 'D（未滿 60 分）';
  return '—';
}

export function normalizeOverallLevel(level: string): MvpOverallLevel {
  return (['A', 'B', 'C', 'D'].includes(level) ? level : 'B') as MvpOverallLevel;
}

export function courseTitleFromId(id: string | undefined): string | null {
  if (!id?.trim()) return null;
  const t = ENROLLMENT_COURSE_TEMPLATES.find((c) => c.id === id.trim());
  return t?.title ?? null;
}

export function weakDimensionsLabel(weakDims: Dimension[]): string {
  if (!weakDims.length) return '';
  return weakDims.map((d) => DIMENSION_LABEL[d]).join('、');
}

export type BookingUrlParams = {
  studentName: string;
  level: string;
  weakRaw: string;
  courseId: string;
  sessionId: string;
  leadId: string;
};

export function parseBookingUrlParams(sp: {
  studentName?: string;
  name?: string;
  level?: string;
  overallLevel?: string;
  weak?: string;
  weakDimensions?: string;
  course?: string;
  recommendedCourse?: string;
  sessionId?: string;
  leadId?: string;
}): BookingUrlParams {
  const studentName = (sp.studentName ?? sp.name ?? '').trim();
  const level = (sp.level ?? sp.overallLevel ?? 'B').trim();
  const weakRaw = (sp.weak ?? sp.weakDimensions ?? '').trim();
  const courseId = (sp.course ?? sp.recommendedCourse ?? '').trim();
  const sessionId = (sp.sessionId ?? '').trim();
  const leadId = (sp.leadId ?? '').trim();
  return { studentName, level, weakRaw, courseId, sessionId, leadId };
}
