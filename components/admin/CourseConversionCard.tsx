import type { CourseConversionMetric } from '@/lib/types/analytics';

export default function CourseConversionCard({ items }: { items: CourseConversionMetric[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">試聽課程轉換分析</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.courseName} className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-semibold">{item.courseName}</p>
            <p className="text-xs text-slate-500">
              試聽 {item.trialCount} · 出席 {item.attendedCount} · 報名 {item.enrolledCount} · 轉換率 {item.enrollRate}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}


