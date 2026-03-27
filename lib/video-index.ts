import type { Dimension } from '@/lib/questions';
import { QUESTIONS } from '@/lib/questions';
import {
  fetchPlaylistVideoIds,
  fetchVideosInfo,
  fetchYouTubeTranscript,
  parseYouTubeSource,
  type TranscriptResult,
  type YouTubeSource,
  type YouTubeVideoInfo,
} from '@/lib/youtube';

export interface VideoIndexEntry {
  videoId: string;
  title: string;
  description: string;
  transcript: string | null;
  transcriptMeta?: Pick<TranscriptResult, 'ok' | 'method' | 'language' | 'note'>;
  keywords: string[];
  dimension: Dimension | null;
  concept_tags: string[];
  sourceUrl?: string;
  analyzedAt: string;
}

export interface BuildVideoIndexOptions {
  apiKey: string;
  sources: string[];
  preferredTranscriptLangs?: string[];
  maxPlaylistPages?: number;
}

const CONCEPT_TO_DIMENSION: Map<string, Dimension> = new Map(
  QUESTIONS.map((q) => [q.concept_tag, q.dimension])
);

const ALL_CONCEPT_TAGS: string[] = Array.from(new Set(QUESTIONS.map((q) => q.concept_tag)));

function normalizeText(input: string): string {
  return (input ?? '')
    .toLowerCase()
    .replaceAll(/[\u3000\s]+/g, ' ')
    .replaceAll(/[，。！？、；：「」『』（）()[\]{}<>]/g, ' ')
    .trim();
}

function extractKeywords(text: string): string[] {
  const norm = normalizeText(text);
  if (!norm) return [];

  const rawTokens = norm
    .split(' ')
    .map((t) => t.trim())
    .filter(Boolean);

  const tokens: string[] = [];
  for (const t of rawTokens) {
    if (t.length <= 1) continue;
    if (t.length > 40) continue;
    tokens.push(t);
  }

  return Array.from(new Set(tokens)).slice(0, 120);
}

function detectConceptTagsFromText(text: string): string[] {
  if (!text) return [];
  const haystack = text; // keep original case; concept tags are Chinese phrases
  const hits: string[] = [];
  for (const tag of ALL_CONCEPT_TAGS) {
    if (tag && haystack.includes(tag)) hits.push(tag);
  }
  return hits;
}

function inferDimensionFromKeywords(text: string): Dimension | null {
  const t = normalizeText(text);
  if (!t) return null;

  const rules: Array<{ dimension: Dimension; any: string[] }> = [
    { dimension: 'algebra_logic', any: ['方程式', '未知數', '代數', '等量', '化簡', '規律', '數列'] },
    { dimension: 'number_sense', any: ['分數', '小數', '百分率', '通分', '四則', '估算', '換算'] },
    { dimension: 'geometry', any: ['三角形', '圓', '周長', '面積', '角度', '立體', '表面積'] },
    { dimension: 'data_reasoning', any: ['折線圖', '圓形圖', '統計', '平均數', '表格', '資料'] },
    { dimension: 'word_problem', any: ['應用題', '文字題', '題意', '列式', '情境'] },
  ];

  for (const r of rules) {
    if (r.any.some((k) => t.includes(k.toLowerCase()))) return r.dimension;
  }
  return null;
}

/**
 * 自動分析影片內容（可擴充到 embedding / LLM）。
 * 目前採規則式：
 * - 優先用 concept_tag 直接命中（對齊題庫概念標籤）
 * - 次要用關鍵字推測 dimension
 */
export function analyzeVideoContent(video: {
  title: string;
  description: string;
  transcript?: string | null;
}): { dimension: Dimension | null; concept_tags: string[]; keywords: string[] } {
  const joined = [video.title, video.description, video.transcript ?? ''].filter(Boolean).join('\n');
  const conceptHits = detectConceptTagsFromText(joined);

  let dimension: Dimension | null = null;
  if (conceptHits.length > 0) {
    const counts = new Map<Dimension, number>();
    for (const tag of conceptHits) {
      const dim = CONCEPT_TO_DIMENSION.get(tag);
      if (!dim) continue;
      counts.set(dim, (counts.get(dim) ?? 0) + 1);
    }
    const best = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
    dimension = best ?? null;
  }
  if (!dimension) dimension = inferDimensionFromKeywords(joined);

  const keywords = extractKeywords(joined);
  return {
    dimension,
    concept_tags: Array.from(new Set(conceptHits)),
    keywords,
  };
}

export async function buildVideoIndex(opts: BuildVideoIndexOptions): Promise<VideoIndexEntry[]> {
  const sources: YouTubeSource[] = opts.sources
    .map((u) => parseYouTubeSource(u))
    .filter((v): v is YouTubeSource => Boolean(v));

  const videoIds: Array<{ videoId: string; sourceUrl: string }> = [];

  for (const src of sources) {
    if (src.type === 'video') {
      videoIds.push({ videoId: src.videoId, sourceUrl: src.url });
      continue;
    }
    const ids = await fetchPlaylistVideoIds({
      playlistId: src.playlistId,
      apiKey: opts.apiKey,
      maxPages: opts.maxPlaylistPages,
    });
    for (const id of ids) videoIds.push({ videoId: id, sourceUrl: src.url });
  }

  const uniqueIds = Array.from(new Set(videoIds.map((v) => v.videoId)));
  const infoList: YouTubeVideoInfo[] = await fetchVideosInfo({ videoIds: uniqueIds, apiKey: opts.apiKey });

  const sourceUrlById = new Map<string, string>();
  for (const v of videoIds) {
    if (!sourceUrlById.has(v.videoId)) sourceUrlById.set(v.videoId, v.sourceUrl);
  }

  const entries: VideoIndexEntry[] = [];
  for (const info of infoList) {
    const transcriptRes = await fetchYouTubeTranscript({
      videoId: info.videoId,
      preferredLangs: opts.preferredTranscriptLangs,
    });

    const analysis = analyzeVideoContent({
      title: info.title,
      description: info.description,
      transcript: transcriptRes.transcript,
    });

    entries.push({
      videoId: info.videoId,
      title: info.title,
      description: info.description,
      transcript: transcriptRes.transcript,
      transcriptMeta: {
        ok: transcriptRes.ok,
        method: transcriptRes.method,
        language: transcriptRes.language,
        note: transcriptRes.note,
      },
      keywords: analysis.keywords,
      dimension: analysis.dimension,
      concept_tags: analysis.concept_tags,
      sourceUrl: sourceUrlById.get(info.videoId),
      analyzedAt: new Date().toISOString(),
    });
  }

  return entries;
}

