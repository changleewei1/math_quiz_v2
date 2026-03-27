'use client';

import { useState, useTransition } from 'react';
import { exportLeadsAction, exportSessionsAction } from '@/app/admin/export/actions';

interface ExportPanelProps {
  type: 'leads' | 'sessions';
}

export default function ExportPanel({ type }: ExportPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = (formData: FormData) => {
    setMessage(null);
    startTransition(async () => {
      const action = type === 'leads' ? exportLeadsAction : exportSessionsAction;
      const result = await action(formData);
      if (!result.ok) {
        setMessage('匯出失敗，請稍後再試。');
        return;
      }
      const blob = new Blob([Uint8Array.from(atob(result.base64), (c) => c.charCodeAt(0))], {
        type: result.mime,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <form action={handleExport} className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">匯出格式</label>
          <select name="format" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="xlsx">Excel (.xlsx)</option>
            <option value="csv">CSV (.csv)</option>
          </select>
        </div>
        {type === 'leads' ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">狀態</label>
              <select name="status" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <option value="">全部</option>
                <option value="new">新名單</option>
                <option value="started_quiz">已開始測驗</option>
                <option value="finished_quiz">已完成測驗</option>
                <option value="contacted">已聯絡</option>
                <option value="trial_booked">已預約試聽</option>
                <option value="enrolled">已報名</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">建立日期（起）</label>
              <input type="date" name="created_from" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">建立日期（迄）</label>
              <input type="date" name="created_to" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">完成狀態</label>
              <select name="completed" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <option value="">全部</option>
                <option value="true">已完成</option>
                <option value="false">未完成</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">整體程度</label>
              <select name="overall_level" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <option value="">全部</option>
                <option value="A">A 級</option>
                <option value="B">B 級</option>
                <option value="C">C 級</option>
                <option value="D">D 級</option>
              </select>
            </div>
          </>
        )}
      </div>
      {message ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600">
          {message}
        </div>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isPending ? '匯出中…' : type === 'leads' ? '匯出名單' : '匯出測驗結果'}
      </button>
    </form>
  );
}


