import type { ReactNode } from 'react';

interface FilterBarProps {
  title?: string;
  children: ReactNode;
}

export default function FilterBar({ title, children }: FilterBarProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {title ? <p className="text-sm font-semibold text-slate-700">{title}</p> : null}
      <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:flex-wrap">
        {children}
      </div>
    </div>
  );
}


