import Link from 'next/link';
import type { LeadListItem } from '@/lib/admin/types';
import { LEAD_STATUS_LABELS } from '@/lib/admin/constants';
import { formatDateTime } from '@/lib/admin/formatters';
import LeadStatusBadge from '@/components/admin/LeadStatusBadge';
import FollowUpBadge from '@/components/admin/FollowUpBadge';
import AssignedStaffBadge from '@/components/admin/AssignedStaffBadge';
import { updateLeadStatusAction } from '@/lib/admin/leads';

interface LeadsTableProps {
  leads: LeadListItem[];
}

export default function LeadsTable({ leads }: LeadsTableProps) {
  if (leads.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        目前沒有符合條件的名單
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b text-left text-slate-500">
            <th className="px-4 py-3">學生姓名</th>
            <th className="px-4 py-3">家長姓名</th>
            <th className="px-4 py-3">電話</th>
            <th className="px-4 py-3">畢業國小</th>
            <th className="px-4 py-3">即將就讀國中</th>
            <th className="px-4 py-3">狀態</th>
            <th className="px-4 py-3">指派人員</th>
            <th className="px-4 py-3">最近成績</th>
            <th className="px-4 py-3">最近聯絡</th>
            <th className="px-4 py-3">追蹤提醒</th>
            <th className="px-4 py-3">建立時間</th>
            <th className="px-4 py-3">操作</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b">
              <td className="px-4 py-3 font-medium text-slate-700">
                <Link href={`/admin/leads/${lead.id}`} className="text-indigo-600 hover:text-indigo-700">
                  {lead.student_name}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-600">{lead.parent_name}</td>
              <td className="px-4 py-3 text-slate-600">{lead.phone}</td>
              <td className="px-4 py-3 text-slate-600">{lead.elementary_school}</td>
              <td className="px-4 py-3 text-slate-600">{lead.junior_high_school || '—'}</td>
              <td className="px-4 py-3">
                <LeadStatusBadge status={lead.status} />
              </td>
              <td className="px-4 py-3">
                <AssignedStaffBadge name={lead.assigned_profile?.full_name} />
              </td>
              <td className="px-4 py-3 text-slate-600">
                {lead.latest_session?.total_score ?? '尚未作答'}
                {lead.latest_session?.overall_level ? (
                  <span className="ml-2 text-xs text-slate-500">
                    ({lead.latest_session.overall_level})
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-3 text-slate-500">
                {formatDateTime(lead.last_contacted_at)}
              </td>
              <td className="px-4 py-3">
                <FollowUpBadge nextFollowUpAt={lead.next_follow_up_at} />
              </td>
              <td className="px-4 py-3 text-slate-500">{formatDateTime(lead.created_at)}</td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/admin/sessions?search=${encodeURIComponent(lead.student_name)}`}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    查看測驗紀錄
                  </Link>
                  {lead.latest_session?.id ? (
                    <Link
                      href={`/report/${lead.latest_session.id}`}
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      查看報告
                    </Link>
                  ) : null}
                  <form action={updateLeadStatusAction} className="flex items-center gap-2">
                    <input type="hidden" name="leadId" value={lead.id} />
                    <select
                      name="status"
                      defaultValue={lead.status}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
                    >
                      {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded-lg bg-slate-900 px-2 py-1 text-xs font-semibold text-white"
                    >
                      更新
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

