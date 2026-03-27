'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { submitTrialBooking } from '@/app/booking/actions';
import {
  type BookingUrlParams,
  parseWeakDimensions,
  normalizeOverallLevel,
  weakDimensionsLabel,
  courseTitleFromId,
} from '@/components/booking/booking-utils';
import BookingHeroSection from '@/components/booking/BookingHeroSection';
import BookingReasonsSection from '@/components/booking/BookingReasonsSection';
import TeacherSupportSection from '@/components/booking/TeacherSupportSection';
import PersonalizedBookingSummaryCard from '@/components/booking/PersonalizedBookingSummaryCard';
import TrialBookingForm from '@/components/booking/TrialBookingForm';
import BookingFAQSection from '@/components/booking/BookingFAQSection';
import BookingFinalCTASection from '@/components/booking/BookingFinalCTASection';
import SuccessStateCard from '@/components/booking/SuccessStateCard';

const MVP_PREFILL_KEY = 'mvp-booking-prefill';

interface Props {
  initialParams: BookingUrlParams;
}

export default function BookingPageClient({ initialParams }: Props) {
  const [params, setParams] = useState<BookingUrlParams>(initialParams);
  const [formState, formAction, isPending] = useActionState(submitTrialBooking, undefined);

  useEffect(() => {
    if (formState?.ok === true) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [formState?.ok]);

  useEffect(() => {
    const hasUrlData =
      initialParams.studentName.trim() !== '' ||
      initialParams.weakRaw.trim() !== '' ||
      initialParams.courseId.trim() !== '';
    if (hasUrlData) return;

    try {
      const raw = sessionStorage.getItem(MVP_PREFILL_KEY);
      if (!raw) return;
      const j = JSON.parse(raw) as Partial<BookingUrlParams> & { weak?: string };
      setParams((prev) => ({
        studentName: j.studentName?.trim() || prev.studentName,
        level: (j.level || prev.level).trim(),
        weakRaw: (j.weakRaw ?? j.weak ?? prev.weakRaw).trim(),
        courseId: (j.courseId ?? prev.courseId).trim(),
        sessionId: (j.sessionId ?? prev.sessionId).trim(),
        leadId: (typeof j.leadId === 'string' ? j.leadId : prev.leadId).trim(),
      }));
    } catch {
      /* ignore */
    }
  }, [initialParams.studentName, initialParams.weakRaw, initialParams.courseId]);

  const overallLevel = useMemo(() => normalizeOverallLevel(params.level), [params.level]);
  const weakDims = useMemo(() => parseWeakDimensions(params.weakRaw), [params.weakRaw]);
  const weakLabelsDisplay = weakDims.length ? weakDimensionsLabel(weakDims) : '';
  const courseTitle = courseTitleFromId(params.courseId) ?? '';
  const band: 'strong' | 'fragile' = overallLevel === 'C' || overallLevel === 'D' ? 'fragile' : 'strong';

  const reportHref = params.sessionId.trim() ? `/report/${params.sessionId.trim()}` : undefined;

  const weakForHidden = weakLabelsDisplay || params.weakRaw.trim();
  const weakDimensionsJson = JSON.stringify(weakDims);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-sky-50/25 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/landing" className="text-sm font-semibold text-sky-700 hover:text-sky-900">
            ← 回介紹頁
          </Link>
          {reportHref ? (
            <Link href={reportHref} className="text-sm font-medium text-slate-600 hover:text-slate-900">
              返回分析報告
            </Link>
          ) : null}
        </div>

        {formState?.ok === true ? (
          <div className="mx-auto mt-10 max-w-lg">
            <SuccessStateCard reportHref={reportHref} />
          </div>
        ) : (
          <>
            <div className="mt-8">
              <BookingHeroSection
                params={params}
                overallLevel={overallLevel}
                weakLabelsDisplay={weakLabelsDisplay}
                band={band}
              />
            </div>

            <div className="mt-10 grid grid-cols-1 gap-10 lg:mt-12 lg:grid-cols-12 lg:gap-12">
              {/* 手機：表單在前；桌機：右欄表單 */}
              <div className="order-1 space-y-6 lg:order-2 lg:col-span-5 lg:sticky lg:top-8 lg:self-start">
                <PersonalizedBookingSummaryCard
                  studentName={params.studentName}
                  overallLevel={overallLevel}
                  weakDims={weakDims}
                  courseId={params.courseId}
                />
                <TrialBookingForm
                  formAction={formAction}
                  state={formState}
                  isPending={isPending}
                  defaultStudentName={params.studentName}
                  overallLevel={overallLevel}
                  weakDimensionsRaw={weakForHidden}
                  weakDimensionsJson={weakDimensionsJson}
                  recommendedCourseTitle={courseTitle}
                  leadId={params.leadId}
                />
                <aside className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-xs leading-relaxed text-slate-600">
                  送出後由專人與您聯繫確認時段。若資料有誤，可來電更正，無需重複送出。
                </aside>
              </div>

              <div className="order-2 space-y-10 lg:order-1 lg:col-span-7">
                <BookingReasonsSection />
                <TeacherSupportSection />
                <BookingFAQSection />
              </div>
            </div>

            <div className="mt-14">
              <BookingFinalCTASection reportHref={reportHref} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
