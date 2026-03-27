import { NextResponse } from 'next/server';
import { buildVideoIndex, type VideoIndexEntry } from '@/lib/video-index';
import { searchVideos, type WeaknessInput } from '@/lib/video-search';

type CacheState = {
  builtAt: number;
  index: VideoIndexEntry[];
};

declare global {
  // eslint-disable-next-line no-var
  var __mvpVideoIndexCache: CacheState | undefined;
}

function getEnvSources(): string[] {
  const raw = process.env.YOUTUBE_SOURCES ?? '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function getIndex(): Promise<VideoIndexEntry[]> {
  const apiKey = process.env.YOUTUBE_API_KEY ?? '';
  const sources = getEnvSources();

  if (!apiKey) {
    throw new Error('Missing env YOUTUBE_API_KEY');
  }
  if (sources.length === 0) {
    throw new Error('Missing env YOUTUBE_SOURCES (comma-separated playlist/video URLs)');
  }

  const cache = globalThis.__mvpVideoIndexCache;
  const now = Date.now();
  const ttlMs = 10 * 60 * 1000; // 10 minutes
  if (cache && now - cache.builtAt < ttlMs) return cache.index;

  const index = await buildVideoIndex({
    apiKey,
    sources,
    preferredTranscriptLangs: ['zh-TW', 'zh-Hant', 'zh', 'en'],
    maxPlaylistPages: 50,
  });

  globalThis.__mvpVideoIndexCache = { builtAt: now, index };
  return index;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { weakness: WeaknessInput; limit?: number };
    if (!body?.weakness?.concept_tag || !body?.weakness?.dimension || !body?.weakness?.mistake_type) {
      return NextResponse.json({ ok: false, error: 'Invalid weakness payload' }, { status: 400 });
    }

    const index = await getIndex();
    const results = searchVideos({ weakness: body.weakness, index, limit: body.limit ?? 5 });
    return NextResponse.json({ ok: true, results });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

