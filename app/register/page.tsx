import Link from 'next/link';
import LeadForm from '@/components/recruitment/LeadForm';
import TrustInfoCard from '@/components/recruitment/TrustInfoCard';

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">升國一數學 · 弱點檢測</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">填寫基本資料</h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
              填寫後即可開始檢測；完成後系統會依作答產出<strong className="font-semibold text-slate-800">個人化分析報告</strong>
              （含雷達圖、弱點說明與學習建議）。您留存的資料<strong className="font-semibold text-slate-800">僅用於產出報告與課程方向參考</strong>
              ，不另作行銷用途。
            </p>
          </div>
          <Link
            href="/landing"
            className="inline-flex shrink-0 items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            回介紹頁
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start lg:gap-10">
          <LeadForm />
          <TrustInfoCard />
        </div>
      </div>
    </main>
  );
}
