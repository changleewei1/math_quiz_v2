'use client';

import { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { loginAction } from '@/app/login/actions';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/admin';
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.ok === false) {
        setError(result.message ?? '登入失敗，請稍後再試。');
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="redirect" value={redirectTo} />
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Email</label>
        <input
          type="email"
          name="email"
          required
          placeholder="admin@example.com"
          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">密碼</label>
        <input
          type="password"
          name="password"
          required
          placeholder="請輸入密碼"
          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
        />
      </div>
      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? '登入中…' : '登入後台'}
      </button>
    </form>
  );
}


