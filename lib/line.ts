/**
 * LINE Messaging API 封裝
 */

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const LINE_API_URL = 'https://api.line.me/v2/bot/message/push';

export interface LinePushMessageResult {
  success: boolean;
  error?: string;
}

/**
 * 發送 Push Message 到指定的 LINE User ID
 */
export async function pushMessage(
  to: string,
  messages: any[]
): Promise<LinePushMessageResult> {
  if (!LINE_CHANNEL_ACCESS_TOKEN) {
    return {
      success: false,
      error: 'LINE_CHANNEL_ACCESS_TOKEN 未設定',
    };
  }

  try {
    const response = await fetch(LINE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to,
        messages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}`,
      };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || '發送 LINE 訊息失敗',
    };
  }
}

/**
 * 批次發送訊息給多個接收者
 */
export async function pushMessageToRecipients(
  recipients: Array<{ line_user_id: string }>,
  messages: any[]
): Promise<Array<{ line_user_id: string; success: boolean; error?: string }>> {
  const results = await Promise.all(
    recipients.map(async (recipient) => {
      const result = await pushMessage(recipient.line_user_id, messages);
      return {
        line_user_id: recipient.line_user_id,
        success: result.success,
        error: result.error,
      };
    })
  );

  return results;
}

