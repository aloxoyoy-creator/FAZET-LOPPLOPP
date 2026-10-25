import { useState, useEffect } from 'react';
import { fetchVideoTitle } from '@/lib/youtube';
import { parseTrackAndArtist } from '@/lib/trackParser';

interface RoomPlaybackLike {
  videoUrl?: string;
  videoTitle?: string;
}

export const useCurrentMediaMeta = (playback?: RoomPlaybackLike | null) => {
  const currentVideoUrl = playback?.videoUrl || '';
  const playbackTitle = playback?.videoTitle || '';

  const [fetchedTitle, setFetchedTitle] = useState<string>('');
  const [fetchedAuthor, setFetchedAuthor] = useState<string>('');

  useEffect(() => {
    if (!currentVideoUrl) {
      setFetchedTitle('');
      setFetchedAuthor('');
      return;
    }

    let cancelled = false;
    fetchVideoTitle(currentVideoUrl).then((meta) => {
      if (cancelled) return;
      if (meta?.title) setFetchedTitle(meta.title);
      if (meta?.author) setFetchedAuthor(meta.author);
    });

    return () => {
      cancelled = true;
    };
  }, [currentVideoUrl]);

  const rawTitle = playbackTitle || fetchedTitle;
  const parsedMeta = parseTrackAndArtist(rawTitle, fetchedAuthor);
  const currentVideoTitle = parsedMeta.track || rawTitle;
  const currentVideoArtist = parsedMeta.artist || fetchedAuthor;

  return {
    currentVideoUrl,
    currentVideoTitle,
    currentVideoArtist,
  };
};
