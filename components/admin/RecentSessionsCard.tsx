import Link from 'next/link';
import type { RecentSessionItem } from '@/lib/admin/types';
import { formatDateTime } from '@/lib/admin/formatters';
import OverallLevelBadge from '@/components/admin/OverallLevelBadge';
import LeadStatusBadge from '@/components/admin/LeadStatusBadge';

interface RecentSessionsCardProps {
  sessions: RecentSessionItem[];
}

export default function RecentSessionsCard({ sessions }: RecentSessionsCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">最近完成測驗學生</h2>
      <p className="mt-1 text-sm text-slate-500">快速查看近期完成測驗的名單。</p>
      <div className="mt-4 overflow-x-auto">
        {sessions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            尚無完成測驗的學生
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="py-2 pr-4">學生姓名</th>
                <th className="py-2 pr-4">完成時間</th>
                <th className="py-2 pr-4">總分</th>
                <th className="py-2 pr-4">程度</th>
                <th className="py-2 pr-4">狀態</th>
                <th className="py-2 pr-4">操作</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.sessionId} className="border-b">
                  <td className="py-3 pr-4 font-medium text-slate-700">{session.studentName}</td>
                  <td className="py-3 pr-4 text-slate-500">
                    {formatDateTime(session.completedAt)}
                  </td>
                  <td className="py-3 pr-4 text-slate-700">
                    {session.totalScore ?? '—'}
                  </td>
                  <td className="py-3 pr-4">
                    {session.overallLevel ? (
                      <OverallLevelBadge level={session.overallLevel} />
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <LeadStatusBadge status={session.leadStatus} />
                  </td>
                  <td className="py-3 pr-4">
                    <Link
                      href={`/report/${session.sessionId}`}
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      查看報告
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}


