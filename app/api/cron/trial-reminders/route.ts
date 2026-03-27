import { NextResponse } from 'next/server';
import { verifyCronSecret } from '@/lib/security/cron';
import { runTrialReminderJob } from '@/lib/automations/trials';

export async function GET(req: Request) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runTrialReminderJob();
    return NextResponse.json({ ok: true, job: 'trial-reminders', result });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message }, { status: 500 });
  }
}


