import { LANDING_GUTTER_X } from './sectionShell';

function DemoRadarChart() {
  const cx = 140;
  const cy = 140;
  const maxR = 88;
  const anglesDeg = [-90, -18, 54, 126, 198];
  const values = [86, 74, 90, 68, 82];
  const labels = ['數感', '代數', '應用題', '幾何', '資料'];

  const toRad = (d: number) => (d * Math.PI) / 180;
  const point = (r: number, i: number) => {
    const a = toRad(anglesDeg[i]!);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  const gridRings = [0.25, 0.5, 0.75, 1].map((t) => ({
    t,
    pts: anglesDeg.map((_, i) => point(maxR * t, i)),
  }));

  const dataPoly = values
    .map((v, i) => {
      const p = point((maxR * v) / 100, i);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  const labelPts = anglesDeg.map((_, i) => point(maxR + 22, i));

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 p-4 shadow-inner sm:p-5">
      <p className="mb-3 text-center text-xs font-bold text-slate-700">五大能力雷達圖（示意）</p>
      <svg viewBox="0 0 280 280" className="mx-auto h-auto w-full max-w-[280px]" role="img" aria-label="五大能力雷達圖示意">
        {gridRings.map((ring) => (
          <polygon
            key={ring.t}
            points={ring.pts.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}
        {anglesDeg.map((_, i) => {
          const outer = point(maxR, i);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={outer.x}
              y2={outer.y}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          );
        })}
        <polygon points={dataPoly} fill="rgb(14 165 233 / 0.22)" stroke="rgb(2 132 199)" strokeWidth="2" />
        {labelPts.map((p, i) => (
          <text
            key={labels[i]}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#475569"
            style={{ fontSize: 11, fontWeight: 600 }}
          >
            {labels[i]}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default function ReportPreviewSection() {
  return (
    <section className="py-14 sm:py-20 lg:py-24" aria-labelledby="report-preview-title">
      <div className={`mx-auto max-w-7xl ${LANDING_GUTTER_X}`}>
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="report-preview-title"
            className="font-['Noto_Serif_TC','Noto_Serif',serif] text-[1.375rem] font-bold leading-snug tracking-tight text-slate-900 sm:text-3xl"
          >
            報告預覽
          </h2>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            檢測完成後，系統會產出一份結構化報告，讓您像在看專業學情分析一樣清楚。
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:mt-12 lg:grid-cols-2 lg:items-stretch lg:gap-14">
          {/* 左：產品展示卡組 */}
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-md sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">總分</p>
                <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900 sm:text-4xl">78</p>
                <p className="mt-1 text-xs text-slate-500">正確率換算，滿分 100</p>
                <span className="mt-3 inline-flex rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 ring-1 ring-emerald-100">
                  整體穩定
                </span>
              </div>
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-md sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">等級</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-2xl font-black text-white shadow-lg shadow-amber-500/30">
                    B
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-800">程度良好</p>
                    <p className="text-xs text-slate-500">A–D 分級，快速對照</p>
                  </div>
                </div>
              </div>
            </div>
            <DemoRadarChart />
            <p className="text-center text-[11px] text-slate-400">※ 圖表與分數為示意，實際以孩子作答為準</p>
          </div>

          {/* 右：說明 */}
          <div className="flex flex-col justify-center rounded-2xl border border-slate-200/90 bg-white p-5 shadow-md sm:p-8 lg:p-10">
            <h3 className="text-lg font-bold text-slate-900 sm:text-xl">報告裡，您會清楚看到</h3>
            <ul className="mt-6 space-y-4 text-base leading-relaxed text-slate-600">
              <li className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky-500" aria-hidden />
                <span>
                  <strong className="font-semibold text-slate-800">總分與等級</strong>
                  ，先掌握整體程度，再決定要不要加強先修。
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky-500" aria-hidden />
                <span>
                  <strong className="font-semibold text-slate-800">五大能力雷達圖</strong>
                  ，看出孩子在數感、代數、應用題、幾何、資料判讀的相對強弱。
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky-500" aria-hidden />
                <span>
                  <strong className="font-semibold text-slate-800">弱點說明與建議</strong>
                  ，用白話整理「可以從哪裡開始補」，降低家長焦慮。
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky-500" aria-hidden />
                <span>
                  <strong className="font-semibold text-slate-800">課程方向參考</strong>
                  ，方便您與孩子討論後續學習規劃（實際排課仍以校方／補習現場為準）。
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
