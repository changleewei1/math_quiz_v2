import LeadStatusBadge from '@/components/admin/LeadStatusBadge';
import AssignedStaffBadge from '@/components/admin/AssignedStaffBadge';
import FollowUpBadge from '@/components/admin/FollowUpBadge';
import { formatDateTime } from '@/lib/admin/formatters';
import type { LeadDetailData } from '@/lib/admin/crm-types';

interface LeadBasicInfoCardProps {
  lead: LeadDetailData;
}

export default function LeadBasicInfoCard({ lead }: LeadBasicInfoCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">名單基本資料</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs text-slate-500">學生姓名</p>
          <p className="text-sm font-medium text-slate-900">{lead.student_name}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">家長姓名</p>
          <p className="text-sm font-medium text-slate-900">{lead.parent_name}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">聯絡電話</p>
          <p className="text-sm font-medium text-slate-900">{lead.phone}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">LINE ID</p>
          <p className="text-sm font-medium text-slate-900">{lead.line_id || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">畢業國小</p>
          <p className="text-sm font-medium text-slate-900">{lead.elementary_school}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">即將就讀國中</p>
          <p className="text-sm font-medium text-slate-900">{lead.junior_high_school || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">狀態</p>
          <LeadStatusBadge status={lead.status} />
        </div>
        <div>
          <p className="text-xs text-slate-500">指派人員</p>
          <AssignedStaffBadge name={lead.assigned_profile?.full_name} />
        </div>
        <div>
          <p className="text-xs text-slate-500">最近聯絡</p>
          <p className="text-sm font-medium text-slate-900">{formatDateTime(lead.last_contacted_at)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">追蹤提醒</p>
          <FollowUpBadge nextFollowUpAt={lead.next_follow_up_at} />
        </div>
        <div>
          <p className="text-xs text-slate-500">建立時間</p>
          <p className="text-sm font-medium text-slate-900">{formatDateTime(lead.created_at)}</p>
        </div>
      </div>
    </div>
  );
}


