import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const chapterId = String(formData.get('chapterId') || '');
    const typeId = String(formData.get('typeId') || '');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: '缺少檔案' }, { status: 400 });
    }
    if (!chapterId || !typeId) {
      return NextResponse.json({ error: '缺少章節或題型' }, { status: 400 });
    }

    const ext = file.name.includes('.') ? file.name.split('.').pop() : 'png';
    const uuid = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Date.now().toString();
    const path = `questions/${chapterId}/${typeId}/${uuid}.${ext}`;

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

