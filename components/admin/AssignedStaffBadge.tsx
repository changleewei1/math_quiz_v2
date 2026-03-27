export default function AssignedStaffBadge({ name }: { name?: string | null }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
      {name || '未指派'}
    </span>
  );
}


