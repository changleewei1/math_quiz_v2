/**
 * MVP 漏斗用：手機 Safari 無痕或儲存受限時，localStorage 可能拋錯或無法寫入。
 * 先寫 localStorage，失敗則改 sessionStorage（同一分頁內 register → quiz → report 仍可用）。
 */

function setItem(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    try {
      window.sessionStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }
}

function getItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const fromLs = window.localStorage.getItem(key);
    if (fromLs != null) return fromLs;
  } catch {
    /* ignore */
  }
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setMvpRegister(sessionId: string, json: string): boolean {
  return setItem(`mvp-register-${sessionId}`, json);
}

export function getMvpRegister(sessionId: string): string | null {
  return getItem(`mvp-register-${sessionId}`);
}

export function setMvpResult(sessionId: string, json: string): boolean {
  return setItem(`mvp-result-${sessionId}`, json);
}

export function getMvpResult(sessionId: string): string | null {
  return getItem(`mvp-result-${sessionId}`);
}

/** 產生 sessionId；舊裝置無 randomUUID 時退化。 */
export function newMvpSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
