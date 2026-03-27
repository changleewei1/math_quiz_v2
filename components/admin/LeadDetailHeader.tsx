import Link from 'next/link';
import LeadStatusBadge from '@/components/admin/LeadStatusBadge';
import type { LeadStatus } from '@/types/quiz';
import { updateLeadStatusQuickAction } from '@/app/admin/leads/[id]/actions';

interface LeadDetailHeaderProps {
  leadId: string;
  studentName: string;
  status: LeadStatus;
}

export default function LeadDetailHeader({ leadId, studentName, status }: LeadDetailHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Link href="/admin/leads" className="text-sm text-slate-500 hover:text-slate-700">
          ← 返回名單
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          {studentName} 的名單詳情
        </h1>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <LeadStatusBadge status={status} />
        <form action={updateLeadStatusQuickAction.bind(null, leadId, 'contacted')}>
          <button
            type="submit"
            className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
          >
            標記已聯絡
          </button>
        </form>
        <form action={updateLeadStatusQuickAction.bind(null, leadId, 'trial_booked')}>
          <button
            type="submit"
            className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"
          >
            標記已預約試聽
          </button>
        </form>
        <form action={updateLeadStatusQuickAction.bind(null, leadId, 'enrolled')}>
          <button
            type="submit"
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
          >
            標記已報名
          </button>
        </form>
      </div>
    </div>
  );
}

