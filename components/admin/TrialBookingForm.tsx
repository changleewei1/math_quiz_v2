'use client';

import { useState, useTransition } from 'react';
import { addTrialBookingAction } from '@/app/admin/leads/[id]/actions';

interface TrialBookingFormProps {
  leadId: string;
}

export default function TrialBookingForm({ leadId }: TrialBookingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setMessage(null);
    startTransition(async () => {
      const result = await addTrialBookingAction(leadId, formData);
      if (!result.ok) {
        setMessage(result.message ?? '新增失敗，請稍後再試。');
        return;
      }
      setMessage('試聽預約已新增。');
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">試聽日期</label>
          <input type="datetime-local" name="trial_date" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">課程名稱</label>
          <input name="course_name" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">狀態</label>
          <select name="status" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="booked">已預約</option>
            <option value="attended">已出席</option>
            <option value="absent">未出席</option>
            <option value="rescheduled">改期</option>
            <option value="cancelled">取消</option>
          </select>
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
        {isPending ? '儲存中…' : '新增試聽預約'}
      </button>
    </form>
  );
}


