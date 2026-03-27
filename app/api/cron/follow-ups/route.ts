import { NextResponse } from 'next/server';
import { verifyCronSecret } from '@/lib/security/cron';
import { runFollowUpReminderJob } from '@/lib/automations/follow-ups';

export async function GET(req: Request) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runFollowUpReminderJob();
    return NextResponse.json({ ok: true, job: 'follow-ups', result });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message }, { status: 500 });
  }
}


