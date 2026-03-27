import type { Course } from '@/types/quiz';
import type { QuizAnalysisResult } from '@/lib/quiz/types';
import { mockCourses } from '@/lib/mock/mock-courses';


export function getRecommendedCourses(
  analysis: Pick<QuizAnalysisResult, 'dimensionAnalysis' | 'overallLevel'>,
  courses?: Course[]
): QuizAnalysisResult['recommendedCourses'] {
  const weakDimensions = analysis.dimensionAnalysis
    .filter((item) => item.status === 'weak')
    .map((item) => item.dimension);
  const weakCount = weakDimensions.length;
  const isStableOverall = analysis.overallLevel === 'A' || analysis.overallLevel === 'B';

  const recommendations: QuizAnalysisResult['recommendedCourses'] = [];

  const addCourse = (course: Course | undefined) => {
    if (!course) return;
    if (recommendations.some((item) => item.id === course.id)) return;
    recommendations.push({
      id: course.id,
      title: course.title,
      cta_link: course.cta_link ?? null,
    });
  };

  const courseMap = new Map<string, Course>();
  const sourceCourses = courses && courses.length > 0 ? courses : mockCourses;
  sourceCourses.forEach((course) => courseMap.set(course.id, course));

  const foundationCourse = courseMap.get('course-001');
  const readingCourse = courseMap.get('course-002');
  const geometryCourse = courseMap.get('course-003');
  const comprehensiveCourse = courseMap.get('course-004');

  if (weakDimensions.includes('number_sense') || weakDimensions.includes('algebra_logic')) {
    addCourse(foundationCourse);
  }

  if (weakDimensions.includes('word_problem')) {
    addCourse(readingCourse);
  }

  if (weakDimensions.includes('geometry')) {
    addCourse(geometryCourse);
  }

  if (weakCount >= 3) {
    addCourse(comprehensiveCourse);
  }

  if (weakCount === 0 && isStableOverall) {
    addCourse(foundationCourse);
  }

  if (recommendations.length === 0) {
    addCourse(foundationCourse);
  }

  return recommendations;
}

