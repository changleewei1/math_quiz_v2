export default function DateRangeFilter() {
  return (
    <form className="flex flex-wrap gap-3">
      <input
        type="date"
        name="from"
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
      />
      <input
        type="date"
        name="to"
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
      >
        套用日期
      </button>
    </form>
  );
}


