import ScoreBadge from '@/components/shared/ScoreBadge';
import type { OverallLevel } from '@/types/quiz';

function formatReportDate(iso: string | undefined): string {
  if (!iso) return new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
}

interface ReportHeaderCardProps {
  studentName: string;
  reportDate?: string;
  totalScore: number;
  overallLevel: OverallLevel;
  executiveSummary: string;
}

export default function ReportHeaderCard({
  studentName,
  reportDate,
  totalScore,
  overallLevel,
  executiveSummary,
}: ReportHeaderCardProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md ring-1 ring-slate-100/80">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-6 py-5 sm:px-8 sm:py-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-sky-700">升國一數學 · 弱點分析報告</p>
        <h1 className="mt-2 font-['Noto_Serif_TC','Noto_Serif',serif] text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {studentName}
        </h1>
        <p className="mt-1 text-sm text-slate-500">報告日期：{formatReportDate(reportDate)}</p>
      </div>
      <div className="grid gap-4 px-6 py-6 sm:grid-cols-2 sm:gap-6 sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-5 py-4">
            <p className="text-xs font-medium text-slate-500">總分（正確率）</p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">{totalScore}</p>
            <p className="text-xs text-slate-500">滿分 100</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-slate-500">整體等級</p>
            <ScoreBadge level={overallLevel} />
          </div>
        </div>
        <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-5 sm:col-span-2">
          <p className="text-xs font-bold text-sky-900">顧問式總結</p>
          <p className="mt-3 text-sm leading-[1.75] text-slate-800 sm:text-[0.9375rem]">{executiveSummary}</p>
        </div>
      </div>
    </section>
  );
}
