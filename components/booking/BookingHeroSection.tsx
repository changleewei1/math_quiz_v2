import { CalendarCheck, ShieldCheck } from 'lucide-react';
import { levelDisplayLabel, type BookingUrlParams } from '@/components/booking/booking-utils';
import type { MvpOverallLevel } from '@/types/mvp-funnel';

interface Props {
  params: BookingUrlParams;
  overallLevel: MvpOverallLevel;
  weakLabelsDisplay: string;
  /** A/B 與 C/D 文案微調 */
  band: 'strong' | 'fragile';
}

export default function BookingHeroSection({ params, overallLevel, weakLabelsDisplay, band }: Props) {
  const name = params.studentName.trim() || '孩子';
  const timingHint =
    band === 'fragile'
      ? '升國一前越早確認學習起點，通常越省力；試聽能幫您把「該從哪裡補」說清楚，不用猜。'
      : '趁基礎仍穩，提前銜接國一節奏與題型，開學後較能從容跟上；試聽讓老師幫您對準下一步。';

  return (
    <section className="relative overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-slate-50/80 p-6 shadow-lg shadow-sky-100/40 sm:p-8 lg:p-10">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-200/25 blur-2xl" aria-hidden />
      <div className="relative">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-900">
            <CalendarCheck className="h-3.5 w-3.5" aria-hidden />
            承接剛完成的分析
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            試聽≠立即報名
          </span>
        </div>

        <h1 className="mt-5 font-['Noto_Serif_TC','Noto_Serif',serif] text-2xl font-bold leading-snug tracking-tight text-slate-900 sm:text-3xl lg:text-[1.75rem] lg:leading-tight">
          根據孩子目前的分析結果，先安排一次試聽會更安心
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          這<strong className="font-semibold text-slate-800">不是</strong>
          立刻報名或決定方案，而是讓老師依本次檢測結果，先幫您看過孩子的程度與習慣，再一起確認最適合的銜接方式。升國一前先把方向談清楚，通常比開學後再補救更輕鬆。
        </p>

        <div className="mt-6 flex flex-wrap gap-3 rounded-xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
          <div className="min-w-[140px]">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">學生</p>
            <p className="mt-1 text-sm font-bold text-slate-900">{name}</p>
          </div>
          <div className="h-auto w-px bg-slate-200" aria-hidden />
          <div className="min-w-[100px]">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">本次程度</p>
            <p className="mt-1 text-sm font-bold text-slate-900">{levelDisplayLabel(overallLevel)}</p>
          </div>
          <div className="h-auto w-px bg-slate-200" aria-hidden />
          <div className="min-w-[200px] flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">建議優先關注</p>
            <p className="mt-1 text-sm font-medium text-slate-800">
              {weakLabelsDisplay || '由老師依測驗與現場互動協助確認'}
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-600">{timingHint}</p>

        <div className="mt-8">
          <a
            href="#trial-booking-form"
            className="mvp-cta inline-flex min-h-[52px] w-full items-center justify-center rounded-xl px-6 text-base font-bold sm:w-auto sm:min-w-[220px]"
          >
            預約免費試聽
          </a>
          <p className="mt-3 text-center text-xs text-slate-500 sm:text-left">
            向下捲動即可填寫簡短表單，約 1 分鐘可完成。
          </p>
        </div>
      </div>
    </section>
  );
}
