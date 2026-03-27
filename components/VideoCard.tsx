'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Play } from 'lucide-react';
import { getYoutubeThumbnail } from '@/lib/youtube';

export interface VideoCardProps {
  videoId: string;
  title: string;
  description?: string;
  /** 後端或 API 提供的縮圖 URL；若空則用 youtube_url 推導 */
  thumbnail_url?: string | null;
  /** 完整 YouTube 連結；未傳時預設為 watch?v=videoId */
  youtube_url?: string | null;
  reason?: string;
}

export default function VideoCard({
  videoId,
  title,
  description,
  thumbnail_url,
  youtube_url,
  reason,
}: VideoCardProps) {
  const [imgError, setImgError] = useState(false);

  const watchUrl = useMemo(
    () => (youtube_url?.trim() ? youtube_url.trim() : `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`),
    [youtube_url, videoId]
  );

  const thumbSrc = useMemo(() => {
    const fromApi = thumbnail_url?.trim();
    if (fromApi) return fromApi;
    return getYoutubeThumbnail(watchUrl);
  }, [thumbnail_url, watchUrl]);

  const href = watchUrl.startsWith('http') ? watchUrl : `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;

  const showImage = Boolean(thumbSrc) && !imgError;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:shadow-md">
      <Link href={href} target="_blank" rel="noreferrer" className="block">
        <div className="relative aspect-video w-full overflow-hidden bg-slate-200">
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbSrc}
              alt=""
              className="h-full w-full object-cover transition duration-300 ease-out group-hover:scale-[1.05]"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-200">
              <Play className="h-14 w-14 text-slate-500 opacity-80" strokeWidth={1.25} aria-hidden />
            </div>
          )}

          {showImage ? (
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25 transition duration-300 ease-out group-hover:bg-black/35"
              aria-hidden
            >
              <Play
                className="h-12 w-12 text-white opacity-90 drop-shadow-md transition duration-300 ease-out group-hover:scale-110 group-hover:opacity-100"
                strokeWidth={2}
              />
            </div>
          ) : null}
        </div>

        <div className="space-y-2 p-4">
          <h4 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900">{title}</h4>
          {reason ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">{reason}</p>
          ) : null}
          {description ? (
            <p className="line-clamp-2 text-xs leading-relaxed text-slate-600">{description}</p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
