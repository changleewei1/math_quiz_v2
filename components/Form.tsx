'use client';

import { z } from 'zod';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { newMvpSessionId, setMvpRegister } from '@/lib/mvp/client-storage';

const schema = z.object({
  student_name: z.string().min(1, '請輸入 student_name'),
  parent_name: z.string().min(1, '請輸入 parent_name'),
  phone: z.string().min(8, '請輸入正確 phone'),
  elementary_school: z.string().min(1, '請輸入 elementary_school'),
  junior_high_school: z.string().min(1, '請輸入 junior_high_school'),
});

type FormValues = z.infer<typeof schema>;

export default function Form() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (values: FormValues) => {
    const sessionId = newMvpSessionId();
    if (!setMvpRegister(sessionId, JSON.stringify(values))) {
      alert('無法儲存資料：請關閉無痕模式，或允許此網站使用儲存空間後再試。');
      return;
    }
    window.location.assign(`/quiz/${sessionId}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="student_name" error={errors.student_name?.message}>
          <input {...register('student_name')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </Field>
        <Field label="parent_name" error={errors.parent_name?.message}>
          <input {...register('parent_name')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </Field>
        <Field label="phone" error={errors.phone?.message}>
          <input {...register('phone')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </Field>
        <Field label="elementary_school" error={errors.elementary_school?.message}>
          <input {...register('elementary_school')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </Field>
        <div className="sm:col-span-2">
          <Field label="junior_high_school" error={errors.junior_high_school?.message}>
            <input {...register('junior_high_school')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </Field>
        </div>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {isSubmitting ? '送出中...' : '開始測驗'}
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
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-red-500">{error}</span> : null}
    </label>
  );
}
