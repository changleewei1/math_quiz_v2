'use client';

import { useMemo, useState, useTransition } from 'react';
import type { QuestionItem } from '@/lib/questions';
import { DIMENSION_LABEL } from '@/lib/questions';
import QuizProgressHeader from '@/components/quiz/QuizProgressHeader';
import QuizOptionList from '@/components/quiz/QuizOptionList';
import MvpQuizNavigationBar from '@/components/quiz/MvpQuizNavigationBar';
import { submitMvpFunnelQuiz } from '@/app/quiz/[sessionId]/actions';

interface Props {
  sessionId: string;
  questions: QuestionItem[];
  /** 由伺服器從 leads 帶入，供分析抬頭與報告姓名 */
  studentNameFromLead?: string;
}

export default function QuizCard({ sessionId, questions, studentNameFromLead }: Props) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const current = questions[index];

  const displayHint = useMemo(() => studentNameFromLead?.trim() || '', [studentNameFromLead]);

  const submit = () => {
    setSubmitError(null);
    const payload = questions.map((q) => ({
      questionId: q.id,
      selected: answers[q.id] ?? '',
    }));
    if (payload.some((a) => !a.selected.trim())) {
      setSubmitError('請完成所有題目後再送出。');
      return;
    }
    startTransition(async () => {
      const res = await submitMvpFunnelQuiz(sessionId, payload);
      if (!res.ok) {
        setSubmitError(res.error ?? '送出失敗，請稍後再試。');
        return;
      }
      window.location.assign(`/report/${sessionId}`);
    });
  };

  return (
    <section className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-100/80">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-8 sm:py-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-sky-800">升國一數學 · 能力檢測</p>
        <p className="mt-1 text-sm text-slate-600">請依孩子目前理解作答；本工具用於診斷取向，與段考排名無關。</p>
        {displayHint ? (
          <p className="mt-2 text-sm font-medium text-slate-800">測驗對象：{displayHint}</p>
        ) : null}
      </div>

      <div className="px-5 py-6 sm:px-8 sm:py-8">
        <QuizProgressHeader
          className="border-b border-slate-100 pb-5"
          currentIndex={index}
          total={questions.length}
        />

        <p className="mt-5 inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-900 ring-1 ring-sky-100">
          檢測向度：{DIMENSION_LABEL[current.dimension]}
        </p>
        <h2 className="mt-3 text-lg font-bold leading-snug text-slate-900 sm:text-xl">{current.question}</h2>

        <QuizOptionList
          options={current.options}
          selected={answers[current.id]}
          onSelect={(option) => setAnswers((prev) => ({ ...prev, [current.id]: option }))}
        />

        {submitError ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {submitError}
          </div>
        ) : null}

        <MvpQuizNavigationBar
          canGoPrev={index > 0}
          canGoNext={index < questions.length - 1}
          onPrev={() => setIndex((i) => Math.max(0, i - 1))}
          onNext={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
          onSubmit={submit}
          isSubmitting={isPending}
        />

        <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">
          請依目前理解作答，系統會依結果提供補強建議；不會因單題錯誤而評判孩子能力。
        </p>
      </div>
    </section>
  );
}
