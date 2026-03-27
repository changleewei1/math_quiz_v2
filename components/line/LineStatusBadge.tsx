export default function LineStatusBadge({
  status,
}: {
  status: 'sent' | 'failed' | 'skipped' | 'pending';
}) {
  const color = {
    sent: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-rose-100 text-rose-700',
    skipped: 'bg-amber-100 text-amber-700',
    pending: 'bg-slate-100 text-slate-600',
  }[status];

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${color}`}>
      {status === 'sent' && '已送出'}
      {status === 'failed' && '失敗'}
      {status === 'skipped' && '已跳過'}
      {status === 'pending' && '待處理'}
    </span>
  );
}


