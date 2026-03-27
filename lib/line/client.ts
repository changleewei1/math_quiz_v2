export const LINE_API_BASE = 'https://api.line.me/v2/bot';

export function getLineHeaders() {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN!;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}


