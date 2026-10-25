import { supabase } from './supabase';
export { parseYouTubeVideoId } from './roomUtils';
import { parseYouTubeVideoId } from './roomUtils';
import {
  loadKeys,
  pickKey,
  incrementUsage,
  markKeyExhausted,
  loadSearchConfig,
} from './apiKeyStore';

export interface SearchResultItem {
  id: string;
  videoId?: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  url: string;
}

export interface VideoInfo {
  title?: string;
  channelTitle?: string;
  author?: string;
  thumbnailUrl?: string;
}

// In-memory cache for YouTube oEmbed metadata with a 30-minute TTL
const OEMBED_CACHE_TTL_MS = 30 * 60 * 1000;
const oembedCache = new Map<
  string,
  { data: VideoInfo; expiresAt: number }
>();

/**
 * Resolves video title and metadata using YouTube's free, zero-config oEmbed API endpoint.
 * Cached in-memory for 30 minutes to eliminate redundant network fetches.
 */
export const fetchVideoTitle = async (
  videoUrlOrId: string
): Promise<VideoInfo> => {
  const videoId = parseYouTubeVideoId(videoUrlOrId) || videoUrlOrId;
  if (!videoId) return {};

  const fullUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const now = Date.now();
  const cached = oembedCache.get(fullUrl);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(fullUrl)}&format=json`
    );
    if (res.ok) {
      const data = await res.json();
      const result: VideoInfo = {
        title: data.title,
        channelTitle: data.author_name,
        author: data.author_name,
        thumbnailUrl: data.thumbnail_url,
      };
      oembedCache.set(fullUrl, { data: result, expiresAt: now + OEMBED_CACHE_TTL_MS });
      return result;
    }
    oembedCache.set(fullUrl, { data: {}, expiresAt: now + 60_000 });
  } catch (err) {
    console.warn('[YouTube Resolver] oEmbed title resolution failed:', err);
  }
  return {};
};

export class YouTubeQuotaExceededError extends Error {
  constructor(message = 'Daily YouTube API search quota exceeded') {
    super(message);
    this.name = 'YouTubeQuotaExceededError';
  }
}

export const decodeHtmlEntities = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
};

/**
 * Searches YouTube videos using the official YouTube Data API v3 endpoint with an explicit API key.
 * Used by the TV room host as mediator and local multi-key rotation.
 */
export const searchYouTubeWithKey = async (
  query: string,
  apiKey: string,
  maxResults: number = 25
): Promise<SearchResultItem[]> => {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const count = Math.max(1, Math.min(50, maxResults));
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=${count}&q=${encodeURIComponent(
    cleanQuery
  )}&key=${apiKey.trim()}`;

  const res = await fetch(searchUrl);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const reason = errData?.error?.errors?.[0]?.reason;
    if (res.status === 403 || res.status === 429 || reason === 'quotaExceeded' || reason === 'dailyLimitExceeded') {
      throw new YouTubeQuotaExceededError();
    }
    const msg =
      errData?.error?.message || `YouTube API returned status ${res.status}`;
    throw new Error(msg);
  }

  const data = await res.json();
  const results: SearchResultItem[] = (data.items || [])
    .map((item: any) => {
      const vid = item.id?.videoId || '';
      return {
        id: vid,
        videoId: vid,
        title: decodeHtmlEntities(item.snippet?.title || 'Untitled Video'),
        channelTitle: decodeHtmlEntities(
          item.snippet?.channelTitle || 'YouTube Channel'
        ),
        thumbnail:
          item.snippet?.thumbnails?.high?.url ||
          item.snippet?.thumbnails?.medium?.url ||
          item.snippet?.thumbnails?.default?.url ||
          '',
        url: `https://www.youtube.com/watch?v=${vid}`,
      };
    })
    .filter((item: SearchResultItem) => Boolean(item.id));

  return results;
};

/**
 * Searches YouTube videos using the OLD API Key rotation system first (apiKeyStore),
 * supporting key rotation and fallback to VITE_YOUTUBE_API_KEY and Supabase youtube-proxy.
 */
export const searchYouTubeVideos = async (
  query: string
): Promise<{
  results: SearchResultItem[];
  hasApiKey: boolean;
  error?: string;
}> => {
  const config = loadSearchConfig();
  const maxResults = config.maxResults || 25;
  const attemptedIds = new Set<string>();

  // 1. Prioritize local rotated API keys from apiKeyStore (the old API key system)
  while (true) {
    const activeKeys = loadKeys().filter(
      (k) => k.enabled && k.key.trim().length > 0 && !attemptedIds.has(k.id)
    );
    if (activeKeys.length === 0) break;

    const candidate = pickKey(config.strategy);
    const keyRecord =
      candidate && !attemptedIds.has(candidate.id) ? candidate : activeKeys[0];
    attemptedIds.add(keyRecord.id);

    try {
      const items = await searchYouTubeWithKey(query, keyRecord.key, maxResults);
      incrementUsage(keyRecord.id);
      return { results: items, hasApiKey: true };
    } catch (err: any) {
      if (err instanceof YouTubeQuotaExceededError) {
        markKeyExhausted(keyRecord.id);
        continue;
      }
      console.warn('[YouTube] Local API key search error, trying fallback:', err);
      break;
    }
  }

  // 2. Fallback to VITE_YOUTUBE_API_KEY env variable if present
  const envKey = (import.meta.env.VITE_YOUTUBE_API_KEY as string | undefined)?.trim();
  if (envKey) {
    try {
      const items = await searchYouTubeWithKey(query, envKey, maxResults);
      return { results: items, hasApiKey: true };
    } catch (err) {
      console.warn('[YouTube] Env key search fallback failed:', err);
    }
  }

  // 3. Fallback to Supabase Edge Function youtube-proxy
  try {
    const { data, error } = await supabase.functions.invoke('youtube-proxy', {
      body: { query, maxResults },
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    const results: SearchResultItem[] = (data.items || []).map((item: any) => {
      const vid = typeof item.id === 'string' ? item.id : item.id?.videoId || '';
      return {
        id: vid,
        videoId: vid,
        title: decodeHtmlEntities(item.snippet?.title || ''),
        channelTitle: item.snippet?.channelTitle || '',
        thumbnail:
          item.snippet?.thumbnails?.high?.url ||
          item.snippet?.thumbnails?.default?.url ||
          '',
        url: 'https://www.youtube.com/watch?v=' + vid,
      };
    });
    return { results, hasApiKey: true };
  } catch (err: any) {
    console.error('[youtube-proxy Error]:', err);
    return {
      results: [],
      hasApiKey: false,
      error:
        err.message ||
        'Gagal mencari video. Tambahkan API Key YouTube di Pengaturan TV Room.',
    };
  }
};
