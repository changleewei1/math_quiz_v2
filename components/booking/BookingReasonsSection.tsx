import { Clock3, LineChart, Target } from 'lucide-react';

const ITEMS = [
  {
    icon: Clock3,
    title: '升國一前是最好補強的時間點',
    body: [
      '暑假的學習節奏相對可控，適合把「聽得懂、寫得出」的流程建立起來。',
      '同樣的缺口，若留到開學後，往往會變成每週追進度與段考壓力疊加。',
    ],
  },
  {
    icon: LineChart,
    title: '先確認程度，比開學後補救更省力',
    body: [
      '試聽重點在於對準起點：老師能依分析結果，協助判斷該從基礎、銜接或先修哪一層開始。',
      '先把路線圖講清楚，孩子與家長都較不容易焦慮。',
    ],
  },
  {
    icon: Target,
    title: '試聽能更精準知道孩子適合哪種進度',
    body: [
      '同分數的孩子，學習習慣與卡關點可能不同；現場觀察能補足紙本分析看不到的細節。',
      '您不需要先猜班型，讓老師依觀察給出具體建議即可。',
    ],
  },
] as const;

export default function BookingReasonsSection() {
  return (
    <section className="scroll-mt-8" aria-labelledby="booking-reasons-title">
      <h2 id="booking-reasons-title" className="text-lg font-bold text-slate-900 sm:text-xl">
        為什麼現在安排試聽？
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        處理「再等等」的拖延：把決定從「要不要補習」轉成「先了解孩子適合什麼」。
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-3">
        {ITEMS.map((item) => (
          <li
            key={item.title}
            className="flex flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-100/80"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <item.icon className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="mt-4 text-sm font-bold text-slate-900">{item.title}</h3>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
              {item.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
