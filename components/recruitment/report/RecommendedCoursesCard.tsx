import type { MvpEnrollmentCourse } from '@/lib/mvp/report-narrative';

interface RecommendedCoursesCardProps {
  courses: MvpEnrollmentCourse[];
  /** 若提供，課程卡 CTA 導向試聽頁並帶入分析參數 */
  bookingHref?: string;
}

export default function RecommendedCoursesCard({ courses, bookingHref }: RecommendedCoursesCardProps) {
  const ctaHref = bookingHref ?? '/landing#course-overview';
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="font-['Noto_Serif_TC','Noto_Serif',serif] text-xl font-bold text-slate-900">課程方向參考</h2>
      <p className="mt-2 text-sm text-slate-600">
        以下課程為依本次檢測結果整理的參考方向，實際排課與班級規劃請以現場諮詢為準。
      </p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {courses.map((c) => (
          <article
            key={c.id}
            className="flex flex-col rounded-2xl border border-slate-100 bg-slate-50/40 p-5 shadow-sm ring-1 ring-slate-100/80 transition hover:border-sky-200 hover:bg-white"
          >
            <h3 className="text-base font-bold text-slate-900">{c.title}</h3>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-sky-800">適合對象</p>
            <p className="mt-1 text-sm text-slate-700">{c.targetStudents}</p>
            <p className="mt-4 text-xs font-semibold text-slate-500">為什麼推薦</p>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-700">{c.recommendedReason}</p>
            <p className="mt-3 text-sm text-slate-600">{c.description}</p>
            <a
              href={ctaHref}
              className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-sky-600 px-4 py-2.5 text-center text-sm font-bold text-white shadow-sm transition hover:bg-sky-700"
            >
              {c.ctaLabel}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
