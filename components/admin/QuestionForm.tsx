'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  questionFormSchema,
  type QuestionFormInputValues,
  type QuestionFormValues,
} from '@/lib/validations/question-form';
import { DIMENSION_LABELS, DIFFICULTY_LABELS } from '@/lib/admin/constants';

interface QuestionFormProps {
  mode: 'create' | 'edit';
  initialValues: QuestionFormValues;
  onSubmitAction: (values: QuestionFormValues) => Promise<{ ok: boolean; message?: string }>;
}

export default function QuestionForm({ mode, initialValues, onSubmitAction }: QuestionFormProps) {
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const form = useForm<QuestionFormInputValues, unknown, QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: initialValues as QuestionFormInputValues,
  });

  const onSubmit = (values: QuestionFormValues) => {
    setSubmitError(null);
    setSubmitSuccess(null);
    startTransition(async () => {
      const result = await onSubmitAction(values);
      if (!result.ok) {
        setSubmitError(result.message ?? '送出失敗，請稍後再試。');
        return;
      }
      setSubmitSuccess(mode === 'create' ? '題目已新增完成。' : '題目已更新完成。');
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700">題目內容</label>
          <textarea
            rows={4}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            {...form.register('prompt')}
          />
          {form.formState.errors.prompt?.message ? (
            <p className="text-xs text-rose-500">{form.formState.errors.prompt.message}</p>
          ) : null}
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700">解析說明</label>
          <textarea
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            {...form.register('explanation')}
          />
        </div>
        {(['choice_1', 'choice_2', 'choice_3', 'choice_4'] as const).map((field, index) => (
          <div key={field} className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">選項 {index + 1}</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
              {...form.register(field)}
            />
            {form.formState.errors[field]?.message ? (
              <p className="text-xs text-rose-500">{form.formState.errors[field]?.message}</p>
            ) : null}
          </div>
        ))}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">正確答案</label>
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
            {...form.register('correct_answer')}
          />
          {form.formState.errors.correct_answer?.message ? (
            <p className="text-xs text-rose-500">{form.formState.errors.correct_answer.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">向度</label>
          <select
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
            {...form.register('dimension')}
          >
            {Object.entries(DIMENSION_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">難度</label>
          <select
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
            {...form.register('difficulty')}
          >
            {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">排序</label>
          <input
            type="number"
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
            {...form.register('sort_order', { valueAsNumber: true })}
          />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="is_active" {...form.register('is_active')} />
          <label htmlFor="is_active" className="text-sm text-slate-700">
            題目啟用
          </label>
        </div>
      </div>

      {submitError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {submitError}
        </div>
      ) : null}
      {submitSuccess ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
          {submitSuccess}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? '送出中…' : mode === 'create' ? '新增題目' : '更新題目'}
      </button>
    </form>
  );
}


