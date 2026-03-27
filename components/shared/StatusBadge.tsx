import type { DimensionStatus } from '@/types/quiz';

const statusMap: Record<DimensionStatus, { label: string; style: string }> = {
  weak: { label: '需加強', style: 'bg-rose-100 text-rose-700' },
  watch: { label: '尚可加強', style: 'bg-amber-100 text-amber-700' },
  strong: { label: '表現穩定', style: 'bg-emerald-100 text-emerald-700' },
};

export default function StatusBadge({ status }: { status: DimensionStatus }) {
  const { label, style } = statusMap[status];
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${style}`}>
      {label}
    </span>
  );
}


