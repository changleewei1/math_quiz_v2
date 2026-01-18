/**
 * 字型設定檔
 * 在此新增可用的字型選項
 */

export interface FontOption {
  id: string;
  name: string;
  cssFamily: string;
  filePath?: string; // 如果字型在 public/fonts，可選填
  description?: string;
}

export const AVAILABLE_FONTS: FontOption[] = [
  {
    id: 'noto-serif-tc',
    name: 'Noto Serif TC (思源宋體)',
    cssFamily: 'var(--font-noto-serif-tc), serif',
    description: '預設字型，Google Fonts',
  },
  {
    id: 'system',
    name: '系統預設字型',
    cssFamily: 'system-ui, -apple-system, "Segoe UI", "Noto Sans TC", sans-serif',
    description: '使用系統預設字型',
  },
  {
    id: 'inter',
    name: 'Inter',
    cssFamily: 'var(--font-inter), sans-serif',
    description: 'Google Fonts - Inter',
  },
  // 在此新增自訂字型
  // 範例：
  // {
  //   id: 'custom-font',
  //   name: '自訂字型名稱',
  //   cssFamily: '"CustomFont", "Noto Sans TC", sans-serif',
  //   filePath: '/fonts/custom-font.woff2',
  //   description: '自訂字型說明',
  // },
];

/**
 * 根據 ID 取得字型選項
 */
export function getFontById(id: string): FontOption | undefined {
  return AVAILABLE_FONTS.find(font => font.id === id);
}

/**
 * 取得預設字型
 */
export function getDefaultFont(): FontOption {
  return AVAILABLE_FONTS[0];
}


