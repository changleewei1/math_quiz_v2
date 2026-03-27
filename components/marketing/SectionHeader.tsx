interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

export default function SectionHeader({
  title,
  subtitle,
  align = 'center',
}: SectionHeaderProps) {
  const alignment = align === 'left' ? 'text-left items-start' : 'text-center items-center';

  return (
    <div className={`flex flex-col gap-3 ${alignment}`}>
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500">
        免費 AI 弱點分析
      </p>
      <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}


