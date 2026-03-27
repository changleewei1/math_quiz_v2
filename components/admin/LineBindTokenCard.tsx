'use client';

import { useState, useTransition } from 'react';
import { createLeadLineBindTokenAction } from '@/app/admin/leads/[id]/actions';

export default function LineBindTokenCard({ leadId }: { leadId: string }) {
  const [isPending, startTransition] = useTransition();
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleGenerate = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await createLeadLineBindTokenAction(leadId);
      if (!result.ok) {
        setMessage(result.message ?? '建立綁定碼失敗');
        return;
      }
      setToken(result.token ?? null);
      setExpiresAt(result.expiresAt ?? null);
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">LINE 綁定碼</h2>
      <p className="mt-2 text-sm text-slate-600">
        讓家長加入 LINE 官方帳號後輸入綁定碼，即可接收試聽提醒與追蹤通知。
      </p>
      <div className="mt-4">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isPending}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isPending ? '產生中…' : '產生綁定碼'}
        </button>
      </div>
      {token ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          綁定碼：<span className="font-semibold">{token}</span>
          {expiresAt ? <span className="ml-2 text-xs text-slate-500">(到期：{expiresAt})</span> : null}
        </div>
      ) : null}
      {message ? (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600">
          {message}
        </div>
      ) : null}
    </div>
  );
}


