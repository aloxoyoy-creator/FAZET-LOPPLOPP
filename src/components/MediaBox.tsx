import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { useWatchParty } from '@/context/WatchPartyContext';
import { useTranslation } from '@/context/LanguageContext';
import { Card } from '@schoolhub/ui';
import { Tv, Lock } from 'lucide-react';
import { TimeBoxScheduleItem as ScheduleItem } from '@/hooks/useTimeBoxSchedule';
import { IdleScheduleTimeline } from '@/components/IdleScheduleTimeline';
import { useCurrentMediaMeta } from '@/hooks/useCurrentMediaMeta';
import { MediaBoxOverlayControls } from '@/components/mediabox/MediaBoxOverlayControls';
import { MediaBoxQrModal } from '@/components/mediabox/MediaBoxQrModal';

const YouTubePlayer = lazy(() => import('@/components/YouTubePlayer'));

interface MediaBoxProps {
  upcomingItems?: ScheduleItem[];
}

export const MediaBox: React.FC<MediaBoxProps> = ({ upcomingItems = [] }) => {
  const { t } = useTranslation();
  const {
    roomCode,
    roomState,
    showQrModal,
    setShowQrModal,
    muted,
    setMuted,
    copiedLink,
    remoteUrl,
    handlePlayNextInQueue,
    handlePlayPreviousTrack,
    canGoPrevious,
    handleTogglePlayPause,
    handleToggleFullscreen,
    handleAdjustVolume,
    copyRemoteLink,
    registerPlayerInstance,
  } = useWatchParty();

  const currentVideoUrl = roomState?.currentlyPlaying || '';
  const currentTitle = roomState?.currentlyPlayingTitle || '';
  const isPlaying = roomState?.playback?.status === 'playing';
  const volume = roomState?.playback?.volume ?? 80;
  const isLocked = Boolean(roomState?.isLocked);
  const isFullscreen = Boolean(roomState?.isFullscreen);

  const { currentVideoTitle, currentVideoArtist } = useCurrentMediaMeta(
    currentVideoUrl
      ? { videoUrl: currentVideoUrl, videoTitle: currentTitle }
      : null
  );

  // Auto-hide controls & mouse cursor after 5 seconds of inactivity over video
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetHideTimer = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 5000);
  }, []);

  useEffect(() => {
    if (currentVideoUrl) {
      resetHideTimer();
    } else {
      setControlsVisible(true);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    }
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [currentVideoUrl, resetHideTimer]);

  const handleContainerClick = () => {
    if (!currentVideoUrl || isLocked) return;
    resetHideTimer();
    handleTogglePlayPause();
  };

  return (
    <Card
      onMouseMove={currentVideoUrl ? resetHideTimer : undefined}
      onMouseEnter={currentVideoUrl ? resetHideTimer : undefined}
      onClick={handleContainerClick}
      className={`w-full h-full flex flex-col justify-center items-center p-2 transition-colors duration-300 text-center overflow-hidden relative group shadow-xl select-none ${
        currentVideoUrl && !controlsVisible ? 'cursor-none' : currentVideoUrl ? 'cursor-pointer' : ''
      }`}
    >
      {/* Active YouTube Video Player or Idle Placeholder */}
      {currentVideoUrl ? (
        <div className="relative w-full h-full overflow-hidden rounded-lg">
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center bg-black text-slate-500 text-xs font-mono">
                Loading Player...
              </div>
            }
          >
            <YouTubePlayer
              url={currentVideoUrl}
              isPlaying={isPlaying}
              volume={volume}
              muted={muted}
              onEnded={handlePlayNextInQueue}
              onPlayerInstance={registerPlayerInstance}
            />
          </Suspense>

          <MediaBoxOverlayControls
            currentVideoUrl={currentVideoUrl}
            currentVideoTitle={currentVideoTitle}
            currentVideoArtist={currentVideoArtist}
            isPlaying={isPlaying}
            isLocked={isLocked}
            muted={muted}
            volume={volume}
            isFullscreen={isFullscreen}
            canGoPrevious={canGoPrevious}
            controlsVisible={controlsVisible}
            onTogglePlayPause={handleTogglePlayPause}
            onPlayPrevious={handlePlayPreviousTrack}
            onSkipNext={handlePlayNextInQueue}
            onToggleMute={() => setMuted((prev) => !prev)}
            onVolumeChange={handleAdjustVolume}
            onToggleFullscreen={handleToggleFullscreen}
          />
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-2">
          {upcomingItems.some((item) => Boolean(item.startTime)) ? (
            <IdleScheduleTimeline upcomingItems={upcomingItems} />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground p-6">
              <div className="p-4 rounded-full bg-muted/40 border border-border">
                <Tv className="w-10 h-10 text-primary/70" />
              </div>
              <p className="font-mono text-sm sm:text-base">
                {roomCode ? t('mediaBox.noVideoPlaying') : t('mediaBox.watchPartyIdle')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Locked Room Overlay */}
      {isLocked && (
        <div className="absolute inset-0 z-30 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-300">
          <div className="p-5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <Lock className="w-12 h-12 sm:w-16 sm:h-16 text-amber-500 animate-pulse" />
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-black uppercase tracking-widest text-amber-400">
            {t('mediaBox.roomLockedTitle')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xs">
            {t('mediaBox.roomLockedSubtitle')}
          </p>
        </div>
      )}

      <MediaBoxQrModal
        showQrModal={showQrModal}
        roomCode={roomCode}
        remoteUrl={remoteUrl}
        copiedLink={copiedLink}
        onClose={() => setShowQrModal(false)}
        onCopyLink={copyRemoteLink}
      />
    </Card>
  );
};
