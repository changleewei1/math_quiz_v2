import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { BRAND_LOGO_SRC } from './constants';
import { LANDING_GUTTER_X } from './sectionShell';

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 pt-[max(0.5rem,env(safe-area-inset-top))] shadow-sm backdrop-blur-md">
      <div className={`mx-auto flex max-w-7xl items-center justify-between gap-2 py-3 sm:gap-4 sm:py-4 ${LANDING_GUTTER_X}`}>
        <Link
          href="/landing"
          className="group flex min-w-0 flex-1 items-center gap-3 sm:gap-4 md:gap-4"
        >
          <Image
            src={BRAND_LOGO_SRC}
            alt="名貫補習班"
            width={80}
            height={80}
            className="h-14 w-14 shrink-0 rounded-full object-contain ring-2 ring-slate-200/90 transition duration-200 group-hover:ring-slate-300 sm:h-16 sm:w-16 md:h-[4.5rem] md:w-[4.5rem]"
            priority
            sizes="(max-width: 640px) 56px, (max-width: 768px) 64px, 72px"
          />
          <div className="min-w-0 leading-tight">
            <span className="block text-xl font-bold tracking-tight text-slate-900 sm:text-2xl md:text-[1.65rem] md:leading-snug">
              名貫補習班
            </span>
            <span className="mt-0.5 block text-[11px] font-medium leading-snug text-slate-500 sm:text-xs sm:text-sm">
              升國一數學｜線上弱點檢測
            </span>
          </div>
        </Link>
        <Link
          href="/register"
          className="mvp-cta inline-flex h-12 min-h-[48px] shrink-0 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-bold sm:h-auto sm:min-h-[48px] sm:px-6 sm:text-base"
        >
          <span className="hidden min-[360px]:inline">開始檢測</span>
          <span className="min-[360px]:hidden">檢測</span>
          <ArrowRight className="h-4 w-4 shrink-0 sm:h-[1.125rem] sm:w-[1.125rem]" aria-hidden />
        </Link>
      </div>
    </header>
  );
}
