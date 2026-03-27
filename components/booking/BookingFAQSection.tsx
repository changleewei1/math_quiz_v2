'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQ_ITEMS = [
  {
    q: '預約試聽後一定要報名嗎？',
    a: '不需要。試聽的目的在於了解孩子是否適合班級節奏與教學方式，您可在取得建議後再決定，不會強迫當場報名。',
  },
  {
    q: '試聽會依孩子程度安排嗎？',
    a: '會。老師會參考您提供的檢測摘要與現場觀察，調整試聽內容的難度與講解方式，讓孩子聽得懂、願意參與。',
  },
  {
    q: '如果孩子基礎比較弱，也適合先來試聽嗎？',
    a: '往往更適合。基礎較弱時，越早確認「從哪裡開始補」越省力；試聽能幫助老師把起點降到孩子跟得上的範圍，避免一開始就過度挫折。',
  },
  {
    q: '試聽後會提供建議嗎？',
    a: '會。試聽結束後，老師會說明觀察到的學習習慣與落差，並提供可執行的補強或銜接建議；是否後續排課完全尊重您的決定。',
  },
] as const;

export default function BookingFAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section aria-labelledby="booking-faq-title">
      <h2 id="booking-faq-title" className="text-lg font-bold text-slate-900 sm:text-xl">
        家長常見問題
      </h2>
      <p className="mt-2 text-sm text-slate-600">處理最後一點猶豫，我們把界線說清楚。</p>
      <div className="mt-6 space-y-2">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={item.q}
              className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left text-sm font-bold text-slate-900 transition hover:bg-slate-50"
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  aria-hidden
                />
              </button>
              {isOpen ? (
                <div className="border-t border-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-600">
                  {item.a}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
