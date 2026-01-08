/**
 * 報表連結 Token 生成與驗證
 * 注意：此檔案用於 Server-side API routes（非 Edge Runtime）
 */

import crypto from 'crypto';

const TOKEN_SECRET = process.env.PARENT_LINK_SECRET || process.env.REPORT_TOKEN_SECRET || process.env.ADMIN_COOKIE_SECRET || '';

if (!TOKEN_SECRET || TOKEN_SECRET.length < 32) {
  throw new Error('PARENT_LINK_SECRET, REPORT_TOKEN_SECRET or ADMIN_COOKIE_SECRET must be at least 32 characters');
}

/**
 * 生成報表連結 token
 * token = HMAC(studentId + expireTimestamp)
 * @param studentId 學生 ID
 * @param days 有效天數（預設 7 天）
 */
export function generateReportToken(studentId: string, days: number = 7): string {
  const expireTs = Date.now() + days * 24 * 60 * 60 * 1000;
  const data = `${studentId}:${expireTs}`;
  
  const hmac = crypto.createHmac('sha256', TOKEN_SECRET);
  hmac.update(data);
  const signature = hmac.digest('hex');
  
  return `${Buffer.from(data).toString('base64url')}.${signature}`;
}

/**
 * 驗證報表連結 token
 * 回傳 { valid: boolean, studentId?: string, expired?: boolean }
 */
export function verifyReportToken(token: string): { valid: boolean; studentId?: string; expired?: boolean } {
  try {
    const [encodedData, signature] = token.split('.');
    if (!encodedData || !signature) {
      return { valid: false };
    }

    const data = Buffer.from(encodedData, 'base64url').toString('utf-8');
    const [studentId, expireTsStr] = data.split(':');
    const expireTs = parseInt(expireTsStr, 10);

    if (isNaN(expireTs)) {
      return { valid: false };
    }

    // 檢查是否過期
    if (Date.now() > expireTs) {
      return { valid: false, expired: true };
    }

    // 驗證簽名
    const hmac = crypto.createHmac('sha256', TOKEN_SECRET);
    hmac.update(data);
    const expectedSignature = hmac.digest('hex');

    if (signature !== expectedSignature) {
      return { valid: false };
    }

    return { valid: true, studentId };
  } catch (error) {
    return { valid: false };
  }
}

