import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const bucket = String(formData.get('bucket') || '');
    const path = String(formData.get('path') || '');
    const subject = String(formData.get('subject') || 'math');
    const examYear = String(formData.get('exam_year') || 'unknown');
    const questionNo = String(formData.get('question_no') || 'unknown');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: '缺少檔案' }, { status: 400 });
    }

    if (bucket) {
      const allowedBuckets = new Set(['question-assets', 'question-media']);
      if (!allowedBuckets.has(bucket)) {
        return NextResponse.json({ error: '不支援的儲存位置' }, { status: 400 });
      }
      if (!path || path.startsWith('/') || path.includes('..')) {
        return NextResponse.json({ error: '上傳路徑不合法' }, { status: 400 });
      }
    }

    const ext = file.name.includes('.') ? file.name.split('.').pop() : 'png';
    const filename = `${nanoid(12)}.${ext}`;
    const uploadPath = bucket
      ? path
      : `cap/${subject}/${examYear}/${questionNo}/${filename}`;

    const supabase = supabaseAdmin();
    const { error } = await supabase.storage
      .from(bucket || 'question-assets')
      .upload(uploadPath, file, {
        contentType: file.type || 'image/png',
        upsert: true,
      });

    if (error) throw error;

    const { data } = supabase.storage.from(bucket || 'question-assets').getPublicUrl(uploadPath);
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


