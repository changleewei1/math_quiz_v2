import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { consumeBindToken } from '@/lib/line/bindings';
import { sendLineReplyMessage } from '@/lib/line/send';
import {
  buildBindErrorMessage,
  buildBindSuccessMessage,
  buildWelcomeMessage,
} from '@/lib/line/messages';

const TOKEN_REGEX = /(?:綁定碼|綁定|BIND)\s*[:：]?\s*([A-Z0-9]{6,12})/i;

function verifySignature(body: string, signature: string | null) {
  const secret = process.env.LINE_CHANNEL_SECRET || '';
  if (!secret || !signature) return false;
  const hash = crypto.createHmac('sha256', secret).update(body).digest('base64');
  return signature === hash;
}

export async function POST(req: Request) {
  const signature = req.headers.get('x-line-signature');
  const body = await req.text();

  if (!verifySignature(body, signature)) {
    return NextResponse.json(
      { ok: false, message: 'Invalid signature' },
      { status: 200 }
    );
  }

  let payload: any;
  try {
    payload = JSON.parse(body);
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: 'Invalid payload' },
      { status: 200 }
    );
  }

  const events = payload?.events ?? [];

  for (const event of events) {
    if (event.type === 'follow') {
      if (event.replyToken) {
        const messagePack = buildWelcomeMessage();
        await sendLineReplyMessage(event.replyToken, [messagePack.message]);
      }
      continue;
    }

    if (event.type === 'message' && event.message?.type === 'text') {
      const text = String(event.message.text || '').trim();
      const match = text.match(TOKEN_REGEX);
      if (match) {
        const token = match[1].toUpperCase();
        const lineUserId = event.source?.userId;
        if (!lineUserId) {
          if (event.replyToken) {
            const messagePack = buildBindErrorMessage('找不到 LINE 使用者資訊，請稍後再試。');
            await sendLineReplyMessage(event.replyToken, [messagePack.message]);
          }
          continue;
        }

        const result = await consumeBindToken(token, lineUserId);
        if (event.replyToken) {
          const messagePack = result.ok
            ? buildBindSuccessMessage()
            : buildBindErrorMessage(result.message ?? '綁定失敗，請稍後再試。');
          await sendLineReplyMessage(event.replyToken, [messagePack.message]);
        }
      }
    }
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}

