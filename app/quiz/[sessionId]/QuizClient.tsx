'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { submitQuizSession } from '@/app/quiz/[sessionId]/actions';
import type { QuizAnswerInput, QuizQuestion } from '@/lib/quiz/types';
import QuizProgressHeader from '@/components/quiz/QuizProgressHeader';
import QuizCard from '@/components/quiz/QuizCard';
import QuizNavigationBar from '@/components/quiz/QuizNavigationBar';

interface QuizClientProps {
  sessionId: string;
  questions: QuizQuestion[];
}

export default function QuizClient({ sessionId, questions }: QuizClientProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerMap, setAnswerMap] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answerMap).length;
  const remainingCount = totalQuestions - answeredCount;

  const answers: QuizAnswerInput[] = useMemo(
    () =>
      questions
        .filter((question) => answerMap[question.id])
        .map((question) => ({
          questionId: question.id,
          selectedAnswer: answerMap[question.id],
        })),
    [answerMap, questions]
  );

  const handleSelect = (questionId: string, selectedAnswer: string) => {
    setAnswerMap((prev) => ({ ...prev, [questionId]: selectedAnswer }));
    setSubmitError(null);
  };

  const handleSubmit = () => {
    if (answers.length !== totalQuestions) {
      setSubmitError(`尚有 ${totalQuestions - answers.length} 題未作答，請完成後再送出。`);
      return;
    }

    startTransition(async () => {
      const result = await submitQuizSession(sessionId, answers);
      if (!result.ok) {
        setSubmitError(result.error ?? '送出失敗，請稍後再試。');
        return;
      }
      router.push(`/report/${sessionId}`);
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/90 bg-white px-5 py-4 shadow-sm sm:px-6">
        <QuizProgressHeader
          currentIndex={currentIndex}
          total={totalQuestions}
          unansweredCount={remainingCount}
        />
      </div>
      <QuizCard
        question={currentQuestion}
        selectedAnswer={answerMap[currentQuestion.id]}
        onSelect={(answer) => handleSelect(currentQuestion.id, answer)}
      />
      {submitError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {submitError}
        </div>
      ) : null}
      <QuizNavigationBar
        currentIndex={currentIndex}
        total={totalQuestions}
        onPrev={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
        onNext={() => setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1))}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
      />
      <p className="text-center text-xs text-slate-500">
        完成後立即產生個人化分析報告與課程建議。
      </p>
    </div>
  );
}


