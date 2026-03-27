import type { Video } from '@/types/quiz';
import { DIMENSION_META_MAP } from '@/lib/constants/dimensions';

interface RecommendedVideosCardProps {
  videos: Video[];
}

export default function RecommendedVideosCard({ videos }: RecommendedVideosCardProps) {
  if (videos.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">推薦影片</h2>
      <p className="mt-1 text-sm text-slate-500">
        針對弱點向度安排短影片補強，快速建立觀念。
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {videos.map((video) => (
          <div key={video.id} className="rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500">
              {DIMENSION_META_MAP[video.dimension].label}
            </p>
            <h3 className="mt-2 text-base font-semibold text-slate-900">{video.title}</h3>
            {video.youtube_url ? (
              <a
                href={video.youtube_url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
              >
                觀看影片
              </a>
            ) : (
              <button
                type="button"
                className="mt-4 inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
              >
                觀看影片
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

