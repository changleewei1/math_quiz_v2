const metrics = [
  { label: '整體程度', value: 'B' },
  { label: '數感', value: '78%' },
  { label: '代數', value: '52%' },
  { label: '幾何', value: '81%' },
  { label: '建議課程', value: '先修基礎班' },
];

export default function MetricPreviewCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
            報告預覽
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">
            AI 弱點分析結果摘要
          </h3>
        </div>
        <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
          範例
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex items-center justify-between text-sm">
            <span className="text-slate-600">{metric.label}</span>
            <span className="font-semibold text-slate-900">{metric.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
        依作答狀況產出個人化分析、補強方向與課程建議。
      </div>
    </div>
  );
}


