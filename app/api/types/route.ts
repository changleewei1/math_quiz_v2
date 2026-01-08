import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

// 公開 API：學生端使用，不需要登入
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get('chapterId');

    if (!chapterId) {
      return NextResponse.json(
        { error: '缺少 chapterId 參數' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('question_types')
      .select('*')
      .eq('chapter_id', chapterId)
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
      { error: error.message || '取得題型失敗' },
      { status: 500 }
    );
  }
}


