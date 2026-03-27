import QuizOptionList from '@/components/quiz/QuizOptionList';
import type { QuizQuestion } from '@/lib/quiz/types';

interface QuizCardProps {
  question: QuizQuestion;
  selectedAnswer?: string;
  onSelect: (answer: string) => void;
}

export default function QuizCard({ question, selectedAnswer, onSelect }: QuizCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">{question.prompt}</h2>
        {question.image_url ? (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <img src={question.image_url} alt="題目圖示" className="h-auto w-full" />
          </div>
        ) : null}
        <QuizOptionList options={question.choices} selected={selectedAnswer} onSelect={onSelect} />
      </div>
    </div>
  );
}


