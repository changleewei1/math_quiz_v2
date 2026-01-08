import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

// 公開 API：學生端使用，不需要登入
export async function GET() {
  try {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw error;

    // 設置響應頭以防止緩存
    const response = NextResponse.json({ data });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '取得章節失敗' },
      { status: 500 }
    );
  }
}


