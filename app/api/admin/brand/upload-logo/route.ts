import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCookie } from '@/lib/adminAuth';
import { supabaseServer } from '@/lib/supabaseServer';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

/**
 * POST: 上傳 Logo 到 Supabase Storage
 */
export async function POST(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminCookie();
    if (!adminAuth.authenticated) {
      return NextResponse.json(
        { error: '未授權，請先登入' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '請選擇要上傳的檔案' },
        { status: 400 }
      );
    }

    // 驗證檔案類型
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '不支援的檔案格式，請上傳 PNG、JPEG、SVG 或 WebP' },
        { status: 400 }
      );
    }

    // 驗證檔案大小（最大 5MB）
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '檔案大小超過 5MB' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    
    // 檢查 bucket 是否存在
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    const brandBucketExists = buckets?.some(b => b.name === 'brand-assets');
    
    if (!brandBucketExists) {
      return NextResponse.json(
        { error: 'brand-assets Storage bucket 尚未建立，請先在 Supabase Dashboard 建立此 bucket' },
        { status: 400 }
      );
    }
    
    // 轉換 File 為 ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 決定檔案名稱（使用 timestamp 避免快取問題）
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `logo-${timestamp}.${fileExt}`;
    const filePath = `brand-assets/${fileName}`;

    // 上傳到 Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('brand-assets')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false, // 不覆蓋，每次都建立新檔
      });

    if (uploadError) {
      console.error('上傳 Logo 失敗:', uploadError);
      // 如果是 bucket 不存在的錯誤，提供更清楚的訊息
      if (uploadError.message?.includes('not found') || uploadError.message?.includes('does not exist')) {
        return NextResponse.json(
          { error: 'brand-assets Storage bucket 不存在，請先在 Supabase Dashboard 建立此 bucket（設定為 Public）' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: '上傳 Logo 失敗: ' + uploadError.message },
        { status: 500 }
      );
    }

    // 取得公開 URL
    const { data: urlData } = supabase.storage
      .from('brand-assets')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // 更新資料庫中的 logo_url
    const { error: updateError } = await supabase
      .from('brand_settings')
      .update({ logo_url: publicUrl })
      .eq('id', 'default');

    if (updateError) {
      console.error('更新 Logo URL 失敗:', updateError);
      // 即使更新失敗，也返回上傳成功的 URL，讓前端可以手動更新
      return NextResponse.json({
        url: publicUrl,
        warning: 'Logo 已上傳，但更新資料庫失敗，請手動更新',
      });
    }

    // 刪除舊的 Logo（如果有的話）
    // 注意：這裡可以實作清理舊檔的邏輯，但為了簡化，先不實作
    // 可以定期清理或使用版本控制

    // 重新驗證前台頁面
    revalidatePath('/');
    revalidatePath('/login');
    revalidatePath('/admin');

    return NextResponse.json({
      success: true,
      url: publicUrl,
      message: 'Logo 上傳成功',
    });
  } catch (error: any) {
    console.error('上傳 Logo 失敗:', error);
    return NextResponse.json(
      { error: error.message || '上傳 Logo 失敗' },
      { status: 500 }
    );
  }
}

