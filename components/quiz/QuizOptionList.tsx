interface QuizOptionListProps {
  options: string[];
  selected: string | undefined;
  onSelect: (option: string) => void;
}

export default function QuizOptionList({ options, selected, onSelect }: QuizOptionListProps) {
  return (
    <ul className="mt-5 space-y-2.5" role="listbox" aria-label="選項">
      {options.map((option) => {
        const isOn = selected === option;
        return (
          <li key={option}>
            <button
              type="button"
              role="option"
              aria-selected={isOn}
              onClick={() => onSelect(option)}
              className={`touch-manipulation flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3.5 text-left text-sm leading-relaxed transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 sm:text-[0.9375rem] ${
                isOn
                  ? 'border-sky-500 bg-sky-50/90 text-slate-900 shadow-sm ring-1 ring-sky-200/60'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50/80'
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  isOn ? 'border-sky-600 bg-sky-600' : 'border-slate-300 bg-white'
                }`}
                aria-hidden
              >
                {isOn ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
              </span>
              <span className="flex-1">{option}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
