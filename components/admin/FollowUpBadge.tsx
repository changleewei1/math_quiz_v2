import { followUpLabel, getFollowUpStatus } from '@/lib/admin/follow-ups';

const statusStyles: Record<string, string> = {
  today: 'bg-amber-100 text-amber-700',
  overdue: 'bg-rose-100 text-rose-700',
  upcoming: 'bg-indigo-100 text-indigo-700',
  none: 'bg-slate-100 text-slate-600',
};

export default function FollowUpBadge({ nextFollowUpAt }: { nextFollowUpAt?: string | null }) {
  const status = getFollowUpStatus(nextFollowUpAt);
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}>
      {followUpLabel(status)}
    </span>
  );
}


