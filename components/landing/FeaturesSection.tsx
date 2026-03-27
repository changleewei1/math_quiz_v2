import { BarChart3, BookOpenCheck, Sparkles } from 'lucide-react';
import { LANDING_GUTTER_X } from './sectionShell';

const FEATURES = [
  {
    icon: BarChart3,
    title: '找出真正需要補強的數學基礎',
    lines: [
      '依五大能力向度拆解表現，避免只看總分而忽略結構性缺口。',
      '弱點與尚可加強項目一目了然，讓補習與自學都能對症下藥。',
    ],
  },
  {
    icon: Sparkles,
    title: '用清楚報告看懂孩子目前程度',
    lines: [
      '雷達圖搭配白話說明，家長不必具備數學背景也能參與討論。',
      '同時提供學習順序與日常陪讀方向，減少盲目刷題。',
    ],
  },
  {
    icon: BookOpenCheck,
    title: '提前銜接國一課程，降低開學落差',
    lines: [
      '在升國一前的黃金期先穩住關鍵觀念與解題節奏。',
      '開學後較能跟上課堂步調，減少因落差擴大而產生的挫折感。',
    ],
  },
] as const;

export default function FeaturesSection() {
  return (
    <section className="border-t border-slate-200/80 bg-[#f8fafc] py-14 sm:py-20 lg:py-24" aria-labelledby="features-title">
      <div className={`mx-auto max-w-7xl ${LANDING_GUTTER_X}`}>
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="features-title"
            className="font-['Noto_Serif_TC','Noto_Serif',serif] text-[1.375rem] font-bold leading-snug tracking-tight text-slate-900 sm:text-3xl"
          >
            三大價值：把力氣花在升國一真正的刀口上
          </h2>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            這不只是線上測驗，而是一份能帶回家討論的學習地圖——專業、清楚，而且不硬銷。
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:mt-12 md:grid-cols-3 md:gap-8">
          {FEATURES.map((f) => (
            <article
              key={f.title}
              className="flex flex-col rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition duration-200 hover:shadow-md sm:p-8"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-md shadow-sky-500/25">
                <f.icon className="h-7 w-7" aria-hidden />
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-900">{f.title}</h3>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                {f.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
