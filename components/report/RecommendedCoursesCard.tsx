import type { Course } from '@/types/quiz';

interface RecommendedCoursesCardProps {
  courses: Course[];
}

export default function RecommendedCoursesCard({ courses }: RecommendedCoursesCardProps) {
  if (courses.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">推薦課程</h2>
      <p className="mt-1 text-sm text-slate-500">
        依孩子的弱點向度提供最適合的先修與補強課程。
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {courses.map((course) => (
          <div key={course.id} className="rounded-xl border border-slate-200 p-5">
            <h3 className="text-base font-semibold text-slate-900">{course.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{course.description}</p>
            {course.cta_link ? (
              <a
                href={course.cta_link}
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                了解課程
              </a>
            ) : (
              <button
                type="button"
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                了解課程
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

