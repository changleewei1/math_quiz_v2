'use client';

import { useState } from 'react';
import type { ImageMedia } from '@/types/media';

interface MediaImageProps {
  media: ImageMedia;
  className?: string;
  maxHeight?: string;
}

/**
 * 題目圖片顯示元件（包含點擊放大功能）
 */
export default function MediaImage({ 
  media, 
  className = '',
  maxHeight = '400px'
}: MediaImageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className={`my-4 p-4 bg-gray-100 border border-gray-300 rounded text-gray-500 text-sm text-center ${className}`}>
        圖片載入失敗
      </div>
    );
  }

  return (
    <>
      <div className={`my-4 ${className}`}>
        <div className="flex flex-col items-center">
          <div 
            className="cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setIsModalOpen(true)}
            title="點擊放大圖片"
          >
            <img
              src={media.url}
              alt={media.caption || '題目圖片'}
              className="max-w-full rounded-lg border border-gray-300 shadow-sm"
              style={{ maxHeight, objectFit: 'contain' }}
              onError={() => setImageError(true)}
            />
          </div>
          {media.caption && (
            <p className="mt-2 text-sm text-gray-600 text-center italic">
              {media.caption}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-400 text-center">
            （點擊圖片可放大查看）
          </p>
        </div>
      </div>

      {/* 放大 Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative max-w-full max-h-full">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-all"
              aria-label="關閉"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <img
              src={media.url}
              alt={media.caption || '題目圖片（放大）'}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            {media.caption && (
              <p className="mt-2 text-sm text-white text-center">
                {media.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}


