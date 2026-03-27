import { LINE_API_BASE, getLineHeaders } from '@/lib/line/client';
import type { LineMessage, LinePushResult } from '@/lib/types/line';

export async function sendLinePushMessage(
  lineUserId: string,
  messages: LineMessage[]
): Promise<LinePushResult> {
  try {
    const res = await fetch(`${LINE_API_BASE}/message/push`, {
      method: 'POST',
      headers: getLineHeaders(),
      body: JSON.stringify({
        to: lineUserId,
        messages,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return { ok: false, errorMessage: errorText };
    }

    return { ok: true };
  } catch (error: any) {
    return { ok: false, errorMessage: error?.message || 'LINE 發送失敗' };
  }
}

export async function sendLineReplyMessage(
  replyToken: string,
  messages: LineMessage[]
): Promise<LinePushResult> {
  try {
    const res = await fetch(`${LINE_API_BASE}/message/reply`, {
      method: 'POST',
      headers: getLineHeaders(),
      body: JSON.stringify({
        replyToken,
        messages,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return { ok: false, errorMessage: errorText };
    }

    return { ok: true };
  } catch (error: any) {
    return { ok: false, errorMessage: error?.message || 'LINE 回覆失敗' };
  }
}

