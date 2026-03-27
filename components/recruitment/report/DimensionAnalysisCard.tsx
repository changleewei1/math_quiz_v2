import StatusBadge from '@/components/shared/StatusBadge';
import type { DimensionStatus } from '@/types/quiz';

interface DimensionAnalysisCardProps {
  label: string;
  percentage: number;
  status: DimensionStatus;
  explanation: string;
  strengthenFocus: string;
}

export default function DimensionAnalysisCard({
  label,
  percentage,
  status,
  explanation,
  strengthenFocus,
}: DimensionAnalysisCardProps) {
  return (
    <article className="flex flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{label}</h3>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-800">{percentage}%</p>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 text-sm leading-relaxed text-slate-700">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">說明</p>
          <p className="mt-1.5">{explanation}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">補強重點</p>
          <p className="mt-1.5 font-medium text-slate-800">{strengthenFocus}</p>
        </div>
      </div>
    </article>
  );
}
