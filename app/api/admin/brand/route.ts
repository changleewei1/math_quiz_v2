import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCookie } from '@/lib/adminAuth';
import { supabaseServer } from '@/lib/supabaseServer';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

/**
 * GET: 取得品牌設定
 */
export async function GET() {
  try {
    const adminAuth = await verifyAdminCookie();
    if (!adminAuth.authenticated) {
      return NextResponse.json(
        { error: '未授權，請先登入' },
        { status: 401 }
      );
    }

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('brand_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error) {
      console.error('取得品牌設定失敗:', error);
      // 如果資料表不存在，返回預設值
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        return NextResponse.json({
          data: {
            id: 'default',
            brand_name: '名貫補習班',
            logo_url: '/Black and White Circle Business Logo.png',
            font_family: 'var(--font-noto-serif-tc), serif',
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          },
        });
      }
      return NextResponse.json(
        { error: '取得品牌設定失敗: ' + error.message },
        { status: 500 }
      );
    }

    // 確保有預設值
    const brandData = data || {
      id: 'default',
      brand_name: '名貫補習班',
      logo_url: '/Black and White Circle Business Logo.png',
      font_family: 'var(--font-noto-serif-tc), serif',
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({ data: brandData });
  } catch (error: any) {
    console.error('取得品牌設定失敗:', error);
    return NextResponse.json(
      { error: error.message || '取得品牌設定失敗' },
      { status: 500 }
    );
  }
}

/**
 * PATCH: 更新品牌設定
 */
export async function PATCH(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminCookie();
    if (!adminAuth.authenticated) {
      return NextResponse.json(
        { error: '未授權，請先登入' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { brand_name, logo_url, font_family } = body;

    const supabase = supabaseServer();
    const updateData: any = {};

    if (brand_name !== undefined) {
      updateData.brand_name = brand_name;
    }
    if (logo_url !== undefined) {
      updateData.logo_url = logo_url;
    }
    if (font_family !== undefined) {
      updateData.font_family = font_family;
    }

    const { data, error } = await supabase
      .from('brand_settings')
      .update(updateData)
      .eq('id', 'default')
      .select()
      .single();

    if (error) {
      console.error('更新品牌設定失敗:', error);
      // 如果是資料表不存在的錯誤，提示用戶執行 SQL 腳本
      if (error.code === 'PGRST116' || error.message?.includes('does not exist') || error.message?.includes('relation')) {
        return NextResponse.json(
          { error: 'brand_settings 資料表不存在，請先執行 supabase/add_brand_settings.sql 建立資料表' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: '更新品牌設定失敗: ' + (error.message || '未知錯誤') },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: '更新後無法取得資料，請檢查資料表設定' },
        { status: 500 }
      );
    }

    // 重新驗證前台頁面，讓設定立即生效
    revalidatePath('/');
    revalidatePath('/login');
    revalidatePath('/admin');

    return NextResponse.json({ data, message: '品牌設定已更新' });
  } catch (error: any) {
    console.error('更新品牌設定失敗:', error);
    return NextResponse.json(
      { error: error.message || '更新品牌設定失敗' },
      { status: 500 }
    );
  }
}

