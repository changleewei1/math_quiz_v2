'use client';

import type { MediaBlock } from '@/types/media';
import { isImageMedia } from '@/types/media';

interface QuestionMediaProps {
  media: MediaBlock | null;
  className?: string;
}

/**
 * 題目媒體顯示元件
 * 用於在前台和後台顯示題目的圖片、圖表等媒體資源
 */
export default function QuestionMedia({ media, className = '' }: QuestionMediaProps) {
  if (!media) return null;

  if (isImageMedia(media)) {
    return (
      <div className={`my-4 ${className}`}>
        <div className="flex flex-col items-center">
          <img
            src={media.url}
            alt={media.caption || '題目圖片'}
            className="max-w-full max-h-[400px] object-contain rounded-lg border border-gray-300 shadow-sm"
            onError={(e) => {
              // 圖片載入失敗時顯示替代內容
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const errorDiv = document.createElement('div');
              errorDiv.className = 'p-4 bg-gray-100 border border-gray-300 rounded text-gray-500 text-sm';
              errorDiv.textContent = '圖片載入失敗';
              target.parentElement?.appendChild(errorDiv);
            }}
          />
          {media.caption && (
            <p className="mt-2 text-sm text-gray-600 text-center italic">
              {media.caption}
            </p>
          )}
        </div>
      </div>
    );
  }

  // 未來可擴充其他媒體類型（表格、圖表等）
  return null;
}


