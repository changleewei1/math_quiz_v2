interface EnrollmentCTASectionProps {
  content: string;
}

export default function EnrollmentCTASection({ content }: EnrollmentCTASectionProps) {
  return (
    <section className="rounded-2xl bg-indigo-600 p-8 text-white shadow-lg">
      <h2 className="text-xl font-semibold">下一步建議</h2>
      <p className="mt-3 text-sm text-indigo-100 leading-relaxed">{content}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
        >
          預約試聽
        </button>
        <button
          type="button"
          className="rounded-lg border border-white/70 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          了解課程內容
        </button>
      </div>
    </section>
  );
}

