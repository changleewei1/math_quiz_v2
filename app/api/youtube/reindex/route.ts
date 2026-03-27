import { NextResponse } from 'next/server';
import { buildVideoIndex, type VideoIndexEntry } from '@/lib/video-index';

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

export async function POST() {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY ?? '';
    const sources = getEnvSources();
    if (!apiKey) throw new Error('Missing env YOUTUBE_API_KEY');
    if (sources.length === 0) throw new Error('Missing env YOUTUBE_SOURCES (comma-separated playlist/video URLs)');

    const index = await buildVideoIndex({
      apiKey,
      sources,
      preferredTranscriptLangs: ['zh-TW', 'zh-Hant', 'zh', 'en'],
      maxPlaylistPages: 50,
    });

    globalThis.__mvpVideoIndexCache = { builtAt: Date.now(), index };
    return NextResponse.json({ ok: true, count: index.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

