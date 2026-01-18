/**
 * 品牌設定 Server-side Helper
 * 使用 Next.js cache 機制避免重複查詢
 */

import { cache } from 'react';
import { supabaseServer } from './supabaseServer';

export interface BrandSettings {
  id: string;
  brand_name: string;
  logo_url: string | null;
  font_family: string;
  updated_at: string;
}

/**
 * 取得品牌設定（使用 React cache 快取）
 * 在相同的 request 中只會查詢一次
 */
export const getBrandSettings = cache(async (): Promise<BrandSettings> => {
  try {
    const supabase = supabaseServer();
    
    const { data, error } = await supabase
      .from('brand_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error) {
      // 如果資料表不存在（PGRST116）或其他錯誤，返回預設值
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        console.warn('brand_settings 資料表不存在，使用預設值。請執行 supabase/add_brand_settings.sql');
      } else {
        console.warn('無法載入品牌設定，使用預設值:', error.message);
      }
      return {
        id: 'default',
        brand_name: '名貫補習班',
        logo_url: '/Black and White Circle Business Logo.png',
        font_family: 'var(--font-noto-serif-tc), serif',
        updated_at: new Date().toISOString(),
      };
    }

    if (!data) {
      console.warn('brand_settings 沒有資料，使用預設值');
      return {
        id: 'default',
        brand_name: '名貫補習班',
        logo_url: '/Black and White Circle Business Logo.png',
        font_family: 'var(--font-noto-serif-tc), serif',
        updated_at: new Date().toISOString(),
      };
    }

    return {
      id: data.id || 'default',
      brand_name: data.brand_name || '名貫補習班',
      logo_url: data.logo_url || '/Black and White Circle Business Logo.png',
      font_family: data.font_family || 'var(--font-noto-serif-tc), serif',
      updated_at: data.updated_at || new Date().toISOString(),
    };
  } catch (error: any) {
    // 捕獲任何意外錯誤，確保函數不會崩潰
    console.error('getBrandSettings 發生錯誤:', error);
    return {
      id: 'default',
      brand_name: '名貫補習班',
      logo_url: '/Black and White Circle Business Logo.png',
      font_family: 'var(--font-noto-serif-tc), serif',
      updated_at: new Date().toISOString(),
    };
  }
});

