import type { LeadStatus } from '@/types/quiz';
import { LEAD_STATUS_LABELS } from '@/lib/admin/constants';

const statusStyles: Record<LeadStatus, string> = {
  new: 'bg-slate-100 text-slate-700',
  started_quiz: 'bg-blue-100 text-blue-700',
  finished_quiz: 'bg-emerald-100 text-emerald-700',
  contacted: 'bg-indigo-100 text-indigo-700',
  trial_booked: 'bg-amber-100 text-amber-700',
  enrolled: 'bg-rose-100 text-rose-700',
};

export default function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}>
      {LEAD_STATUS_LABELS[status]}
    </span>
  );
}


