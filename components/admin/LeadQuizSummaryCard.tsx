import Link from 'next/link';
import OverallLevelBadge from '@/components/admin/OverallLevelBadge';
import { DIMENSION_LABELS } from '@/lib/admin/constants';
import type { LeadDetailData } from '@/lib/admin/crm-types';

interface LeadQuizSummaryCardProps {
  lead: LeadDetailData;
}

export default function LeadQuizSummaryCard({ lead }: LeadQuizSummaryCardProps) {
  const session = lead.latest_session;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">測驗摘要</h2>
      {session ? (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-slate-600">總分：</p>
            <span className="text-xl font-semibold text-slate-900">{session.total_score ?? '—'}</span>
            {session.overall_level ? <OverallLevelBadge level={session.overall_level} /> : null}
          </div>
          <div className="text-sm text-slate-600">
            {session.dimension_scores
              ? Object.entries(session.dimension_scores)
                  .map(([dimension, score]) => `${DIMENSION_LABELS[dimension as keyof typeof DIMENSION_LABELS]} ${score}`)
                  .join(' / ')
              : '尚未產出向度分析'}
          </div>
          <Link
            href={`/report/${session.id}`}
            className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            查看完整報告
          </Link>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
          尚未完成測驗
        </div>
      )}
    </div>
  );
}


