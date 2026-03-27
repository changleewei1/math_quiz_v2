interface MvpQuizNavigationBarProps {
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export default function MvpQuizNavigationBar({
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  onSubmit,
  isSubmitting = false,
}: MvpQuizNavigationBarProps) {
  return (
    <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={!canGoPrev}
          className="min-h-[44px] rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
        >
          上一題
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className="min-h-[44px] rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
        >
          下一題
        </button>
      </div>
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="min-h-[48px] w-full rounded-xl bg-sky-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-sky-600/25 transition hover:bg-sky-700 disabled:opacity-60 sm:ml-auto sm:w-auto sm:min-w-[220px]"
      >
        {isSubmitting ? '送出中…' : '完成檢測，查看分析報告'}
      </button>
    </div>
  );
}
