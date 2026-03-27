import type { FunnelStage } from '@/lib/admin/types';

interface FunnelCardProps {
  stages: FunnelStage[];
}

export default function FunnelCard({ stages }: FunnelCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">招生漏斗</h2>
      <p className="mt-1 text-sm text-slate-500">從留資料到報名的轉換路徑概況。</p>
      <div className="mt-6 space-y-3">
        {stages.map((stage) => (
          <div key={stage.key} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{stage.label}</span>
              <span className="text-slate-500">{stage.percentage}%</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xl font-semibold text-slate-900">{stage.count}</span>
              <div className="h-2 w-32 rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-indigo-500"
                  style={{ width: `${stage.percentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


