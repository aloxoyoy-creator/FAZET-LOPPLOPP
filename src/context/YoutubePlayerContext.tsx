import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
}

export interface GenreOption {
  id: string;
  label: string;
  icon: string;
  description: string;
  videos: VideoItem[];
}

export const GENRE_PLAYLISTS: GenreOption[] = [
  {
    id: 'lofi',
    label: 'Lo-Fi Study',
    icon: '☕',
    description: 'Beats santai pengiring konsentrasi belajar',
    videos: [
      { id: 'jfKfPfyJRdk', title: 'Lofi Girl - beats to relax/study to', thumbnail: 'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg', channelTitle: 'Lofi Girl' },
      { id: '5qap5aO4i9A', title: 'Lofi Girl - beats to sleep/chill to', thumbnail: 'https://img.youtube.com/vi/5qap5aO4i9A/hqdefault.jpg', channelTitle: 'Lofi Girl' },
      { id: 'DWcJFNfaw9c', title: 'Peaceful Study Beats • Lo-Fi Chill', thumbnail: 'https://img.youtube.com/vi/DWcJFNfaw9c/hqdefault.jpg', channelTitle: 'ChillHop Music' },
      { id: 'MCkTebktHVc', title: 'Late Night Study • Lofi Hip Hop Beats', thumbnail: 'https://img.youtube.com/vi/MCkTebktHVc/hqdefault.jpg', channelTitle: 'Coffee Beats' },
      { id: 'S_MOd40zlsk', title: 'Cozy Coffee Shop Ambience & Lofi Music', thumbnail: 'https://img.youtube.com/vi/S_MOd40zlsk/hqdefault.jpg', channelTitle: 'Lofi Room' }
    ]
  },
  {
    id: 'murottal',
    label: 'Murottal Al-Qur\'an',
    icon: '📖',
    description: 'Ayat suci merdu penyejuk hati & jiwa',
    videos: [
      { id: 'zR_qFmD67tE', title: 'Mishary Rashid Alafasy • Murottal Merdu', thumbnail: 'https://img.youtube.com/vi/zR_qFmD67tE/hqdefault.jpg', channelTitle: 'Al-Quran Merdu' },
      { id: 'Y06_FvX81G4', title: 'Surat Al-Kahfi, Ar-Rahman, Al-Waqiah, Al-Mulk', thumbnail: 'https://img.youtube.com/vi/Y06_FvX81G4/hqdefault.jpg', channelTitle: 'Murottal Penyejuk' },
      { id: '2j42N3_1p_Y', title: 'Ayat Suci Al-Qur\'an Penenang Hati & Pikiran', thumbnail: 'https://img.youtube.com/vi/2j42N3_1p_Y/hqdefault.jpg', channelTitle: 'Tadabbur Quran' },
      { id: 'E7U-G2iP1tA', title: 'Murottal Merdu Juz 30 Full', thumbnail: 'https://img.youtube.com/vi/E7U-G2iP1tA/hqdefault.jpg', channelTitle: 'Quran Nusantara' }
    ]
  },
  {
    id: 'classical',
    label: 'Piano & Klasik',
    icon: '🎹',
    description: 'Melodi piano & klasik pengasah daya ingat',
    videos: [
      { id: '77ZozI0rw7w', title: 'Classical Music for Studying & Concentration', thumbnail: 'https://img.youtube.com/vi/77ZozI0rw7w/hqdefault.jpg', channelTitle: 'HALIDONMUSIC' },
      { id: 'tfbC_Kz7c1E', title: 'Studio Ghibli Relaxing Piano Collection', thumbnail: 'https://img.youtube.com/vi/tfbC_Kz7c1E/hqdefault.jpg', channelTitle: 'Piano Peace' },
      { id: '4xDzrJKXOOY', title: 'Peaceful Piano Study Music for Brain Power', thumbnail: 'https://img.youtube.com/vi/4xDzrJKXOOY/hqdefault.jpg', channelTitle: 'Calm Piano' },
      { id: 'lCOF9LN_Zxs', title: 'Mozart Effect Study Aid for Memory', thumbnail: 'https://img.youtube.com/vi/lCOF9LN_Zxs/hqdefault.jpg', channelTitle: 'Focus Sounds' }
    ]
  },
  {
    id: 'nature',
    label: 'Hujan & Alam',
    icon: '🌧️',
    description: 'Suara rintik hujan dan alam relaksasi',
    videos: [
      { id: 'mPZkdNFkNps', title: 'Gentle Rain Sounds for Studying & Sleeping', thumbnail: 'https://img.youtube.com/vi/mPZkdNFkNps/hqdefault.jpg', channelTitle: 'Rain Sounds' },
      { id: 'co7KgV24vBQ', title: 'Cozy Rain & Thunder in Cabin with Fireplace', thumbnail: 'https://img.youtube.com/vi/co7KgV24vBQ/hqdefault.jpg', channelTitle: 'Ambience Room' },
      { id: 'eKFTSSKCzWA', title: 'Forest Stream & Birds Singing Ambience', thumbnail: 'https://img.youtube.com/vi/eKFTSSKCzWA/hqdefault.jpg', channelTitle: 'Nature Therapy' }
    ]
  },
  {
    id: 'indie',
    label: 'Akustik Chill',
    icon: '🎵',
    description: 'Lagu akustik santai teman belajar',
    videos: [
      { id: 'Gj3K084o3fQ', title: 'Lagu Akustik Pop Indonesia Teman Belajar & Santai', thumbnail: 'https://img.youtube.com/vi/Gj3K084o3fQ/hqdefault.jpg', channelTitle: 'Acoustic Indonesia' },
      { id: 'Yk0W-WcQf9o', title: 'Playlist Indie Indonesia Chill & Syahdu', thumbnail: 'https://img.youtube.com/vi/Yk0W-WcQf9o/hqdefault.jpg', channelTitle: 'Indie Vibes' }
    ]
  },
  {
    id: 'focus',
    label: 'Deep Focus',
    icon: '⚡',
    description: 'Gelombang alfa (Alpha Waves) fokus maksimal',
    videos: [
      { id: 'WPni755-Krg', title: '432 Hz Deep Concentration Alpha Brain Waves', thumbnail: 'https://img.youtube.com/vi/WPni755-Krg/hqdefault.jpg', channelTitle: 'Brainwave Hub' },
      { id: '1ka_z_2U6qE', title: 'Study Music Alpha Waves for Super Focus', thumbnail: 'https://img.youtube.com/vi/1ka_z_2U6qE/hqdefault.jpg', channelTitle: 'Mind Power' }
    ]
  }
];

interface YoutubePlayerContextType {
  activeVideo: VideoItem | null;
  playlist: VideoItem[];
  currentIndex: number;
  currentGenre: string;
  isFloating: boolean;
  isMinimized: boolean;
  autoPlayNextGenre: boolean;
  playVideo: (video: VideoItem, playlist?: VideoItem[], genreId?: string) => void;
  playNext: () => void;
  playPrev: () => void;
  selectGenre: (genreId: string) => void;
  setFloating: (floating: boolean) => void;
  setMinimized: (minimized: boolean) => void;
  setAutoPlayNextGenre: (autoPlay: boolean) => void;
  closePlayer: () => void;
}

const YoutubePlayerContext = createContext<YoutubePlayerContextType | null>(null);

export function YoutubePlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentGenre, setCurrentGenre] = useState<string>('lofi');
  const [playlist, setPlaylist] = useState<VideoItem[]>(() => GENRE_PLAYLISTS[0].videos);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [isFloating, setIsFloating] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [autoPlayNextGenre, setAutoPlayNextGenre] = useState<boolean>(true);

  // Play a specific video
  const playVideo = (video: VideoItem, customPlaylist?: VideoItem[], genreId?: string) => {
    setActiveVideo(video);
    if (customPlaylist && customPlaylist.length > 0) {
      setPlaylist(customPlaylist);
      const idx = customPlaylist.findIndex((v) => v.id === video.id);
      setCurrentIndex(idx >= 0 ? idx : 0);
    } else {
      const idx = playlist.findIndex((v) => v.id === video.id);
      if (idx >= 0) {
        setCurrentIndex(idx);
      }
    }
    if (genreId) {
      setCurrentGenre(genreId);
    }
  };

  // Play next video in the playlist
  const playNext = () => {
    if (!playlist || playlist.length === 0) return;
    const nextIdx = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIdx);
    setActiveVideo(playlist[nextIdx]);
  };

  // Play previous video
  const playPrev = () => {
    if (!playlist || playlist.length === 0) return;
    const prevIdx = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentIndex(prevIdx);
    setActiveVideo(playlist[prevIdx]);
  };

  // Select a genre and load its playlist
  const selectGenre = (genreId: string) => {
    const found = GENRE_PLAYLISTS.find((g) => g.id === genreId);
    if (found && found.videos.length > 0) {
      setCurrentGenre(genreId);
      setPlaylist(found.videos);
      setCurrentIndex(0);
      setActiveVideo(found.videos[0]);
    }
  };

  // Close player
  const closePlayer = () => {
    setActiveVideo(null);
    setIsFloating(false);
    setIsMinimized(false);
  };

  // Listen to postMessage from YouTube IFrame for auto-play next!
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        if (typeof event.data === 'string') {
          const data = JSON.parse(event.data);
          // YouTube postMessage event for video state change: 0 = ENDED
          if (data.event === 'onStateChange' && data.info === 0) {
            if (autoPlayNextGenre) {
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
  }, [autoPlayNextGenre, currentIndex, playlist]);

  return (
    <YoutubePlayerContext.Provider
      value={{
        activeVideo,
        playlist,
        currentIndex,
        currentGenre,
        isFloating,
        isMinimized,
        autoPlayNextGenre,
        playVideo,
        playNext,
        playPrev,
        selectGenre,
        setFloating: setIsFloating,
        setMinimized: setIsMinimized,
        setAutoPlayNextGenre,
        closePlayer,
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
