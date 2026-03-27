interface EmptyStateCardProps {
  message: string;
}

export default function EmptyStateCard({ message }: EmptyStateCardProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}


