import type { OverallLevel } from '@/types/quiz';

const levelStyles: Record<OverallLevel, string> = {
  A: 'bg-emerald-100 text-emerald-700',
  B: 'bg-indigo-100 text-indigo-700',
  C: 'bg-amber-100 text-amber-700',
  D: 'bg-rose-100 text-rose-700',
};

export default function ScoreBadge({ level }: { level: OverallLevel }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${levelStyles[level]}`}>
      整體程度 {level}
    </span>
  );
}


