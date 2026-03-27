import { CheckCircle2 } from 'lucide-react';

const items = [
  '10 分鐘完成診斷',
  'AI 弱點分析報告',
  '免費提供課程建議',
];

export default function InfoBadgeRow() {
  return (
    <div className="flex flex-wrap gap-3 text-sm text-slate-600">
      {items.map((item) => (
        <div
          key={item}
          className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 shadow-sm"
        >
          <CheckCircle2 className="h-4 w-4 text-indigo-500" />
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}


