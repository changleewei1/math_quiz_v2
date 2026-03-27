import Link from 'next/link';

interface Props {
  reportHref?: string;
}

export default function BookingFinalCTASection({ reportHref }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-sky-50/50 px-6 py-10 text-center sm:px-10">
      <h2 className="font-['Noto_Serif_TC','Noto_Serif',serif] text-lg font-bold text-slate-900 sm:text-xl">
        先確認現況，再決定下一步
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-600">
        現在先讓老師看過孩子的學習狀況，通常比開學後一邊追進度一邊補洞更輕鬆。您不需要急著選方案——試聽只是先把「適合的起點」找出來。
      </p>
      <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
        <a
          href="#trial-booking-form"
          className="mvp-cta inline-flex min-h-[48px] items-center justify-center rounded-xl px-6 text-sm font-bold"
        >
          預約免費試聽
        </a>
        {reportHref ? (
          <Link
            href={reportHref}
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            返回分析報告
          </Link>
        ) : null}
      </div>
    </section>
  );
}
