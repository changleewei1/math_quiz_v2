export function formatDate(value?: string | null) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('zh-TW');
  } catch {
    return value;
  }
}

export function formatDateTime(value?: string | null) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('zh-TW');
  } catch {
    return value;
  }
}

export function truncateText(text: string, max = 48) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}…` : text;
}


