import { NextRequest, NextResponse } from 'next/server';
import { getSessionReport } from '@/lib/reportAggregation';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    if (!sessionId) {
      return NextResponse.json({ error: '缺少 sessionId' }, { status: 400 });
    }

    const report = await getSessionReport(sessionId);
    return NextResponse.json({ report });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '取得報表失敗' },
      { status: 500 }
    );
  }
}

