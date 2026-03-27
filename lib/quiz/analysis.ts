import type {
  DimensionAnalysis,
  DimensionScoreMap,
  DimensionStatus,
  OverallLevel,
  QuestionDimension,
} from '@/types/quiz';
import type { QuizAnswerInput, QuizAnalysisResult, QuizQuestion } from '@/lib/quiz/types';
import { QUESTION_DIMENSIONS } from '@/lib/constants/status';
import { DIMENSION_META_MAP } from '@/lib/constants/dimensions';
import {
  generateDimensionAnalysisText,
  generateEnrollmentCTA,
  generateStudySuggestions,
  generateWeaknessSummary,
} from '@/lib/quiz/report-text';
import { getRecommendedCourses } from '@/lib/quiz/recommendations';

export function calculateOverallLevel(totalScore: number): OverallLevel {
  if (totalScore >= 90) return 'A';
  if (totalScore >= 75) return 'B';
  if (totalScore >= 60) return 'C';
  return 'D';
}

export function getDimensionStatus(score: number): DimensionStatus {
  if (score >= 80) return 'strong';
  if (score >= 60) return 'watch';
  return 'weak';
}

export function calculateDimensionScores(
  questions: QuizQuestion[],
  answers: QuizAnswerInput[]
): DimensionScoreMap {
  const answerMap = new Map(answers.map((item) => [item.questionId, item.selectedAnswer]));
  const dimensionCounts: Record<QuestionDimension, { total: number; correct: number }> =
    Object.fromEntries(
      QUESTION_DIMENSIONS.map((dimension) => [dimension, { total: 0, correct: 0 }])
    ) as Record<QuestionDimension, { total: number; correct: number }>;

  questions.forEach((question) => {
    dimensionCounts[question.dimension].total += 1;
    const selected = answerMap.get(question.id);
    if (selected && selected === question.correct_answer) {
      dimensionCounts[question.dimension].correct += 1;
    }
  });

  return Object.fromEntries(
    QUESTION_DIMENSIONS.map((dimension) => {
      const { total, correct } = dimensionCounts[dimension];
      const score = total === 0 ? 0 : Math.round((correct / total) * 100);
      return [dimension, score];
    })
  ) as DimensionScoreMap;
}

export function generateDimensionAnalysis(
  dimensionScores: DimensionScoreMap
): DimensionAnalysis[] {
  return QUESTION_DIMENSIONS.map((dimension) => {
    const score = dimensionScores[dimension];
    const status = getDimensionStatus(score);
    return {
      dimension,
      score,
      status,
      hint: generateDimensionAnalysisText(dimension, status),
      description: DIMENSION_META_MAP[dimension].description,
    };
  });
}

export function calculateQuizResult(
  questions: QuizQuestion[],
  answers: QuizAnswerInput[],
  options?: {
    courses?: import('@/types/quiz').Course[];
  }
): QuizAnalysisResult {
  const totalQuestions = questions.length;
  const correctCount = questions.filter((question) => {
    const answer = answers.find((item) => item.questionId === question.id);
    return answer && answer.selectedAnswer === question.correct_answer;
  }).length;

  const totalScore = totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);
  const overallLevel = calculateOverallLevel(totalScore);
  const dimensionScores = calculateDimensionScores(questions, answers);
  const dimensionAnalysis = generateDimensionAnalysis(dimensionScores);
  const weaknessSummary = generateWeaknessSummary(dimensionAnalysis);
  const studySuggestions = generateStudySuggestions(dimensionAnalysis);
  const recommendedCourses = getRecommendedCourses(
    { dimensionAnalysis, overallLevel },
    options?.courses
  );
  const enrollmentCTA = generateEnrollmentCTA(overallLevel, dimensionAnalysis);

  return {
    totalScore,
    overallLevel,
    dimensionScores,
    dimensionAnalysis,
    weaknessSummary,
    enrollmentCTA,
    studySuggestions,
    recommendedCourses,
  };
}

