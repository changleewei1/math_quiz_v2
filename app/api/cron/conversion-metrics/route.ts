import { NextResponse } from 'next/server';
import { verifyCronSecret } from '@/lib/security/cron';
import { runConversionMetricsJob } from '@/lib/automations/metrics';

export async function GET(req: Request) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runConversionMetricsJob();
    return NextResponse.json({ ok: true, job: 'conversion-metrics', result });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message }, { status: 500 });
  }
}


