'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormFieldWrapper from '@/components/forms/FormFieldWrapper';
import { createLeadAndSession } from '@/app/register/actions';
import { leadFormSchema, type LeadFormValues } from '@/lib/validations/lead-form';

export default function LeadForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      student_name: '',
      parent_name: '',
      phone: '',
      elementary_school: '',
      junior_high_school: '',
    },
  });

  const onSubmit = (values: LeadFormValues) => {
    setSubmitError(null);
    startTransition(async () => {
      const result = await createLeadAndSession(values);
      if (!result.ok || !result.sessionId) {
        setSubmitError(result.error ?? '送出失敗，請稍後再試。');
        return;
      }
      router.push(`/quiz/${result.sessionId}`);
    });
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <FormFieldWrapper
          label="學生姓名"
          htmlFor="student_name"
          error={form.formState.errors.student_name?.message}
        >
          <input
            id="student_name"
            type="text"
            placeholder="例如：王小明"
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            {...form.register('student_name')}
          />
        </FormFieldWrapper>
        <FormFieldWrapper
          label="家長姓名"
          htmlFor="parent_name"
          error={form.formState.errors.parent_name?.message}
        >
          <input
            id="parent_name"
            type="text"
            placeholder="例如：王媽媽"
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            {...form.register('parent_name')}
          />
        </FormFieldWrapper>
        <FormFieldWrapper
          label="聯絡電話"
          htmlFor="phone"
          error={form.formState.errors.phone?.message}
        >
          <input
            id="phone"
            type="tel"
            placeholder="例如：0912-345-678"
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            {...form.register('phone')}
          />
        </FormFieldWrapper>
        <FormFieldWrapper
          label="畢業國小"
          htmlFor="elementary_school"
          error={form.formState.errors.elementary_school?.message}
        >
          <input
            id="elementary_school"
            type="text"
            placeholder="例如：大同國小"
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            {...form.register('elementary_school')}
          />
        </FormFieldWrapper>
        <FormFieldWrapper
          label="即將就讀國中（選填）"
          htmlFor="junior_high_school"
          error={form.formState.errors.junior_high_school?.message}
        >
          <input
            id="junior_high_school"
            type="text"
            placeholder="例如：大同國中"
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            {...form.register('junior_high_school')}
          />
        </FormFieldWrapper>
      </div>

      {submitError ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {submitError}
        </div>
      ) : null}

      <p className="mt-5 text-xs text-slate-500">
        我們會將資料用於檢測報告、學習建議與課程銜接說明，不會任意公開個人資訊。
      </p>

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? '送出中…' : '送出並開始免費檢測'}
      </button>
    </form>
  );
}

