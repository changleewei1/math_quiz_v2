import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

interface Props {
  reportHref?: string;
}

export default function SuccessStateCard({ reportHref }: Props) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-8 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle2 className="h-8 w-8" aria-hidden />
      </div>
      <h2 className="mt-5 text-xl font-bold text-emerald-950">預約已送出</h2>
      <p className="mt-3 text-sm leading-relaxed text-emerald-900/95">
        我們會盡快與您聯繫，協助安排合適時段。
      </p>
      <p className="mt-2 text-sm text-emerald-800/90">
        老師會依您留下的聯絡方式與方便時段回覆；試聽不等於報名，您仍可從容決定。
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/landing"
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-emerald-300 bg-white px-5 text-sm font-semibold text-emerald-900 hover:bg-emerald-50"
        >
          返回首頁
        </Link>
        {reportHref ? (
          <Link
            href={reportHref}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white hover:bg-emerald-700"
          >
            返回分析報告
          </Link>
        ) : null}
      </div>
    </div>
  );
}
