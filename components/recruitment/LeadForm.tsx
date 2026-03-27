'use client';

import type { ReactNode } from 'react';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leadFormSchema, type LeadFormValues } from '@/lib/validations/lead-form';
import { createLeadAndSession } from '@/app/register/actions';

export default function LeadForm() {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      junior_high_school: '',
    },
  });

  const onSubmit = (values: LeadFormValues) => {
    startTransition(async () => {
      const res = await createLeadAndSession(values);
      if (!res.ok || !res.sessionId) {
        setError('root', { message: res.error ?? '送出失敗，請稍後再試。' });
        return;
      }
      window.location.assign(`/quiz/${res.sessionId}`);
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-md ring-1 ring-slate-100/80 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="學生姓名" error={errors.student_name?.message}>
          <input
            {...register('student_name')}
            placeholder="請輸入姓名"
            autoComplete="name"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </Field>
        <Field label="家長姓名" error={errors.parent_name?.message}>
          <input
            {...register('parent_name')}
            placeholder="主要聯絡人"
            autoComplete="name"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </Field>
        <Field label="聯絡電話" error={errors.phone?.message}>
          <input
            {...register('phone')}
            placeholder="市話或手機"
            inputMode="tel"
            autoComplete="tel"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </Field>
        <Field label="就讀國小" error={errors.elementary_school?.message}>
          <input
            {...register('elementary_school')}
            placeholder="學校全名"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="預計升學之國中（選填）" error={errors.junior_high_school?.message}>
            <input
              {...register('junior_high_school')}
              placeholder="學校全名或學區，可稍後補上"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </Field>
        </div>
      </div>
      {errors.root?.message ? (
        <p className="mt-4 text-sm font-medium text-rose-600">{errors.root.message}</p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="mt-8 inline-flex w-full min-h-[52px] items-center justify-center rounded-xl bg-sky-600 px-4 py-3.5 text-base font-bold text-white shadow-md shadow-sky-600/20 transition hover:bg-sky-700 disabled:opacity-60"
      >
        {isPending ? '處理中…' : '開始測驗，查看分析'}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-800">{label}</span>
      {children}
      {error ? <span className="mt-1.5 block text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}
