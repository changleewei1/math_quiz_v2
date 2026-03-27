import RadarChart from '@/components/RadarChart';

interface RadarDatum {
  subject: string;
  value: number;
}

interface RadarChartCardProps {
  data: RadarDatum[];
  stableNote: string;
  priorityNote: string;
}

export default function RadarChartCard({ data, stableNote, priorityNote }: RadarChartCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="font-['Noto_Serif_TC','Noto_Serif',serif] text-xl font-bold text-slate-900">五大能力雷達圖</h2>
      <p className="mt-2 text-sm text-slate-600">一眼比較各向度的相對表現，搭配右側說明掌握優先補強順序。</p>
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:items-start">
        <div className="rounded-xl border border-slate-100 bg-slate-50/30 p-2">
          <RadarChart data={data} />
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
            <p className="text-xs font-bold text-emerald-900">相對穩定的面向</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{stableNote}</p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
            <p className="text-xs font-bold text-amber-900">建議優先關注</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{priorityNote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
