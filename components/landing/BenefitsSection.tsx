import { GraduationCap, ShieldCheck, Target } from 'lucide-react';
import { LANDING_GUTTER_X } from './sectionShell';

export default function BenefitsSection() {
  return (
    <section className="py-14 sm:py-20 lg:py-24" aria-labelledby="benefits-title">
      <div className={`mx-auto max-w-7xl ${LANDING_GUTTER_X}`}>
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="benefits-title"
            className="font-['Noto_Serif_TC','Noto_Serif',serif] text-[1.375rem] font-bold leading-snug tracking-tight text-slate-900 sm:text-3xl lg:text-[1.875rem]"
          >
            為什麼值得先做一次檢測？
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            國一數學步調快、觀念環環相扣。先釐清弱點，補習與自學都能對症下藥，少做無效練習。
          </p>
        </div>

        <ul className="mx-auto mt-10 grid max-w-5xl gap-5 sm:mt-12 sm:grid-cols-3 sm:gap-8">
          <li className="flex flex-col items-start rounded-2xl border border-slate-200/90 bg-white p-6 text-left shadow-sm sm:items-center sm:p-7 sm:text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
              <Target className="h-6 w-6" aria-hidden />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">對準缺口</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">知道「哪一類題」卡關，比一直寫考卷更有效率。</p>
          </li>
          <li className="flex flex-col items-start rounded-2xl border border-slate-200/90 bg-white p-6 text-left shadow-sm sm:items-center sm:p-7 sm:text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-6 w-6" aria-hidden />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">安心銜接</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">升國一前先補基礎，開學較不容易因進度壓力而挫折。</p>
          </li>
          <li className="flex flex-col items-start rounded-2xl border border-slate-200/90 bg-white p-6 text-left shadow-sm sm:items-center sm:p-7 sm:text-center sm:col-span-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <GraduationCap className="h-6 w-6" aria-hidden />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">家長看得懂</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">報告用圖表與白話說明，不用數學專業也能陪著孩子規劃。</p>
          </li>
        </ul>
      </div>
    </section>
  );
}
