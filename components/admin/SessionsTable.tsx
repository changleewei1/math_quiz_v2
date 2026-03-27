import Link from 'next/link';
import type { SessionListItem } from '@/lib/admin/types';
import { formatDateTime, truncateText } from '@/lib/admin/formatters';
import LeadStatusBadge from '@/components/admin/LeadStatusBadge';
import OverallLevelBadge from '@/components/admin/OverallLevelBadge';
import { DIMENSION_LABELS } from '@/lib/admin/constants';

interface SessionsTableProps {
  sessions: SessionListItem[];
}

const SHORT_LABELS: Record<string, string> = {
  number_sense: '數感',
  algebra_logic: '代數',
  word_problem: '文字',
  geometry: '幾何',
  data_reasoning: '資料',
};

export default function SessionsTable({ sessions }: SessionsTableProps) {
  if (sessions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        目前沒有符合條件的測驗紀錄
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b text-left text-slate-500">
            <th className="px-4 py-3">學生姓名</th>
            <th className="px-4 py-3">開始時間</th>
            <th className="px-4 py-3">完成時間</th>
            <th className="px-4 py-3">總分</th>
            <th className="px-4 py-3">程度</th>
            <th className="px-4 py-3">向度摘要</th>
            <th className="px-4 py-3">弱點摘要</th>
            <th className="px-4 py-3">狀態</th>
            <th className="px-4 py-3">操作</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.id} className="border-b">
              <td className="px-4 py-3 font-medium text-slate-700">{session.student_name}</td>
              <td className="px-4 py-3 text-slate-500">{formatDateTime(session.started_at)}</td>
              <td className="px-4 py-3 text-slate-500">{formatDateTime(session.completed_at)}</td>
              <td className="px-4 py-3 text-slate-700">{session.total_score ?? '—'}</td>
              <td className="px-4 py-3">
                {session.overall_level ? <OverallLevelBadge level={session.overall_level} /> : '—'}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {session.dimension_scores
                  ? Object.entries(session.dimension_scores)
                      .map(([dimension, score]) => `${SHORT_LABELS[dimension] || DIMENSION_LABELS[dimension as keyof typeof DIMENSION_LABELS]} ${score}`)
                      .join(' / ')
                  : '尚未作答'}
              </td>
              <td className="px-4 py-3 text-slate-500">
                {session.weakness_summary ? truncateText(session.weakness_summary, 32) : '—'}
              </td>
              <td className="px-4 py-3">
                <LeadStatusBadge status={session.lead_status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/report/${session.id}`}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    查看報告
                  </Link>
                  <button type="button" className="text-slate-500 hover:text-slate-700">
                    作答摘要
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


