import { mockCourses } from '@/lib/mock/mock-courses';
import { mockQuestions } from '@/lib/mock/mock-questions';

export const seedData = {
  questions: mockQuestions,
  courses: mockCourses,
};

export const seedMeta = {
  version: 'phase-1',
  generatedAt: '2026-03-14T00:00:00.000Z',
  questionCount: mockQuestions.length,
  courseCount: mockCourses.length,
};

