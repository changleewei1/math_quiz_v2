import { CheckCircle2, ClipboardList, Timer } from 'lucide-react';

const ITEMS = [
  {
    icon: Timer,
    title: '檢測時間約 10 分鐘',
    body: '20 題結構化試題，可依節奏作答，亦可返回調整尚未送出的答案。',
  },
  {
    icon: CheckCircle2,
    title: '完成後立即看結果',
    body: '送出後即產出個人化報告，無需等待人工處理。',
  },
  {
    icon: ClipboardList,
    title: '報告含弱點與建議方向',
    body: '雷達圖、向度說明、學習順序與課程參考，方便家庭討論後續規劃。',
  },
] as const;

export default function TrustInfoCard() {
  return (
    <aside className="rounded-2xl border border-sky-100 bg-gradient-to-b from-sky-50/80 to-white p-6 shadow-sm ring-1 ring-sky-100/60 sm:p-7">
      <p className="text-xs font-bold uppercase tracking-wider text-sky-800">安心說明</p>
      <h2 className="mt-2 text-lg font-bold text-slate-900">開始前，您需要知道的三件事</h2>
      <ul className="mt-6 space-y-5">
        {ITEMS.map((item) => (
          <li key={item.title} className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm ring-1 ring-slate-200/80">
              <item.icon className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
