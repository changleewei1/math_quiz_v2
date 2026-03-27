import StatusBadge from '@/components/shared/StatusBadge';
import { DIMENSION_META_MAP } from '@/lib/constants/dimensions';
import type { DimensionAnalysis } from '@/types/quiz';

interface DimensionAnalysisCardProps {
  analysis: DimensionAnalysis;
}

export default function DimensionAnalysisCard({ analysis }: DimensionAnalysisCardProps) {
  const meta = DIMENSION_META_MAP[analysis.dimension];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{meta.label}</h3>
          <p className="mt-1 text-sm text-slate-500">{meta.shortLabel}</p>
        </div>
        <StatusBadge status={analysis.status} />
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-slate-900">{analysis.score}%</span>
        <span className="text-xs text-slate-500">向度分數</span>
      </div>
      <p className="mt-3 text-sm text-slate-600">{analysis.description}</p>
      <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        {analysis.hint}
      </div>
    </div>
  );
}


