import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Volume1,
  VolumeX,
  Maximize2,
  Minimize2,
  Loader2,
} from 'lucide-react';
import { Button } from '@schoolhub/ui';
import { useTranslation } from '@/context/LanguageContext';

interface MediaBoxOverlayControlsProps {
  currentVideoUrl: string;
  currentVideoTitle: string;
  currentVideoArtist?: string;
  isPlaying: boolean;
  isLocked: boolean;
  muted: boolean;
  volume: number;
  isFullscreen: boolean;
  canGoPrevious: boolean;
  controlsVisible: boolean;
  onTogglePlayPause: () => void;
  onPlayPrevious: () => Promise<boolean>;
  onSkipNext: () => Promise<any>;
  onToggleMute: () => void;
  onVolumeChange: (val: number) => void;
  onToggleFullscreen: () => void;
}

export const MediaBoxOverlayControls: React.FC<MediaBoxOverlayControlsProps> = ({
  currentVideoUrl,
  currentVideoTitle,
  currentVideoArtist,
  isPlaying,
  isLocked,
  muted,
  volume,
  isFullscreen,
  canGoPrevious,
  controlsVisible,
  onTogglePlayPause,
  onPlayPrevious,
  onSkipNext,
  onToggleMute,
  onVolumeChange,
  onToggleFullscreen,
}) => {
  const { t } = useTranslation();
  const [isSkipping, setIsSkipping] = useState(false);
  const [isGoingPrev, setIsGoingPrev] = useState(false);

  // Local slider state for smooth 60fps dragging + debounced sync
  const [localVolume, setLocalVolume] = useState<number>(volume);
  const [isDraggingVolume, setIsDraggingVolume] = useState<boolean>(false);
  const volumeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isDraggingVolume) {
      setLocalVolume(volume);
    }
  }, [volume, isDraggingVolume]);

  useEffect(() => {
    setIsSkipping(false);
    setIsGoingPrev(false);
  }, [currentVideoUrl]);

  const handleVolumeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setIsDraggingVolume(true);
    setLocalVolume(val);

    if (volumeDebounceRef.current) {
      clearTimeout(volumeDebounceRef.current);
    }
    volumeDebounceRef.current = setTimeout(() => {
      onVolumeChange(val);
      setIsDraggingVolume(false);
    }, 120);
  };

  const handlePreviousClick = async () => {
    if (isGoingPrev || isLocked || !canGoPrevious) return;
    setIsGoingPrev(true);
    const timeoutId = setTimeout(() => setIsGoingPrev(false), 6000);
    try {
      await onPlayPrevious();
    } finally {
      clearTimeout(timeoutId);
      setIsGoingPrev(false);
    }
  };

  const handleSkipClick = async () => {
    if (isSkipping || isLocked) return;
    setIsSkipping(true);
    const timeoutId = setTimeout(() => setIsSkipping(false), 8000);
    try {
      await onSkipNext();
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const getVolumeIcon = () => {
    if (muted || localVolume === 0) return <VolumeX className="w-5 h-5" />;
    if (localVolume < 50) return <Volume1 className="w-5 h-5" />;
    return <Volume2 className="w-5 h-5" />;
  };

  return (
    <div
      className={`absolute inset-0 z-20 transition-opacity duration-300 pointer-events-none flex flex-col justify-between p-4 bg-gradient-to-t from-black/80 via-black/20 to-black/70 ${
        controlsVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Top Bar: Now Playing Title & Artist */}
      <div className="flex items-start justify-between gap-2 w-full">
        <div
          className={`flex items-center gap-2.5 px-3.5 py-2 bg-slate-950/90 border border-slate-700/80 rounded-lg max-w-[90%] shadow-xl ${
            controlsVisible ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
              isPlaying ? 'bg-white animate-pulse' : 'bg-amber-400'
            }`}
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-sm font-bold text-slate-100 truncate">
              {currentVideoTitle || currentVideoUrl}
            </span>
            {currentVideoArtist && (
              <span className="text-[11px] font-medium text-slate-400 truncate">
                {currentVideoArtist}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Center Transport Cluster: Previous / Play-Pause / Next */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`self-center flex items-center gap-3 sm:gap-5 px-5 py-3 bg-slate-950/85 border border-slate-700/80 rounded-2xl shadow-2xl transition-transform duration-200 ${
          controlsVisible ? 'pointer-events-auto scale-100' : 'pointer-events-none scale-95'
        }`}
      >
        {/* Previous Button */}
        <Button
          variant="outline"
          chamfer="dual"
          onClick={handlePreviousClick}
          disabled={isLocked || isGoingPrev || !canGoPrevious}
          className="px-3.5 py-2.5 bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-white disabled:opacity-40 h-auto cursor-pointer"
          title={t('watchParty.previousBtn')}
        >
          {isGoingPrev ? (
            <Loader2 className="w-5 h-5 animate-spin text-white" />
          ) : (
            <SkipBack className="w-5 h-5 fill-current" />
          )}
        </Button>

        {/* Play / Pause Main Button */}
        <Button
          variant="cyber"
          chamfer="dual"
          onClick={onTogglePlayPause}
          disabled={isLocked}
          className="px-5 py-3.5 bg-white hover:bg-neutral-200 text-black font-black shadow-lg h-auto cursor-pointer"
          title={isPlaying ? t('watchParty.pauseBtn') : t('watchParty.playBtn')}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          )}
        </Button>

        {/* Next / Skip Button */}
        <Button
          variant="outline"
          chamfer="dual"
          onClick={handleSkipClick}
          disabled={isLocked || isSkipping}
          className="px-3.5 py-2.5 bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-white disabled:opacity-40 h-auto cursor-pointer flex items-center gap-1.5"
          title={t('watchParty.skipNextBtn')}
        >
          {isSkipping ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
                {t('watchParty.loadingBtn')}
              </span>
            </>
          ) : (
            <SkipForward className="w-5 h-5 fill-current" />
          )}
        </Button>
      </div>

      {/* Bottom Controls Row: Volume Slider HUD & Fullscreen Toggle */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-between gap-2 w-full"
      >
        {/* Tactical Volume Bar Pill */}
        <div
          className={`flex items-center gap-2.5 bg-slate-950/90 border border-slate-700/80 px-3 py-1.5 rounded-lg shadow-xl ${
            controlsVisible ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          <button
            type="button"
            onClick={onToggleMute}
            className="text-white hover:text-neutral-300 transition-colors cursor-pointer p-1"
            title={muted ? t('watchParty.unmuteBtn') : t('watchParty.muteBtn')}
          >
            {getVolumeIcon()}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={muted ? 0 : localVolume}
            onChange={handleVolumeSliderChange}
            disabled={isLocked}
            aria-label="TV Volume"
            className="w-24 sm:w-32 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white disabled:opacity-50"
          />
          <span className="font-mono text-xs font-bold text-slate-200 w-9 text-right select-none">
            {muted ? '0%' : `${localVolume}%`}
          </span>
        </div>

        {/* Fullscreen Button */}
        <div className={controlsVisible ? 'pointer-events-auto' : 'pointer-events-none'}>
          <Button
            variant="outline"
            chamfer="dual"
            onClick={onToggleFullscreen}
            className="p-2.5 bg-slate-950/90 hover:bg-slate-900 border-slate-700 text-white shadow-xl cursor-pointer h-auto"
            title={isFullscreen ? t('remote.exitFullscreen') : t('remote.fullscreenTv')}
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
