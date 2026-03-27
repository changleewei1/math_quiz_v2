import ScoreBadge from '@/components/shared/ScoreBadge';
import type { OverallLevel } from '@/types/quiz';

interface ReportHeaderCardProps {
  studentName: string;
  reportDate: string;
  totalScore: number;
  overallLevel: OverallLevel;
}

export default function ReportHeaderCard({
  studentName,
  reportDate,
  totalScore,
  overallLevel,
}: ReportHeaderCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">升國一數學弱點分析報告</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            {studentName} 的分析結果
          </h1>
          <p className="mt-1 text-sm text-slate-500">報告日期：{reportDate}</p>
        </div>
        <div className="text-right">
          <ScoreBadge level={overallLevel} />
          <p className="mt-3 text-3xl font-semibold text-slate-900">{totalScore} 分</p>
          <p className="text-xs text-slate-500">總分（滿分 100）</p>
        </div>
      </div>
    </div>
  );
}


