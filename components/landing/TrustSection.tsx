import { BookOpen, Clock3, TrendingUp } from 'lucide-react';
import { LANDING_GUTTER_X } from './sectionShell';

export default function TrustSection() {
  return (
    <section className="border-y border-slate-200/80 bg-white py-14 sm:py-20 lg:py-24" aria-labelledby="trust-why-title">
      <div className={`mx-auto max-w-7xl ${LANDING_GUTTER_X}`}>
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="trust-why-title"
            className="font-['Noto_Serif_TC','Noto_Serif',serif] text-[1.375rem] font-bold leading-snug tracking-tight text-slate-900 sm:text-3xl lg:text-[1.875rem]"
          >
            為什麼升國一前要先做數學弱點分析？
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            國中數學節奏明顯變快，單元之間的連結也更緊密。若小學階段留下的缺口沒有被看見，開學後往往一次面對多個新觀念，孩子容易覺得「突然變難」。
          </p>
        </div>

        <ul className="mx-auto mt-10 grid max-w-5xl gap-5 sm:mt-12 sm:grid-cols-3 sm:gap-8">
          <li className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-6 shadow-sm sm:p-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
              <Clock3 className="h-6 w-6" aria-hidden />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">國中節奏更快</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              課堂進度壓縮、考題綜合度提高；基礎若仍搖晃，段考前容易陷入「補東補西」的惡性循環。
            </p>
          </li>
          <li className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-6 shadow-sm sm:p-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <TrendingUp className="h-6 w-6" aria-hidden />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">基礎不穩，開學更吃力</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              許多「國一突然下滑」並非孩子變笨，而是弱點被進度掩蓋；提前盤點，才有時間用對方法補。
            </p>
          </li>
          <li className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-6 shadow-sm sm:p-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <BookOpen className="h-6 w-6" aria-hidden />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">暑假是黃金窗口</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              提前找出弱點、排定先修與補強順序，開學較能跟上節奏，學習自信也較容易維持。
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
}
