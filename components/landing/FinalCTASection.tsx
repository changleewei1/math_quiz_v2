import Link from 'next/link';
import { ArrowRight, FileEdit } from 'lucide-react';
import { LANDING_GUTTER_X } from './sectionShell';

export default function FinalCTASection() {
  return (
    <section className="py-14 sm:py-20 lg:py-24">
      <div className={`mx-auto max-w-7xl ${LANDING_GUTTER_X}`}>
        <div
          id="course-overview"
          className="relative overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-amber-50/60 px-5 py-10 shadow-lg shadow-slate-200/40 sm:rounded-3xl sm:px-10 sm:py-14 lg:px-16 lg:py-16"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-200/30 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-amber-200/25 blur-3xl" aria-hidden />

          <div className="relative mx-auto max-w-3xl text-center">
            <h2 className="font-['Noto_Serif_TC','Noto_Serif',serif] text-[1.375rem] font-bold leading-snug tracking-tight text-slate-900 sm:text-3xl lg:text-[1.875rem]">
              先看懂孩子目前的數學基礎，再決定暑假如何準備國一
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              用一份結構化報告取代猜測與焦慮；約 10 分鐘完成檢測，立即檢視弱點分布與補強優先順序。
            </p>

            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href="/register"
                className="mvp-cta inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-bold sm:min-h-0 sm:min-w-[200px] sm:px-8"
              >
                立即開始檢測
                <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
              </Link>
              <Link
                href="/register"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-6 py-4 text-base font-bold text-slate-800 shadow-sm transition duration-200 hover:border-sky-400 hover:bg-sky-50/50 hover:text-sky-900 active:scale-[0.99] sm:min-h-0 sm:min-w-[200px] sm:px-8"
              >
                <FileEdit className="h-5 w-5 text-sky-600" aria-hidden />
                前往填寫資料
              </Link>
            </div>

            <p className="mt-6 text-sm text-slate-500">免費檢測 · 線上完成 · 完成後立即查看結果</p>
          </div>
        </div>
      </div>
    </section>
  );
}
