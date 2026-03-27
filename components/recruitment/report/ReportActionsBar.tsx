import Link from 'next/link';

export default function ReportActionsBar() {
  return (
    <div className="flex flex-col items-stretch justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-4 sm:flex-row sm:items-center sm:px-6">
      <p className="text-center text-xs text-slate-600 sm:text-left sm:text-sm">若想讓另一位孩子檢測，或重新填寫資料，可從此開始新的一輪。</p>
      <Link
        href="/register"
        className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:self-center"
      >
        返回重新檢測
      </Link>
    </div>
  );
}
