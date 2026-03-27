'use client';

import { useState, useTransition } from 'react';
import { addEnrollmentAction } from '@/app/admin/leads/[id]/actions';

interface EnrollmentFormProps {
  leadId: string;
}

export default function EnrollmentForm({ leadId }: EnrollmentFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setMessage(null);
    startTransition(async () => {
      const result = await addEnrollmentAction(leadId, formData);
      if (!result.ok) {
        setMessage(result.message ?? '新增失敗，請稍後再試。');
        return;
      }
      setMessage('報名紀錄已新增。');
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">報名課程</label>
          <input name="enrolled_course" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">學費</label>
          <input name="tuition_amount" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="可留空" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">報名日期</label>
          <input type="datetime-local" name="enrolled_at" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700">備註</label>
          <textarea name="notes" rows={2} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
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
        {isPending ? '儲存中…' : '新增報名紀錄'}
      </button>
    </form>
  );
}


