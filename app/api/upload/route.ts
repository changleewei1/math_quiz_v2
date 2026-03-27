import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { getAdminSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: '缺少檔案' }, { status: 400 });
    }

    const ext = file.name.includes('.') ? file.name.split('.').pop() : 'png';
    const filename = `${nanoid(12)}.${ext}`;
    const path = `rich-content/${filename}`;

    const supabase = supabaseAdmin();
    const { error } = await supabase.storage
      .from('question-assets')
      .upload(path, file, {
        contentType: file.type || 'image/png',
        upsert: true,
      });

    if (error) throw error;

    const { data } = supabase.storage.from('question-assets').getPublicUrl(path);
    if (!data?.publicUrl) {
      return NextResponse.json({ error: '取得圖片網址失敗' }, { status: 500 });
    }

    return NextResponse.json({ url: data.publicUrl });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '上傳失敗' },
      { status: 500 }
    );
  }
}

