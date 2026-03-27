import { ClipboardPenLine, FileCheck2, LineChart, School } from 'lucide-react';
import { LANDING_GUTTER_X } from './sectionShell';

const STEPS = [
  {
    n: 1,
    title: '填寫基本資料',
    body: '留下學生與家長聯絡方式，方便報告顯示姓名並供您留存；資料僅用於產出分析與課程建議參考。',
    icon: ClipboardPenLine,
  },
  {
    n: 2,
    title: '完成數學能力檢測',
    body: '依序完成 20 題結構化試題，可來回檢視題目；請依孩子目前理解作答，不需追求滿分。',
    icon: FileCheck2,
  },
  {
    n: 3,
    title: '立即取得弱點分析報告',
    body: '系統依五大向度彙整分數與雷達圖，並以白話說明優先補強方向，家長也能快速理解。',
    icon: LineChart,
  },
  {
    n: 4,
    title: '依結果安排先修與補強方向',
    body: '參考報告中的學習順序與課程方向，與孩子討論暑假規劃；實際排課仍以您與教學單位現場諮詢為準。',
    icon: School,
  },
] as const;

export default function ProcessSection() {
  return (
    <section className="border-y border-slate-200/80 bg-white py-14 sm:py-20 lg:py-24" aria-labelledby="process-title">
      <div className={`mx-auto max-w-7xl ${LANDING_GUTTER_X}`}>
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="process-title"
            className="font-['Noto_Serif_TC','Noto_Serif',serif] text-[1.375rem] font-bold leading-snug tracking-tight text-slate-900 sm:text-3xl"
          >
            四步驟完成檢測與解讀
          </h2>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">全程線上完成，無需下載 App，約一節課內可跑完流程。</p>
        </div>

        <div className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {STEPS.map((step) => (
            <article
              key={step.n}
              className="group relative flex flex-col rounded-2xl border border-slate-200/90 bg-slate-50/40 p-5 shadow-sm transition duration-200 hover:border-sky-200 hover:bg-white hover:shadow-md sm:p-7"
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
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem]">{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
