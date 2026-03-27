import type { WeaknessConversionMetric } from '@/lib/types/analytics';
import { DIMENSION_LABELS } from '@/lib/admin/constants';

export default function WeaknessConversionCard({ items }: { items: WeaknessConversionMetric[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">弱點與轉換</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.dimension} className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-semibold">
              {DIMENSION_LABELS[item.dimension as keyof typeof DIMENSION_LABELS]}
            </p>
            <p className="text-xs text-slate-500">
              人數 {item.totalCount} · 報名 {item.enrolledCount} · 轉換率 {item.enrollRate}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}


