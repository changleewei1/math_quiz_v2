'use client';

import { useEffect, useRef } from 'react';
import type { TrialBookingActionState } from '@/app/booking/actions';
import { MVP_PREFERRED_TIME_OPTIONS } from '@/lib/validations/mvp-trial-booking-form';

interface Props {
  formAction: (payload: FormData) => void;
  state: TrialBookingActionState | undefined;
  isPending: boolean;
  defaultStudentName: string;
  overallLevel: string;
  weakDimensionsRaw: string;
  /** 結構化向度陣列 JSON，寫入 trial_bookings.weak_dimensions */
  weakDimensionsJson: string;
  recommendedCourseTitle: string;
  leadId: string;
}

export default function TrialBookingForm({
  formAction,
  state,
  isPending,
  defaultStudentName,
  overallLevel,
  weakDimensionsRaw,
  weakDimensionsJson,
  recommendedCourseTitle,
  leadId,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok === false && state.fieldErrors && formRef.current) {
      const first = Object.keys(state.fieldErrors)[0];
      const el = first ? (formRef.current.querySelector(`#${first}`) as HTMLElement | null) : null;
      el?.focus();
    }
  }, [state]);

  return (
    <div id="trial-booking-form" className="scroll-mt-24">
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-lg ring-1 ring-slate-100/80 sm:p-8">
        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">填寫試聽預約</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          老師會依本次分析結果，協助安排適合的試聽方向。欄位精簡，約一分鐘可完成。
        </p>

        <form ref={formRef} action={formAction} className="mt-6 space-y-5">
          <input type="hidden" name="lead_id" value={leadId} />
          <input type="hidden" name="overall_level" value={overallLevel} />
          <input type="hidden" name="weak_dimensions" value={weakDimensionsRaw} />
          <input type="hidden" name="weak_dimensions_json" value={weakDimensionsJson} />
          <input type="hidden" name="recommended_course" value={recommendedCourseTitle} />

          <div>
            <label htmlFor="student_name" className="block text-sm font-semibold text-slate-800">
              學生姓名 <span className="text-rose-600">*</span>
            </label>
            <input
              id="student_name"
              name="student_name"
              required
              minLength={2}
              defaultValue={defaultStudentName}
              autoComplete="name"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="請填寫姓名"
            />
            {state?.ok === false && state.fieldErrors?.student_name ? (
              <p className="mt-1.5 text-xs font-medium text-rose-600">{state.fieldErrors.student_name}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="parent_name" className="block text-sm font-semibold text-slate-800">
              家長姓名 <span className="text-rose-600">*</span>
            </label>
            <input
              id="parent_name"
              name="parent_name"
              required
              minLength={2}
              autoComplete="name"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="主要聯絡人"
            />
            {state?.ok === false && state.fieldErrors?.parent_name ? (
              <p className="mt-1.5 text-xs font-medium text-rose-600">{state.fieldErrors.parent_name}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-slate-800">
              聯絡電話 <span className="text-rose-600">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              required
              minLength={8}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="市話或手機"
            />
            {state?.ok === false && state.fieldErrors?.phone ? (
              <p className="mt-1.5 text-xs font-medium text-rose-600">{state.fieldErrors.phone}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="preferred_time" className="block text-sm font-semibold text-slate-800">
              方便聯繫／試聽時段 <span className="text-rose-600">*</span>
            </label>
            <select
              id="preferred_time"
              name="preferred_time"
              required
              defaultValue=""
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
            >
              <option value="" disabled>
                請選擇
              </option>
              {MVP_PREFERRED_TIME_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {state?.ok === false && state.fieldErrors?.preferred_time ? (
              <p className="mt-1.5 text-xs font-medium text-rose-600">{state.fieldErrors.preferred_time}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-semibold text-slate-800">
              備註（選填）
            </label>
            <textarea
              id="note"
              name="note"
              rows={3}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="例如：孩子對數學較沒信心、曾補習過…"
            />
          </div>

          {state?.ok === false && state.message ? (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.message}</p>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="mvp-cta w-full min-h-[52px] rounded-xl py-3.5 text-base font-bold disabled:opacity-60"
          >
            {isPending ? '送出中…' : '預約免費試聽'}
          </button>

          <p className="text-center text-xs leading-relaxed text-slate-500">
            送出後會由老師與您聯繫安排時間。
            <br />
            預約試聽<strong className="font-semibold text-slate-700">不等於</strong>立即報名。
          </p>
        </form>
      </div>
    </div>
  );
}
