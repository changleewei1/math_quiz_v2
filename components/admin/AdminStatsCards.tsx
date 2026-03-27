import type { DashboardStats } from '@/lib/admin/types';

interface AdminStatsCardsProps {
  stats: DashboardStats;
}

const items = [
  { key: 'totalLeads', label: '總 lead 數', tone: 'bg-indigo-50 text-indigo-700' },
  { key: 'startedQuiz', label: '開始測驗數', tone: 'bg-blue-50 text-blue-700' },
  { key: 'finishedQuiz', label: '完成測驗數', tone: 'bg-emerald-50 text-emerald-700' },
  { key: 'trialBooked', label: '預約試聽數', tone: 'bg-amber-50 text-amber-700' },
  { key: 'enrolled', label: '已報名數', tone: 'bg-rose-50 text-rose-700' },
];

export default function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => (
        <div key={item.key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-600">{item.label}</p>
          <p className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${item.tone}`}>
            {stats[item.key as keyof DashboardStats]}
          </p>
        </div>
      ))}
    </div>
  );
}


