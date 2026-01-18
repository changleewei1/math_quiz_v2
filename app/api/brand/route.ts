import { NextResponse } from 'next/server';
import { getBrandSettings } from '@/lib/brandSettings';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // 快取 60 秒

/**
 * GET: 取得品牌設定（公開 API，前台使用）
 */
export async function GET() {
  try {
    const settings = await getBrandSettings();
    return NextResponse.json({ 
      data: settings,
      // 添加快取標頭
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error: any) {
    console.error('取得品牌設定失敗:', error);
    // 返回預設值，避免前台錯誤
    return NextResponse.json({
      data: {
        id: 'default',
        brand_name: '名貫補習班',
        logo_url: '/Black and White Circle Business Logo.png',
        font_family: 'var(--font-noto-serif-tc), serif',
        updated_at: new Date().toISOString(),
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  }
}

