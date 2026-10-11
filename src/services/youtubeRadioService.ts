import { parseYouTubeVideoId } from '../lib/roomUtils';
import { parseTrackAndArtist, normalizeStr } from '../lib/lastfm';

export interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
}

const YOUTUBE_API_KEYS = [
  'AIzaSyC6-O6GoBgsvfGoRb9bsGNSVTeplQfnwEM',
  'AIzaSyDW4y5U6aCkLcLxGAKU7bGqaWH8Ppe8ng4'
];

/**
 * Decode HTML entities like &amp;, &#39;, etc.
 */
function decodeHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

/**
 * Fetch video metadata via free, zero-config oEmbed endpoint
 */
export async function fetchVideoDetails(urlOrId: string): Promise<VideoItem | null> {
  const videoId = parseYouTubeVideoId(urlOrId) || (urlOrId.length === 11 ? urlOrId : null);
  if (!videoId) return null;

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(oembedUrl);
    if (res.ok) {
      const data = await res.json();
      return {
        id: videoId,
        title: decodeHtml(data.title || 'YouTube Video'),
        thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        channelTitle: decodeHtml(data.author_name || 'YouTube Channel')
      };
    }
  } catch (err) {
    console.warn('[YouTubeRadio] oEmbed fetch failed, using fallback:', err);
  }

  return {
    id: videoId,
    title: 'YouTube Video',
    thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    channelTitle: 'YouTube'
  };
}

/**
 * Search YouTube API with automatic key failover
 */
export async function searchYouTube(query: string, maxResults: number = 8): Promise<VideoItem[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  for (const apiKey of YOUTUBE_API_KEYS) {
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(cleanQuery)}&type=video&key=${apiKey}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (data.items && Array.isArray(data.items)) {
        return data.items
          .filter((item: any) => item.id && item.id.videoId)
          .map((item: any) => ({
            id: item.id.videoId,
            title: decodeHtml(item.snippet.title),
            thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || `https://img.youtube.com/vi/${item.id.videoId}/hqdefault.jpg`,
            channelTitle: decodeHtml(item.snippet.channelTitle)
          }));
      }
    } catch (err) {
      console.warn('[YouTubeRadio] Key failed, trying next key:', err);
    }
  }

  return [];
}

/**
 * Intelligently generate Auto Playlist (Radio Mix) that directly corresponds to the currently playing song!
 * 1. Analyzes artist and track name
 * 2. Finds other top tracks by the same artist
 * 3. Finds songs with similar style/vibe/recommendations
 * 4. Deduplicates against played history and current song
 */
export async function fetchAutoPlaylistForTrack(
  currentVideo: VideoItem,
  excludedIds: string[] = []
): Promise<VideoItem[]> {
  const { artist, track } = parseTrackAndArtist(currentVideo.title, currentVideo.channelTitle);
  const excludedSet = new Set<string>([currentVideo.id, ...excludedIds]);
  const results: VideoItem[] = [];
  const addedIds = new Set<string>();

  const isAlreadyAdded = (id: string, title: string) => {
    if (excludedSet.has(id) || addedIds.has(id)) return true;
    const titleNorm = normalizeStr(title);
    const currNorm = normalizeStr(currentVideo.title);
    if (titleNorm === currNorm) return true;
    return false;
  };

  const queriesToRun: string[] = [];

  // Query 1: Top tracks / other hits by the same artist
  if (artist && artist.length > 1) {
    queriesToRun.push(`${artist} lagu populer`);
    queriesToRun.push(`${artist} playlist lagu terbaik`);
  }

  // Query 2: Similar / radio mix based on song title
  if (track && track.length > 2) {
    if (artist) {
      queriesToRun.push(`${artist} ${track} lagu sejenis serupa`);
    } else {
      queriesToRun.push(`${track} lagu serupa mix`);
    }
  }

  // Query 3: Keyword/vibe fallback
  if (currentVideo.channelTitle && currentVideo.channelTitle !== artist) {
    queriesToRun.push(`${currentVideo.channelTitle} popular tracks`);
  }

  // Execute queries in order until we have enough recommendations
  for (const q of queriesToRun) {
    if (results.length >= 10) break;
    try {
      const items = await searchYouTube(q, 6);
      for (const item of items) {
        if (!isAlreadyAdded(item.id, item.title)) {
          addedIds.add(item.id);
          results.push(item);
        }
      }
    } catch (err) {
      console.warn('[YouTubeRadio] Search query failed:', q, err);
    }
  }

  // If still fewer than 5 tracks, run a broader similar search
  if (results.length < 5) {
    const broadQuery = artist ? `${artist} album full` : `${currentVideo.title} mix`;
    const fallbackItems = await searchYouTube(broadQuery, 8);
    for (const item of fallbackItems) {
      if (!isAlreadyAdded(item.id, item.title)) {
        addedIds.add(item.id);
        results.push(item);
      }
    }
  }

  return results;
}

/**
 * Curated Starter Tracks (Lagu Pembuka Terpopuler)
 * Memberikan inspirasi awal untuk pengguna. Begitu salah satu diklik, Auto-Playlist otomatis menyesuaikan lagu tersebut!
 */
export interface StarterCategory {
  id: string;
  name: string;
  icon: string;
  tracks: VideoItem[];
}

export const STARTER_CATEGORIES: StarterCategory[] = [
  {
    id: 'pop_indo',
    name: 'Pop Hits Indo',
    icon: '🇮🇩',
    tracks: [
      { id: 'jfKfPfyJRdk', title: 'TULUS - Hati-Hati di Jalan', thumbnail: 'https://img.youtube.com/vi/aL3N8p_K7gQ/hqdefault.jpg', channelTitle: 'Tulus' },
      { id: 'mSgN3iE2Kyo', title: 'Nadhif Basalamah - Penjaga Hati', thumbnail: 'https://img.youtube.com/vi/mSgN3iE2Kyo/hqdefault.jpg', channelTitle: 'Nadhif Basalamah' },
      { id: 'u0Z9D3GzBqk', title: 'Sal Priadi - Gala Bunga Matahari', thumbnail: 'https://img.youtube.com/vi/u0Z9D3GzBqk/hqdefault.jpg', channelTitle: 'Sal Priadi' },
      { id: 's2LqjN42HnI', title: 'Mahalini - Sial', thumbnail: 'https://img.youtube.com/vi/s2LqjN42HnI/hqdefault.jpg', channelTitle: 'Mahalini' }
    ]
  },
  {
    id: 'akustik_chill',
    name: 'Akustik & Indie',
    icon: '🎸',
    tracks: [
      { id: 'Gj3K084o3fQ', title: 'Sheila On 7 - Dan (Akustik Santai)', thumbnail: 'https://img.youtube.com/vi/Gj3K084o3fQ/hqdefault.jpg', channelTitle: 'Akustik Chill' },
      { id: 'Yk0W-WcQf9o', title: 'Fourtwnty - Zona Nyaman', thumbnail: 'https://img.youtube.com/vi/Yk0W-WcQf9o/hqdefault.jpg', channelTitle: 'Fourtwnty Music' },
      { id: 'oGkK8LqX6_w', title: 'Feast - Peradaban (Akustik)', thumbnail: 'https://img.youtube.com/vi/oGkK8LqX6_w/hqdefault.jpg', channelTitle: 'Indie Vibes' }
    ]
  },
  {
    id: 'murottal',
    name: 'Murottal Al-Qur\'an',
    icon: '📖',
    tracks: [
      { id: 'zR_qFmD67tE', title: 'Mishary Rashid Alafasy • Surat Ar-Rahman', thumbnail: 'https://img.youtube.com/vi/zR_qFmD67tE/hqdefault.jpg', channelTitle: 'Mishary Alafasy' },
      { id: 'Y06_FvX81G4', title: 'Surat Al-Kahfi Merdu Penenang Hati', thumbnail: 'https://img.youtube.com/vi/Y06_FvX81G4/hqdefault.jpg', channelTitle: 'Tadabbur Quran' },
      { id: '2j42N3_1p_Y', title: 'Surat Al-Mulk Merdu Sebelum Tidur', thumbnail: 'https://img.youtube.com/vi/2j42N3_1p_Y/hqdefault.jpg', channelTitle: 'Al-Quran Merdu' }
    ]
  },
  {
    id: 'lofi_study',
    name: 'Lo-Fi & Fokus',
    icon: '☕',
    tracks: [
      { id: 'jfKfPfyJRdk', title: 'Lofi Girl - beats to relax/study to', thumbnail: 'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg', channelTitle: 'Lofi Girl' },
      { id: '5qap5aO4i9A', title: 'Lofi Girl - beats to sleep/chill to', thumbnail: 'https://img.youtube.com/vi/5qap5aO4i9A/hqdefault.jpg', channelTitle: 'Lofi Girl' },
      { id: 'DWcJFNfaw9c', title: 'Peaceful Study Beats • Lo-Fi Chill', thumbnail: 'https://img.youtube.com/vi/DWcJFNfaw9c/hqdefault.jpg', channelTitle: 'ChillHop Music' }
    ]
  },
  {
    id: 'piano_klasik',
    name: 'Piano & Belajar',
    icon: '🎹',
    tracks: [
      { id: '77ZozI0rw7w', title: 'Classical Music for Studying & Focus', thumbnail: 'https://img.youtube.com/vi/77ZozI0rw7w/hqdefault.jpg', channelTitle: 'HALIDONMUSIC' },
      { id: 'tfbC_Kz7c1E', title: 'Studio Ghibli Relaxing Piano Collection', thumbnail: 'https://img.youtube.com/vi/tfbC_Kz7c1E/hqdefault.jpg', channelTitle: 'Piano Peace' }
    ]
  }
];
