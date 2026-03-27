interface QuizProgressHeaderProps {
  currentIndex: number;
  total: number;
  /**
   * 若提供（例如需全數作答才送出的測驗），顯示「尚有 X 題未作答」。
   * 未提供時改以題號推算「尚余 X 題」（本題之後尚未瀏覽的題數）。
   */
  unansweredCount?: number;
  className?: string;
}

export default function QuizProgressHeader({
  currentIndex,
  total,
  unansweredCount,
  className,
}: QuizProgressHeaderProps) {
  const n = currentIndex + 1;
  const afterThis = Math.max(0, total - n);
  const pct = total > 0 ? (n / total) * 100 : 0;

  const remainderLabel =
    unansweredCount !== undefined
      ? `尚有 ${unansweredCount} 題未作答`
      : `尚余 ${afterThis} 題（本題之後）`;

  return (
    <header className={`space-y-3 ${className ?? ''}`}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            第 {n} 題 / 共 {total} 題
            <span className="ml-2 font-normal text-slate-500">（{remainderLabel}）</span>
          </p>
          <p className="mt-1 text-xs leading-relaxed text-sky-800/90">
            完成後將立即產生個人化分析報告，協助您掌握孩子的弱點分布與補強方向。
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tabular-nums text-slate-600">
          {Math.round(pct)}% 完成
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-sky-600 transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
    </header>
  );
}
