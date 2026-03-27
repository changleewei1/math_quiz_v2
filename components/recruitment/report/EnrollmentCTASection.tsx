import Link from 'next/link';

/** 請替換為實際招生專線；目前為可點據之占位格式。 */
const TRIAL_TEL = 'tel:+886223456789';

export default function EnrollmentCTASection({ bookingHref }: { bookingHref: string }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-amber-50/50 px-6 py-10 shadow-lg shadow-slate-200/40 sm:px-10 sm:py-12">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky-200/30 blur-3xl" aria-hidden />
      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="font-['Noto_Serif_TC','Noto_Serif',serif] text-xl font-bold text-slate-900 sm:text-2xl">
          下一步：讓專業老師協助您落地規劃
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-700 sm:text-base">
          讓老師先幫您看過孩子的學習狀況，再一起討論最適合的安排。您可先填寫試聽預約（會帶入本次程度與弱點摘要），或致電專線，無需當場決定任何方案。
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          <Link
            href={bookingHref}
            className="mvp-cta inline-flex min-h-[48px] items-center justify-center rounded-xl px-6 py-3 text-sm font-bold"
          >
            前往預約試聽
          </Link>
          <a
            href={TRIAL_TEL}
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl border-2 border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:border-sky-400 hover:bg-sky-50/50"
          >
            致電洽詢
          </a>
          <Link
            href="/landing#course-overview"
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white"
          >
            了解先修課程
          </Link>
        </div>
      </div>
    </section>
  );
}
