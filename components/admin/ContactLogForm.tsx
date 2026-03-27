'use client';

import { useState, useTransition } from 'react';
import { addContactLogAction } from '@/app/admin/leads/[id]/actions';

interface ContactLogFormProps {
  leadId: string;
}

export default function ContactLogForm({ leadId }: ContactLogFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setMessage(null);
    startTransition(async () => {
      const result = await addContactLogAction(leadId, formData);
      if (!result.ok) {
        setMessage(result.message ?? '新增失敗，請稍後再試。');
        return;
      }
      setMessage('聯絡紀錄已新增。');
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">聯絡方式</label>
          <select name="contact_type" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="phone">電話</option>
            <option value="line">LINE</option>
            <option value="in_person">面談</option>
            <option value="other">其他</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">聯絡結果</label>
          <select name="contact_result" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="no_answer">未接通</option>
            <option value="interested">有興趣</option>
            <option value="not_interested">無興趣</option>
            <option value="booked_trial">已預約試聽</option>
            <option value="enrolled">已報名</option>
            <option value="follow_up_later">稍後追蹤</option>
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700">摘要</label>
          <textarea
            name="summary"
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
            placeholder="請輸入本次聯絡摘要"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">下次追蹤時間</label>
          <input type="datetime-local" name="next_follow_up_at" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        </div>
      </div>
      {message ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
          {message}
        </div>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isPending ? '儲存中…' : '新增聯絡紀錄'}
      </button>
    </form>
  );
}


