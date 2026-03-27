import type { FunnelMetricItem } from '@/lib/types/analytics';

export default function FunnelAnalyticsCard({ items }: { items: FunnelMetricItem[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">招生漏斗分析</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <div key={item.stage} className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500">{item.stage}</p>
            <p className="text-xl font-semibold text-slate-900">{item.count}</p>
            <p className="text-xs text-slate-500">轉換率 {item.rate}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}


