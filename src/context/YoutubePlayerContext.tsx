import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { 
  type VideoItem, 
  fetchAutoPlaylistForTrack, 
  fetchVideoDetails, 
  searchYouTube,
  STARTER_CATEGORIES
} from '../services/youtubeRadioService';

export { type VideoItem, STARTER_CATEGORIES } from '../services/youtubeRadioService';

interface YoutubePlayerContextType {
  activeVideo: VideoItem | null;
  autoPlaylist: VideoItem[]; // Antrean lagu sejenis / terkait yang akan diputar otomatis
  history: VideoItem[];
  isFloating: boolean;
  isMinimized: boolean;
  autoPlayEnabled: boolean; // Auto Playlist ON / OFF
  isLoadingAutoPlaylist: boolean;
  
  // Aksi Kontrol
  playVideo: (video: VideoItem, initialQueue?: VideoItem[]) => Promise<void>;
  playNext: () => void;
  playPrev: () => void;
  playFromAutoPlaylist: (index: number) => void;
  playFromUrlOrSearch: (queryOrUrl: string) => Promise<boolean>;
  setFloating: (floating: boolean) => void;
  setMinimized: (minimized: boolean) => void;
  setAutoPlayEnabled: (enabled: boolean) => void;
  closePlayer: () => void;

  // Backward-compatible properties
  playlist: VideoItem[];
  currentIndex: number;
  currentGenre: string;
  autoPlayNextGenre: boolean;
  selectGenre: (genreId: string) => void;
  setAutoPlayNextGenre: (autoPlay: boolean) => void;
}

const YoutubePlayerContext = createContext<YoutubePlayerContextType | null>(null);

export function YoutubePlayerProvider({ children }: { children: React.ReactNode }) {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [autoPlaylist, setAutoPlaylist] = useState<VideoItem[]>([]);
  const [history, setHistory] = useState<VideoItem[]>([]);
  const [isFloating, setIsFloating] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState<boolean>(true);
  const [isLoadingAutoPlaylist, setIsLoadingAutoPlaylist] = useState<boolean>(false);
  const [currentGenre, setCurrentGenre] = useState<string>('pop_indo');

  const historyIdsRef = useRef<string[]>([]);

  // Generate intelligent related playlist matching the active song
  const generatePlaylistForTrack = useCallback(async (video: VideoItem) => {
    setIsLoadingAutoPlaylist(true);
    try {
      const related = await fetchAutoPlaylistForTrack(video, historyIdsRef.current);
      if (related && related.length > 0) {
        setAutoPlaylist(related);
      }
    } catch (err) {
      console.warn('[YoutubePlayerContext] Failed to generate auto playlist:', err);
    } finally {
      setIsLoadingAutoPlaylist(false);
    }
  }, []);

  // Play a specific video and trigger auto-playlist generation for this track
  const playVideo = useCallback(async (video: VideoItem, initialQueue?: VideoItem[]) => {
    setActiveVideo(video);
    if (!historyIdsRef.current.includes(video.id)) {
      historyIdsRef.current.push(video.id);
      setHistory(prev => [video, ...prev.filter(v => v.id !== video.id)].slice(0, 30));
    }

    if (initialQueue && initialQueue.length > 0) {
      const filteredQueue = initialQueue.filter(v => v.id !== video.id);
      setAutoPlaylist(filteredQueue);
    } else {
      void generatePlaylistForTrack(video);
    }
  }, [generatePlaylistForTrack]);

  // Advance to the next song in the Auto-Playlist
  const playNext = useCallback(() => {
    if (autoPlaylist.length === 0) return;
    const nextSong = autoPlaylist[0];
    const remainingQueue = autoPlaylist.slice(1);
    
    setActiveVideo(nextSong);
    setAutoPlaylist(remainingQueue);

    if (!historyIdsRef.current.includes(nextSong.id)) {
      historyIdsRef.current.push(nextSong.id);
      setHistory(prev => [nextSong, ...prev.filter(v => v.id !== nextSong.id)].slice(0, 30));
    }

    // If queue is running low (< 3 tracks), fetch more related songs to keep radio going infinitely!
    if (remainingQueue.length < 3) {
      void fetchAutoPlaylistForTrack(nextSong, historyIdsRef.current).then(moreTracks => {
        if (moreTracks && moreTracks.length > 0) {
          setAutoPlaylist(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const fresh = moreTracks.filter(m => !existingIds.has(m.id));
            return [...prev, ...fresh];
          });
        }
      });
    }
  }, [autoPlaylist]);

  // Play previous song from history
  const playPrev = useCallback(() => {
    if (history.length <= 1) return;
    const prevSong = history[1]; // index 0 is current song
    if (prevSong) {
      setHistory(prev => prev.slice(1));
      setActiveVideo(prevSong);
      void generatePlaylistForTrack(prevSong);
    }
  }, [history, generatePlaylistForTrack]);

  // Jump to a specific song in the Auto-Playlist
  const playFromAutoPlaylist = useCallback((index: number) => {
    if (index < 0 || index >= autoPlaylist.length) return;
    const chosen = autoPlaylist[index];
    const newRemaining = autoPlaylist.filter((_, idx) => idx !== index);
    
    setActiveVideo(chosen);
    setAutoPlaylist(newRemaining);

    if (!historyIdsRef.current.includes(chosen.id)) {
      historyIdsRef.current.push(chosen.id);
      setHistory(prev => [chosen, ...prev.filter(v => v.id !== chosen.id)].slice(0, 30));
    }

    // Refresh recommendations if needed
    if (newRemaining.length < 3) {
      void generatePlaylistForTrack(chosen);
    }
  }, [autoPlaylist, generatePlaylistForTrack]);

  // Play from URL paste or search term
  const playFromUrlOrSearch = useCallback(async (queryOrUrl: string): Promise<boolean> => {
    const trimmed = queryOrUrl.trim();
    if (!trimmed) return false;

    // Check if it's a URL or video ID
    const directVideo = await fetchVideoDetails(trimmed);
    if (directVideo) {
      await playVideo(directVideo);
      return true;
    }

    // Search via YouTube API
    const results = await searchYouTube(trimmed, 5);
    if (results && results.length > 0) {
      const first = results[0];
      const rest = results.slice(1);
      await playVideo(first, rest);
      return true;
    }

    return false;
  }, [playVideo]);

  // Close player
  const closePlayer = useCallback(() => {
    setActiveVideo(null);
    setIsFloating(false);
    setIsMinimized(false);
  }, []);

  // Backward compatibility: selectGenre plays first track in category
  const selectGenre = useCallback((genreId: string) => {
    setCurrentGenre(genreId);
    const cat = STARTER_CATEGORIES.find(c => c.id === genreId);
    if (cat && cat.tracks.length > 0) {
      const first = cat.tracks[0];
      const others = cat.tracks.slice(1);
      void playVideo(first, others);
    }
  }, [playVideo]);

  // Listen to postMessage from YouTube IFrame for seamless auto-play next!
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        if (typeof event.data === 'string') {
          const data = JSON.parse(event.data);
          // YouTube postMessage event for video state change: 0 = ENDED
          if (data.event === 'onStateChange' && data.info === 0) {
            if (autoPlayEnabled) {
              playNext();
            }
          }
        }
      } catch {
        // Not a JSON message, ignore safely
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [autoPlayEnabled, playNext]);

  return (
    <YoutubePlayerContext.Provider
      value={{
        activeVideo,
        autoPlaylist,
        history,
        isFloating,
        isMinimized,
        autoPlayEnabled,
        isLoadingAutoPlaylist,
        playVideo,
        playNext,
        playPrev,
        playFromAutoPlaylist,
        playFromUrlOrSearch,
        setFloating: setIsFloating,
        setMinimized: setIsMinimized,
        setAutoPlayEnabled,
        closePlayer,

        // Backward compatibility bindings
        playlist: autoPlaylist,
        currentIndex: 0,
        currentGenre,
        autoPlayNextGenre: autoPlayEnabled,
        selectGenre,
        setAutoPlayNextGenre: setAutoPlayEnabled,
      }}
    >
      {children}
    </YoutubePlayerContext.Provider>
  );
}

export function useYoutubePlayer() {
  const context = useContext(YoutubePlayerContext);
  if (!context) {
    throw new Error('useYoutubePlayer must be used within a YoutubePlayerProvider');
  }
  return context;
}
