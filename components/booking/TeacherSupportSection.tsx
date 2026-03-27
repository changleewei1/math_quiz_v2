import { ClipboardCheck, MessageCircle, Sparkles } from 'lucide-react';

const STEPS = [
  {
    n: '1',
    icon: ClipboardCheck,
    title: '依分析結果先看孩子目前落差',
    text: '老師會先對照您帶來的檢測摘要，快速鎖定需要留意的面向與可能卡關點，減少盲目練習。',
  },
  {
    n: '2',
    icon: MessageCircle,
    title: '試聽課中觀察解題方式與學習習慣',
    text: '包含讀題、列式、檢查與遇到困難時的反應；這些細節對國中長期表現往往很關鍵。',
  },
  {
    n: '3',
    icon: Sparkles,
    title: '試聽後提供適合的課程與補強建議',
    text: '會以「孩子跟得上的節奏」為優先，說明可執行的安排；您再決定下一步，沒有壓力。',
  },
] as const;

export default function TeacherSupportSection() {
  return (
    <section className="rounded-2xl border border-emerald-100 bg-emerald-50/35 px-5 py-8 sm:px-8" aria-labelledby="teacher-support-title">
      <h2 id="teacher-support-title" className="text-lg font-bold text-emerald-950 sm:text-xl">
        老師會怎麼協助您？
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-emerald-900/90">
        預約試聽的目的，是讓專業老師用具體觀察補足分析報告；過程中<strong className="font-semibold text-emerald-950">不會強迫推銷</strong>
        ，而是以孩子的實際狀況為中心，給出可理解的下一步。
      </p>
      <ol className="mt-6 space-y-4">
        {STEPS.map((s) => (
          <li
            key={s.n}
            className="flex gap-4 rounded-xl border border-white/80 bg-white/70 p-4 shadow-sm"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
              {s.n}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <s.icon className="h-4 w-4 text-emerald-700" aria-hidden />
                <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
