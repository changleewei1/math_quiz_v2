/**
 * 題目媒體資源類型定義
 */

// 圖片類型
export interface ImageMedia {
  type: 'image';
  url: string;
  caption?: string;
}

// 表格類型（未來擴充）
export interface TableMedia {
  type: 'table';
  data: {
    headers: string[];
    rows: (string | number)[][];
  };
  caption?: string;
}

// 圖表類型（未來擴充）
export interface ChartMedia {
  type: 'chart';
  chartType: 'bar' | 'line' | 'pie';
  data: any;
  caption?: string;
}

// 聯合類型
export type MediaBlock = ImageMedia | TableMedia | ChartMedia;

/**
 * 判斷是否為圖片媒體
 */
export function isImageMedia(media: MediaBlock): media is ImageMedia {
  return media.type === 'image';
}

/**
 * 判斷是否為表格媒體
 */
export function isTableMedia(media: MediaBlock): media is TableMedia {
  return media.type === 'table';
}

/**
 * 判斷是否為圖表媒體
 */
export function isChartMedia(media: MediaBlock): media is ChartMedia {
  return media.type === 'chart';
}

/**
 * 安全解析 media 資料（從 JSONB 轉換）
 * 處理可能的 null、undefined、或格式錯誤的情況
 */
export function parseMedia(media: any): MediaBlock | MediaBlock[] | null {
  if (!media) return null;
  
  try {
    // 如果已經是正確格式，直接返回
    if (typeof media === 'object' && 'type' in media) {
      if (Array.isArray(media)) {
        return media.filter(m => m && typeof m === 'object' && 'type' in m) as MediaBlock[];
      }
      return media as MediaBlock;
    }

    // 如果是字串，嘗試解析 JSON
    if (typeof media === 'string') {
      const parsed = JSON.parse(media);
      if (Array.isArray(parsed)) {
        return parsed.filter(m => m && typeof m === 'object' && 'type' in m) as MediaBlock[];
      }
      if (parsed && typeof parsed === 'object' && 'type' in parsed) {
        return parsed as MediaBlock;
      }
    }

    return null;
  } catch (error) {
    console.error('解析 media 資料失敗:', error);
    return null;
  }
}

/**
 * 驗證 MediaBlock 是否為有效格式
 */
export function isValidMediaBlock(media: any): media is MediaBlock {
  if (!media || typeof media !== 'object') return false;
  if (!('type' in media)) return false;

  const type = media.type;
  
  if (type === 'image') {
    return 'url' in media && typeof media.url === 'string';
  }
  
  if (type === 'table') {
    return 'data' in media && 
           media.data && 
           typeof media.data === 'object' &&
           'headers' in media.data &&
           'rows' in media.data;
  }
  
  if (type === 'chart') {
    return 'chartType' in media && 'data' in media;
  }

  return false;
}

