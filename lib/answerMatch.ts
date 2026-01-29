export function extractFirstNumber(value: string): number | null {
  if (!value) return null;
  const cleaned = value.replace(/,/g, '').trim();
  if (!cleaned) return null;
  // Avoid treating fractions like 1/2 as 1
  if (cleaned.includes('/')) return null;
  const match = cleaned.match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const num = Number(match[0]);
  return Number.isNaN(num) ? null : num;
}

export function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function isAnswerMatch(userAnswer: string, expectedAnswer: string): boolean {
  const userNum = extractFirstNumber(userAnswer);
  const expectedNum = extractFirstNumber(expectedAnswer);
  if (userNum !== null && expectedNum !== null) {
    return userNum === expectedNum;
  }
  return normalizeText(userAnswer) === normalizeText(expectedAnswer);
}

