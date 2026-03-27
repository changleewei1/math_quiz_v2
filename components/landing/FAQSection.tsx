import { LANDING_GUTTER_X } from './sectionShell';

const FAQ_ITEMS = [
  {
    q: '這份檢測適合誰？',
    a: '主要適合即將升國一、希望提前了解數學銜接狀況的小六學生與家長。若孩子正考慮暑假先修或補強，這份檢測能幫您更快聚焦方向。',
  },
  {
    q: '大約需要多久時間？',
    a: '多數學生約 12～18 分鐘可完成 20 題檢測；可依自己的節奏作答，並可返回修改尚未送出的題目。',
  },
  {
    q: '做完後會得到什麼？',
    a: '完成後會立即取得個人化分析報告，包含總分與整體等級、五大能力雷達圖、弱點說明、學習順序建議，以及課程方向參考，方便家庭討論後續規劃。',
  },
  {
    q: '這份分析和一般練習題有什麼不同？',
    a: '練習題多半著重在「這題會不會寫」；此檢測則依五大能力向度彙整表現，讓您看見結構性的強弱分布，而不是單題對錯的片段資訊。',
  },
  {
    q: '一定要報名課程嗎？',
    a: '不需要。檢測與報告旨在協助您看懂孩子的學習樣貌；是否進一步諮詢課程，完全由家長自行決定，沒有強制推銷流程。',
  },
] as const;

export default function FAQSection() {
  return (
    <section className="border-t border-slate-200/80 bg-[#f8fafc] py-14 sm:py-20 lg:py-24" aria-labelledby="faq-title">
      <div className={`mx-auto max-w-7xl ${LANDING_GUTTER_X}`}>
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="faq-title"
            className="font-['Noto_Serif_TC','Noto_Serif',serif] text-[1.375rem] font-bold leading-snug tracking-tight text-slate-900 sm:text-3xl"
          >
            常見問題
          </h2>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">在開始前，先為您整理家長最常問的重點。</p>
        </div>

        <dl className="mx-auto mt-10 max-w-3xl space-y-4 sm:mt-12">
          {FAQ_ITEMS.map((item) => (
            <div
              key={item.q}
              className="rounded-2xl border border-slate-200/90 bg-white px-5 py-5 shadow-sm sm:px-6 sm:py-6"
            >
              <dt className="text-base font-bold text-slate-900">{item.q}</dt>
              <dd className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
