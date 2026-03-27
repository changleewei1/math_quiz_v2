import { ClipboardPenLine, FileCheck2, LineChart } from 'lucide-react';
import { LANDING_GUTTER_X } from './sectionShell';

const STEPS = [
  {
    n: 1,
    title: '填寫資料',
    body: '留下學生與家長聯絡方式，報告會顯示孩子姓名，方便您留存與後續諮詢。',
    icon: ClipboardPenLine,
  },
  {
    n: 2,
    title: '線上作答',
    body: '依序完成 15 題，可上一題／下一題調整，全部想好再送出即可。',
    icon: FileCheck2,
  },
  {
    n: 3,
    title: '查看報告',
    body: '立即取得總分、等級、五大能力雷達圖，以及弱點說明與方向參考。',
    icon: LineChart,
  },
] as const;

export default function StepsSection() {
  return (
    <section className="border-y border-slate-200/80 bg-white py-14 sm:py-20 lg:py-24" aria-labelledby="steps-title">
      <div className={`mx-auto max-w-7xl ${LANDING_GUTTER_X}`}>
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="steps-title"
            className="font-['Noto_Serif_TC','Noto_Serif',serif] text-[1.375rem] font-bold leading-snug tracking-tight text-slate-900 sm:text-3xl"
          >
            三步驟完成檢測
          </h2>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">全程在線上完成，無需下載 App。</p>
        </div>

        <div className="mt-10 grid gap-5 md:mt-12 md:grid-cols-3 md:gap-8">
          {STEPS.map((step) => (
            <article
              key={step.n}
              className="group relative flex flex-col rounded-2xl border border-slate-200/90 bg-slate-50/40 p-5 shadow-sm transition duration-200 hover:border-sky-200 hover:bg-white hover:shadow-md sm:p-8"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-600 text-lg font-bold text-white shadow-md shadow-sky-600/25">
                  {step.n}
                </span>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm ring-1 ring-slate-200/80 transition group-hover:bg-sky-50">
                  <step.icon className="h-5 w-5" aria-hidden />
                </div>
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">{step.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600 sm:text-base">{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
