import type { Dimension } from '@/lib/questions';
import { DIMENSION_LABEL } from '@/lib/questions';
import type { VideoIndexEntry } from '@/lib/video-index';

export interface WeaknessInput {
  concept_tag: string;
  dimension: Dimension;
  mistake_type: string;
}

export interface VideoSearchResult {
  video: VideoIndexEntry;
  score: number;
  matched: {
    conceptTagHit: boolean;
    dimensionHit: boolean;
    transcriptHit: boolean;
    titleHit: boolean;
  };
  reason: string;
}

function normalize(s: string): string {
  return (s ?? '').toLowerCase().replaceAll(/[\u3000\s]+/g, ' ').trim();
}

function includesLoose(haystack: string, needle: string): boolean {
  if (!haystack || !needle) return false;
  return haystack.includes(needle);
}

function tokenizeConcept(conceptTag: string): string[] {
  // for Chinese phrases, keep original + split by common separators; also add 2-gram-ish fallback by removing spaces
  const raw = conceptTag.trim();
  if (!raw) return [];
  const tokens = raw
    .split(/[\s/｜|、，。()（）\-]+/g)
    .map((t) => t.trim())
    .filter(Boolean);
  return Array.from(new Set([raw, ...tokens])).filter((t) => t.length >= 2);
}

function scoreOne(video: VideoIndexEntry, weakness: WeaknessInput): Omit<VideoSearchResult, 'video' | 'reason'> {
  const conceptTagHit = video.concept_tags.includes(weakness.concept_tag);
  const dimensionHit = Boolean(video.dimension && video.dimension === weakness.dimension);

  const transcript = normalize(video.transcript ?? '');
  const title = normalize(video.title);

  const conceptTokens = tokenizeConcept(weakness.concept_tag).map(normalize).filter(Boolean);
  const transcriptHit = conceptTokens.some((t) => includesLoose(transcript, t));
  const titleHit = conceptTokens.some((t) => includesLoose(title, t));

  let score = 0;
  if (conceptTagHit) score += 100;
  if (dimensionHit) score += 30;
  if (transcriptHit) score += 18;
  if (titleHit) score += 10;

  // slight tie-breakers
  if (!conceptTagHit && video.concept_tags.length > 0) score += 2; // has structured tags
  if (video.transcript && video.transcript.length > 200) score += 2; // has usable transcript

  return {
    score,
    matched: { conceptTagHit, dimensionHit, transcriptHit, titleHit },
  };
}

export function generateVideoReason(video: VideoIndexEntry, weakness: WeaknessInput): string {
  const parts: string[] = [];
  parts.push(`對準弱點「${weakness.concept_tag}」`);
  parts.push(`（${DIMENSION_LABEL[weakness.dimension]}）`);

  const mistakeHints: Record<string, string> = {
    不會列式: '這類題目常卡在把題意轉成等量關係與算式的第一步',
    題意轉換錯誤: '這類題目常卡在抓錯關鍵量或關係，導致列式方向偏掉',
    概念混淆: '這類題目常卡在觀念邊界不清，容易把相近概念混在一起用',
    計算不穩: '這類題目常卡在計算/通分/換算的穩定度，導致後續推理被拖累',
  };
  const hint = mistakeHints[weakness.mistake_type] ?? '這類題目常卡在觀念與步驟銜接不夠清楚';
  parts.push(`因為你在此類題型出現「${weakness.mistake_type}」：${hint}。`);

  if (video.concept_tags.includes(weakness.concept_tag)) {
    parts.push('影片內容已被系統標記為同一個概念標籤。');
  } else if (video.dimension === weakness.dimension) {
    parts.push('雖未直接命中同名概念標籤，但屬於同一向度的補強內容。');
  }

  return parts.join('');
}

export function searchVideos(args: {
  weakness: WeaknessInput;
  index: VideoIndexEntry[];
  limit?: number;
}): VideoSearchResult[] {
  const limit = args.limit ?? 5;
  const scored = args.index
    .map((v) => {
      const s = scoreOne(v, args.weakness);
      return {
        video: v,
        score: s.score,
        matched: s.matched,
        reason: generateVideoReason(v, args.weakness),
      } satisfies VideoSearchResult;
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}

