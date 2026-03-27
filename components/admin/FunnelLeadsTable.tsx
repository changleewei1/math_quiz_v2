import Link from 'next/link';
import type { FunnelLeadListItem } from '@/lib/db/funnel-leads';
import { formatDateTime } from '@/lib/admin/formatters';

interface FunnelLeadsTableProps {
  rows: FunnelLeadListItem[];
}

export default function FunnelLeadsTable({ rows }: FunnelLeadsTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        目前沒有符合條件的名單
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-[1100px] w-full text-sm">
        <thead>
          <tr className="border-b bg-slate-50 text-left text-slate-600">
            <th className="px-3 py-3 font-semibold">學生姓名</th>
            <th className="px-3 py-3 font-semibold">家長姓名</th>
            <th className="px-3 py-3 font-semibold">電話</th>
            <th className="px-3 py-3 font-semibold">國小</th>
            <th className="px-3 py-3 font-semibold">國中</th>
            <th className="px-3 py-3 font-semibold">建立時間</th>
            <th className="px-3 py-3 font-semibold">完成測驗</th>
            <th className="px-3 py-3 font-semibold">總分</th>
            <th className="px-3 py-3 font-semibold">等級</th>
            <th className="px-3 py-3 font-semibold">已預約試聽</th>
            <th className="px-3 py-3 font-semibold">操作</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/80">
              <td className="px-3 py-3 font-medium text-slate-800">{r.student_name}</td>
              <td className="px-3 py-3 text-slate-600">{r.parent_name}</td>
              <td className="px-3 py-3 whitespace-nowrap text-slate-600">{r.phone}</td>
              <td className="max-w-[140px] truncate px-3 py-3 text-slate-600" title={r.elementary_school}>
                {r.elementary_school}
              </td>
              <td className="max-w-[140px] truncate px-3 py-3 text-slate-600" title={r.junior_high_school ?? ''}>
                {r.junior_high_school || '—'}
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-slate-500">{formatDateTime(r.created_at)}</td>
              <td className="px-3 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    r.quiz_completed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {r.quiz_completed ? '已完成' : '未完成'}
                </span>
              </td>
              <td className="px-3 py-3 tabular-nums text-slate-700">
                {r.quiz_completed && r.total_score != null ? `${r.total_score}` : '—'}
              </td>
              <td className="px-3 py-3 text-slate-700">{r.quiz_completed && r.overall_level ? r.overall_level : '—'}</td>
              <td className="px-3 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    r.has_trial_booking ? 'bg-sky-100 text-sky-900' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {r.has_trial_booking ? '是' : '否'}
                </span>
              </td>
              <td className="px-3 py-3">
                {r.session_id && r.quiz_completed ? (
                  <Link
                    href={`/report/${r.session_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    查看報告
                  </Link>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
