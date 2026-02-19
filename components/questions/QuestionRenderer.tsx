'use client';

import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import type { MediaBlock } from '@/types/media';
import { isImageMedia, isTableMedia, isChartMedia, parseMedia, isValidMediaBlock } from '@/types/media';
import MediaImage from './MediaImage';

interface QuestionRendererProps {
  prompt: string;
  media?: MediaBlock | MediaBlock[] | null | any; // 允許 any 以處理從 DB 來的 JSONB
  className?: string;
}

/**
 * 統一的題目呈現元件
 * 用於學生端（弱點分析/題型練習）和後台預覽
 */
export default function QuestionRenderer({
  prompt,
  media,
  className = '',
}: QuestionRendererProps) {
  // 安全解析 media 資料（處理 JSONB、null、undefined 等情況）
  const parsedMedia = parseMedia(media);

  // 將 media 統一轉換為陣列，並過濾無效項目
  const mediaArray: MediaBlock[] = (() => {
    if (!parsedMedia) return [];
    if (Array.isArray(parsedMedia)) {
      return parsedMedia.filter(m => isValidMediaBlock(m));
    }
    if (isValidMediaBlock(parsedMedia)) {
      return [parsedMedia];
    }
    return [];
  })();

  return (
    <div className={className}>
      {/* 題幹文字 */}
      <div className="mb-4">
        <div className="text-lg leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkBreaks]}
            components={{
              img: ({ ...props }) => (
                <img
                  {...props}
                  alt={props.alt || 'image'}
                  className="max-w-full h-auto my-3 rounded border border-gray-200"
                />
              ),
              p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
            }}
          >
            {prompt || ''}
          </ReactMarkdown>
        </div>
      </div>

      {/* 媒體資源（圖片、表格、圖表等） */}
      {mediaArray.length > 0 && (
        <div className="space-y-4 my-4">
          {mediaArray.map((mediaItem, index) => {
            // 圖片類型
            if (isImageMedia(mediaItem)) {
              return (
                <MediaImage
                  key={index}
                  media={mediaItem}
                  maxHeight="400px"
                />
              );
            }

            // 表格類型
            if (isTableMedia(mediaItem)) {
              return (
                <div key={index} className="my-4 overflow-x-auto">
                  <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                      <tr>
                        {mediaItem.data.headers.map((header, i) => (
                          <th
                            key={i}
                            className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b border-gray-300"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {mediaItem.data.rows.map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        >
                          {row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-4 py-2 text-sm text-gray-900 border-b border-gray-200"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {mediaItem.caption && (
                    <p className="mt-2 text-sm text-gray-600 text-center italic">
                      {mediaItem.caption}
                    </p>
                  )}
                </div>
              );
            }

            // 圖表類型（使用 Recharts）
            if (isChartMedia(mediaItem)) {
              // TODO: 實作圖表渲染
              // 目前先顯示 placeholder
              return (
                <div key={index} className="my-4 p-4 bg-gray-50 border border-gray-300 rounded-lg">
                  <p className="text-sm text-gray-600 text-center">
                    [圖表預覽：{mediaItem.chartType} 圖表]
                  </p>
                  {mediaItem.caption && (
                    <p className="mt-2 text-sm text-gray-600 text-center italic">
                      {mediaItem.caption}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-400 text-center">
                    （圖表功能開發中）
                  </p>
                </div>
              );
            }

            return null;
          })}
        </div>
      )}
    </div>
  );
}

