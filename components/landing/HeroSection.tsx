import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, BarChart3, CheckCircle2, ClipboardList, Timer } from 'lucide-react';
import { LANDING_GUTTER_X } from './sectionShell';

export default function HeroSection() {
  return (
    <section className="border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50/80 to-[#f1f5f9] pb-14 pt-10 sm:pb-20 sm:pt-16 lg:pb-24 lg:pt-20">
      <div className={`mx-auto max-w-7xl ${LANDING_GUTTER_X}`}>
        <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 xl:gap-20">
          {/* 左：主訴求 */}
          <div className="landing-fade-in order-1">
            <p className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-sky-200/80 bg-sky-50/90 px-3 py-2 text-left text-xs font-semibold leading-snug text-sky-800 shadow-sm sm:px-3.5 sm:text-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              小六升國一適用 · 個人化分析 · 家長秒懂報告
            </p>

            <h1 className="mt-5 font-['Noto_Serif_TC','Noto_Serif',serif] text-[clamp(1.5rem,5vw+0.65rem,2.75rem)] font-bold leading-[1.22] tracking-tight text-slate-900 sm:mt-6 sm:leading-[1.2] md:text-5xl lg:text-[2.75rem] lg:leading-[1.15]">
              10 分鐘找出孩子升國一前
              <br className="hidden sm:block" />
              最需要補強的數學弱點
            </h1>

            <p className="mt-4 max-w-xl text-base leading-[1.65] text-slate-600 sm:mt-5 sm:text-lg sm:leading-relaxed">
              銜接國一前，先用結構化檢測盤點<strong className="font-semibold text-slate-800">五大數學能力</strong>
              。系統依作答產出個人化分析與白話建議，讓您不必猜「到底哪裡卡」，就能與孩子討論暑假先修與補強優先順序。
            </p>

            <div className="mt-5 grid grid-cols-1 gap-2 sm:mt-6 sm:flex sm:flex-wrap sm:gap-3">
              <TrustPill icon={<Timer className="h-4 w-4 sm:h-3.5 sm:w-3.5" />} text="約 10–15 分鐘" />
              <TrustPill icon={<ClipboardList className="h-4 w-4 sm:h-3.5 sm:w-3.5" />} text="20 題結構化檢測" />
              <TrustPill icon={<CheckCircle2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />} text="完成即看報告" />
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href="/register"
                className="mvp-cta inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-bold sm:w-auto sm:min-w-[220px] sm:px-8"
              >
                立即開始檢測
                <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
              </Link>
              <p className="text-center text-sm leading-snug text-slate-500 sm:text-left">
                免費檢測，完成後立即查看結果
              </p>
            </div>

            <p className="mt-4 text-sm font-medium leading-snug text-slate-500">
              流程：填寫基本資料 → 作答 → 立即取得分析
            </p>

            {/* Trust row */}
            <div className="mt-8 flex flex-col gap-2 border-t border-slate-200/90 pt-6 text-sm text-slate-600 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2 sm:pt-8">
              <span className="font-semibold text-slate-800">免費</span>
              <span className="hidden h-4 w-px bg-slate-300 sm:block" aria-hidden />
              <span className="font-semibold text-slate-800">線上完成</span>
              <span className="hidden h-4 w-px bg-slate-300 sm:block" aria-hidden />
              <span className="font-semibold text-slate-800">立即看報告</span>
            </div>
          </div>

          {/* 右：首屏預覽卡 */}
          <div className="landing-fade-in landing-delay-1 order-2 opacity-0">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-sky-100/60 via-white to-amber-50/40 blur-2xl sm:-inset-4" aria-hidden />
              <div className="relative rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-8">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-sky-700">報告預覽</p>
                    <p className="mt-1 text-sm text-slate-600">完成檢測後，您會看到</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                    <BarChart3 className="h-6 w-6" aria-hidden />
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
                    <p className="text-xs font-medium text-slate-500">整體程度</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-2xl font-bold text-amber-800">
                        B
                      </span>
                      <span className="text-xs leading-snug text-slate-500">A–D 分級</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm sm:col-span-1">
                    <p className="text-xs font-medium text-slate-500">向度概覽（示意）</p>
                    <ul className="mt-2 space-y-1.5 text-xs font-semibold tabular-nums text-slate-800">
                      <li className="flex justify-between">
                        <span className="font-medium text-slate-600">數感</span>
                        <span>78%</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="font-medium text-slate-600">代數</span>
                        <span>52%</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="font-medium text-slate-600">幾何</span>
                        <span>81%</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl border border-dashed border-sky-200/80 bg-sky-50/40 px-4 py-3">
                  <p className="text-xs font-semibold text-sky-900">建議方向（示意）</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    先修基礎班：優先穩定代數與題意轉換，並銜接國一運算節奏。
                  </p>
                </div>
                <div className="mt-3 rounded-xl border border-slate-100 bg-white/80 px-3 py-2">
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    實際報告另含應用題、資料判讀向度與雷達圖，依孩子作答個人化產出。
                  </p>
                </div>
                <p className="mt-4 text-center text-[11px] text-slate-400">※ 示意畫面，實際分數依孩子作答而定</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustPill({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <span className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm sm:w-auto sm:justify-start sm:py-1.5 sm:text-sm">
      <span className="text-sky-600">{icon}</span>
      {text}
    </span>
  );
}
