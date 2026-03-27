export type YouTubeSource =
  | { type: 'playlist'; url: string; playlistId: string }
  | { type: 'video'; url: string; videoId: string };

export interface YouTubeVideoInfo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string | null;
}

export type TranscriptFetchMethod = 'timedtext' | 'none';

export interface TranscriptResult {
  ok: boolean;
  method: TranscriptFetchMethod;
  transcript: string | null;
  language: string | null;
  note?: string;
}

function stripHash(url: string): string {
  const idx = url.indexOf('#');
  return idx >= 0 ? url.slice(0, idx) : url;
}

function safeUrl(input: string): URL | null {
  try {
    const normalized = input.trim();
    if (!normalized) return null;
    return new URL(stripHash(normalized));
  } catch {
    return null;
  }
}

/**
 * 從常見 YouTube 網址解析 videoId（純字串、不需呼叫外部 API）。
 * 支援：watch?v=、youtu.be/、/embed/、/shorts/
 */
export function getYoutubeVideoId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const u = safeUrl(trimmed);
  if (!u) return null;

  const host = u.hostname.replace(/^www\./, '');

  if (host === 'youtu.be') {
    const id = u.pathname.replace(/^\//, '').split('/')[0]?.trim();
    return id || null;
  }

  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
    if (u.pathname === '/watch' || u.pathname === '/watch/') {
      const v = u.searchParams.get('v')?.trim();
      if (v) return v;
    }
    if (u.pathname.startsWith('/embed/')) {
      const id = u.pathname.slice('/embed/'.length).split('/')[0]?.trim();
      return id || null;
    }
    if (u.pathname.startsWith('/shorts/')) {
      const id = u.pathname.slice('/shorts/'.length).split('/')[0]?.trim();
      return id || null;
    }
  }

  return null;
}

/** 回傳 YouTube 官方 CDN 縮圖（hqdefault）；無法解析時回傳空字串。 */
export function getYoutubeThumbnail(url: string): string {
  const id = getYoutubeVideoId(url);
  if (!id) return '';
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export function parseYouTubeSource(inputUrl: string): YouTubeSource | null {
  const u = safeUrl(inputUrl);
  if (!u) return null;

  const host = u.hostname.replace(/^www\./, '');
  const isYouTube = host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be';
  if (!isYouTube) return null;

  // Playlist: https://www.youtube.com/playlist?list=PL...
  const playlistId = u.searchParams.get('list');
  if (playlistId && (u.pathname === '/playlist' || u.pathname === '/watch')) {
    return { type: 'playlist', url: inputUrl, playlistId };
  }

  // Video: https://youtu.be/<id> or https://www.youtube.com/watch?v=<id> or /embed/
  let videoId: string | null = null;
  if (host === 'youtu.be') {
    const maybe = u.pathname.replace(/^\//, '').trim();
    if (maybe) videoId = maybe.split('/')[0] ?? null;
  } else if (u.pathname === '/watch' || u.pathname === '/watch/') {
    videoId = u.searchParams.get('v');
  } else if (u.pathname.startsWith('/embed/')) {
    videoId = u.pathname.slice('/embed/'.length).split('/')[0] ?? null;
  }
  if (videoId) return { type: 'video', url: inputUrl, videoId };

  return null;
}

function pickBestThumbnail(thumbnails: unknown): string | null {
  if (!thumbnails || typeof thumbnails !== 'object') return null;
  const t = thumbnails as Record<string, { url?: string; width?: number; height?: number }>;
  const candidates = [t.maxres, t.standard, t.high, t.medium, t.default].filter(Boolean);
  const first = candidates.find((c) => typeof c?.url === 'string')?.url;
  return first ?? null;
}

async function ytGet<T>(path: string, params: Record<string, string>, apiKey: string): Promise<T> {
  const u = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  u.searchParams.set('key', apiKey);

  const res = await fetch(u.toString(), {
    method: 'GET',
    // server-side caching hint; route can override with revalidate as needed
    headers: { accept: 'application/json' },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`YouTube API error ${res.status} ${res.statusText}: ${text.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

export async function fetchPlaylistVideoIds(args: {
  playlistId: string;
  apiKey: string;
  maxPages?: number;
}): Promise<string[]> {
  const { playlistId, apiKey } = args;
  const maxPages = args.maxPages ?? 50; // ~2500 items (50/page)

  const ids: string[] = [];
  let pageToken: string | undefined;

  for (let page = 0; page < maxPages; page += 1) {
    type PlaylistItemsResponse = {
      nextPageToken?: string;
      items?: Array<{
        contentDetails?: { videoId?: string };
      }>;
    };

    const json = await ytGet<PlaylistItemsResponse>(
      'playlistItems',
      {
        part: 'contentDetails',
        playlistId,
        maxResults: '50',
        ...(pageToken ? { pageToken } : {}),
      },
      apiKey
    );

    const pageIds =
      json.items
        ?.map((it) => it.contentDetails?.videoId)
        .filter((v): v is string => typeof v === 'string' && v.length > 0) ?? [];

    ids.push(...pageIds);
    pageToken = json.nextPageToken;
    if (!pageToken) break;
  }

  return Array.from(new Set(ids));
}

export async function fetchVideosInfo(args: {
  videoIds: string[];
  apiKey: string;
}): Promise<YouTubeVideoInfo[]> {
  const { videoIds, apiKey } = args;
  const unique = Array.from(new Set(videoIds.filter(Boolean)));
  if (unique.length === 0) return [];

  // videos.list supports up to 50 ids
  const out: YouTubeVideoInfo[] = [];
  for (let i = 0; i < unique.length; i += 50) {
    const chunk = unique.slice(i, i + 50);

    type VideosResponse = {
      items?: Array<{
        id?: string;
        snippet?: {
          title?: string;
          description?: string;
          thumbnails?: unknown;
        };
      }>;
    };

    const json = await ytGet<VideosResponse>(
      'videos',
      {
        part: 'snippet',
        id: chunk.join(','),
        maxResults: '50',
      },
      apiKey
    );

    for (const item of json.items ?? []) {
      const id = item.id ?? '';
      if (!id) continue;
      const snip = item.snippet ?? {};
      out.push({
        videoId: id,
        title: snip.title ?? '',
        description: snip.description ?? '',
        thumbnail: pickBestThumbnail(snip.thumbnails),
      });
    }
  }

  return out;
}

function decodeXmlEntities(input: string): string {
  return input
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&#039;', "'");
}

function parseTimedTextXmlToPlainText(xml: string): string {
  // timedtext is simple: <text start="..." dur="...">...</text>
  const parts: string[] = [];
  const re = /<text\b[^>]*>([\s\S]*?)<\/text>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    const raw = m[1] ?? '';
    const normalized = decodeXmlEntities(raw)
      .replaceAll(/<[^>]+>/g, '')
      .replaceAll('\n', ' ')
      .replaceAll(/[\u00A0\s]+/g, ' ')
      .trim();
    if (normalized) parts.push(normalized);
  }
  return parts.join(' ');
}

async function fetchTimedTextXml(args: { videoId: string; lang: string }): Promise<string | null> {
  const u = new URL('https://www.youtube.com/api/timedtext');
  u.searchParams.set('v', args.videoId);
  u.searchParams.set('lang', args.lang);
  // fmt=vtt doesn't always work; xml is easiest to parse
  const res = await fetch(u.toString(), { method: 'GET', headers: { accept: 'text/xml' } });
  if (!res.ok) return null;
  const text = await res.text();
  if (!text || !text.includes('<text')) return null;
  return text;
}

/**
 * 取得字幕（transcript）：
 * - YouTube Data API v3 不提供「字幕內容」的公開免 OAuth 讀取能力。
 * - 這裡提供一個不需帳密的 fallback：嘗試抓公開 timedtext。
 * - 若影片未提供公開字幕，回傳 ok=false + transcript=null。
 */
export async function fetchYouTubeTranscript(args: {
  videoId: string;
  preferredLangs?: string[];
}): Promise<TranscriptResult> {
  const preferredLangs = args.preferredLangs ?? ['zh-TW', 'zh-Hant', 'zh', 'en'];

  for (const lang of preferredLangs) {
    const xml = await fetchTimedTextXml({ videoId: args.videoId, lang });
    if (!xml) continue;
    const transcript = parseTimedTextXmlToPlainText(xml);
    if (!transcript) continue;
    return { ok: true, method: 'timedtext', transcript, language: lang };
  }

  return {
    ok: false,
    method: 'none',
    transcript: null,
    language: null,
    note: '此影片可能未提供公開字幕，或字幕需登入/授權才能存取。',
  };
}

