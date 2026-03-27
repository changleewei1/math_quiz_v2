'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Dimension } from '@/lib/questions';
import VideoCard from '@/components/VideoCard';

export interface WeaknessForVideo {
  concept_tag: string;
  dimension: Dimension;
  mistake_type: string;
  count: number;
}

type ApiResult = {
  ok: true;
  results: Array<{
    video: {
      videoId: string;
      title: string;
      description: string;
      thumbnail: string | null;
    };
    reason: string;
    score: number;
  }>;
};

type ApiError = { ok: false; error: string };

async function fetchRecommendations(weakness: Omit<WeaknessForVideo, 'count'>, limit = 5) {
  const res = await fetch('/api/youtube/search', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ weakness, limit }),
  });
  const json = (await res.json()) as ApiResult | ApiError;
  if (!json.ok) throw new Error(json.error);
  return json.results;
}

export default function VideoSection({ weaknesses }: { weaknesses: WeaknessForVideo[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<
    Array<{
      weakness: WeaknessForVideo;
      videos: Awaited<ReturnType<typeof fetchRecommendations>>;
    }>
  >([]);

  const topWeaknesses = useMemo(() => weaknesses.slice(0, 6), [weaknesses]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (topWeaknesses.length === 0) return;
      setLoading(true);
      setError(null);
      try {
        const rows = await Promise.all(
          topWeaknesses.map(async (w) => ({
            weakness: w,
            videos: await fetchRecommendations(
              { concept_tag: w.concept_tag, dimension: w.dimension, mistake_type: w.mistake_type },
              5
            ),
          }))
        );
        if (!cancelled) setData(rows);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [topWeaknesses]);

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="font-['Noto_Serif_TC','Noto_Serif',serif] text-xl font-bold text-slate-900">推薦影片（AI 選擇）</h2>
      <p className="mt-2 text-sm text-slate-600">
        系統會依「概念標籤 → 向度 → 字幕/標題關鍵字」排序，挑出最相關的 3–5 支影片，並給出推薦原因。
      </p>

      {loading ? <p className="mt-6 text-sm text-slate-600">載入推薦中…</p> : null}
      {error ? (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <p className="font-semibold">推薦載入失敗</p>
          <p className="mt-1">{error}</p>
          <p className="mt-2 text-xs text-rose-700">
            請確認已設定伺服器環境變數 `YOUTUBE_API_KEY` 與 `YOUTUBE_SOURCES`。
          </p>
        </div>
      ) : null}

      <div className="mt-8 space-y-10">
        {data.map(({ weakness, videos }) => (
          <div key={`${weakness.dimension}__${weakness.concept_tag}__${weakness.mistake_type}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-base font-bold text-slate-900">
                {weakness.concept_tag}
                <span className="ml-2 text-xs font-semibold text-slate-500">（{weakness.mistake_type}）</span>
              </h3>
              <span className="text-xs font-semibold text-slate-500">本次出現 {weakness.count} 次</span>
            </div>

            {videos.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">目前找不到足夠相關的影片（或字幕無法存取）。</p>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {videos.slice(0, 5).map((r) => (
                  <VideoCard
                    key={r.video.videoId}
                    videoId={r.video.videoId}
                    title={r.video.title}
                    description={r.video.description}
                    thumbnail_url={r.video.thumbnail}
                    youtube_url={`https://www.youtube.com/watch?v=${encodeURIComponent(r.video.videoId)}`}
                    reason={r.reason}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

