import { BookOpen, User } from 'lucide-react';
import { levelDisplayLabel, weakDimensionsLabel, courseTitleFromId } from '@/components/booking/booking-utils';
import type { Dimension } from '@/lib/questions';
import type { MvpOverallLevel } from '@/types/mvp-funnel';

interface Props {
  studentName: string;
  overallLevel: MvpOverallLevel;
  weakDims: Dimension[];
  courseId: string;
}

export default function PersonalizedBookingSummaryCard({
  studentName,
  overallLevel,
  weakDims,
  courseId,
}: Props) {
  const name = studentName.trim() || '（尚未提供姓名）';
  const weakText = weakDimensionsLabel(weakDims);
  const courseTitle = courseTitleFromId(courseId);

  const hasPersonal = Boolean(studentName.trim() || weakDims.length || courseTitle);

  return (
    <section
      className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5 shadow-sm sm:p-6"
      aria-labelledby="summary-card-title"
    >
      <div className="flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-indigo-600" aria-hidden />
        <h2 id="summary-card-title" className="text-base font-bold text-slate-900 sm:text-lg">
          本次建議摘要
        </h2>
      </div>
      <p className="mt-2 text-xs text-slate-600 sm:text-sm">
        讓您知道：試聽安排會參考這份摘要，而不是隨機分班。
      </p>

      {hasPersonal ? (
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex gap-3 rounded-lg bg-white/80 px-3 py-2.5 ring-1 ring-indigo-100/80">
            <dt className="flex shrink-0 items-center gap-1.5 font-semibold text-slate-500">
              <User className="h-4 w-4" aria-hidden />
              學生
            </dt>
            <dd className="font-medium text-slate-900">{name}</dd>
          </div>
          <div className="flex flex-wrap gap-3 rounded-lg bg-white/80 px-3 py-2.5 ring-1 ring-indigo-100/80">
            <dt className="shrink-0 font-semibold text-slate-500">本次程度</dt>
            <dd className="font-bold text-slate-900">{levelDisplayLabel(overallLevel)}</dd>
          </div>
          <div className="rounded-lg bg-white/80 px-3 py-2.5 ring-1 ring-indigo-100/80">
            <dt className="font-semibold text-slate-500">建議優先補強</dt>
            <dd className="mt-1 font-medium text-slate-800">
              {weakText || '由老師依作答與現場狀態協助確認'}
            </dd>
          </div>
          <div className="rounded-lg bg-white/80 px-3 py-2.5 ring-1 ring-indigo-100/80">
            <dt className="font-semibold text-slate-500">建議試聽方向</dt>
            <dd className="mt-1 font-medium text-slate-800">
              {courseTitle ?? '由老師依測驗結果與現場狀況安排合適班型深度'}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="mt-5 rounded-lg bg-white/80 px-4 py-3 text-sm leading-relaxed text-slate-700 ring-1 ring-indigo-100/80">
          若您尚未從分析報告進入本頁，建議由老師依測驗結果與現場互動，協助確認最適合的試聽內容與進度起點。
        </p>
      )}
    </section>
  );
}
