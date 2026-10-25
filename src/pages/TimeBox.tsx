import React from 'react';
import { Header } from '@/components/Header';
import { ClockSection } from '@/components/ClockSection';
import { ScheduleSection } from '@/components/ScheduleSection';
import { MediaBox } from '@/components/MediaBox';
import { Footer } from '@/components/Footer';
import { CountdownOverlay } from '@/components/CountdownOverlay';
import { TvSettingsModal } from '@/components/TvSettingsModal';
import { TvSearchModal } from '@/components/TvSearchModal';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useClockTime } from '@/hooks/useClockTime';
import { useTimeBoxSchedule } from '@/hooks/useTimeBoxSchedule';
import { useTvNavigation } from '@/hooks/useTvNavigation';
import { WatchPartyProvider, useWatchParty } from '@/context/WatchPartyContext';
import { useTranslation } from '@/context/LanguageContext';
import { Settings } from 'lucide-react';
import { Button } from '@schoolhub/ui';

const DashboardContent: React.FC<{
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}> = ({ theme, toggleTheme }) => {
  const { t } = useTranslation();
  const time = useClockTime();
  const {
    currentSchedule,
    nextSchedule,
    upcomingItems,
    showCountdown,
    countdownSeconds,
    targetSchedule,
  } = useTimeBoxSchedule();
  const {
    roomState,
    showSettingsModal,
    setShowSettingsModal,
    showSearchModal,
    setShowSearchModal,
    showQrModal,
    setShowQrModal,
    handleTogglePlayPause,
    handlePlayNextInQueue,
    handlePlayPreviousTrack,
  } = useWatchParty();

  useTvNavigation({
    onMediaPlayPause: handleTogglePlayPause,
    onMediaNext: handlePlayNextInQueue,
    onMediaPrevious: () => {
      handlePlayPreviousTrack();
    },
    onBack: () => {
      if (showSettingsModal) {
        setShowSettingsModal(false);
        return true;
      }
      if (showSearchModal) {
        setShowSearchModal(false);
        return true;
      }
      if (showQrModal) {
        setShowQrModal(false);
        return true;
      }
      return false;
    },
  });

  const isFullscreen = Boolean(roomState?.isFullscreen && roomState?.currentlyPlaying);
  const isVideoPlaying = Boolean(
    roomState?.currentlyPlaying && roomState?.playback?.status === 'playing'
  );
  const isCountdownEnabled = roomState?.isCountdownEnabled !== false;

  return (
    <div
      className={`${
        theme === 'dark' ? 'dark timebox-ui' : 'light timebox-ui'
      } relative w-full h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-6 gap-2 overflow-hidden transition-colors duration-300 bg-background text-foreground`}
    >
      {/* Fixed Top-Left Settings & Language Switcher */}
      {!isFullscreen && (
        <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
          <Button
            variant="outline"
            chamfer="dual"
            size="icon"
            onClick={() => setShowSettingsModal(true)}
            aria-label={t('tvSettings.title')}
            title={t('tvSettings.title')}
            className="h-11 w-11 shadow-lg"
          >
            <Settings className="h-4 w-4 text-foreground" />
          </Button>
          <LanguageSwitcher />
        </div>
      )}

      <TvSettingsModal open={showSettingsModal} onOpenChange={setShowSettingsModal} />
      <TvSearchModal />

      {!isFullscreen && <Header theme={theme} toggleTheme={toggleTheme} />}

      <main
        className={
          isFullscreen
            ? 'fixed inset-0 z-40 bg-black flex items-center justify-center p-0 m-0'
            : 'grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 flex-1 min-h-0 my-1'
        }
      >
        {!isFullscreen && (
          <div className="flex flex-col gap-3 lg:gap-4 h-full min-h-0">
            <div className="flex-1 min-h-0">
              <ClockSection time={time} />
            </div>
            <ScheduleSection
              currentSchedule={currentSchedule}
              nextSchedule={nextSchedule}
              upcomingItems={upcomingItems}
              isVideoPlaying={isVideoPlaying}
            />
          </div>
        )}
        <div className={isFullscreen ? 'w-full h-full' : 'h-full min-h-0'}>
          <MediaBox upcomingItems={upcomingItems} />
        </div>
      </main>

      {!isFullscreen && <Footer />}
      {showCountdown && isCountdownEnabled && targetSchedule && (
        <CountdownOverlay item={targetSchedule} secondsLeft={countdownSeconds} />
      )}
    </div>
  );
};

export const TimeBoxPage: React.FC<{
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}> = ({ theme, toggleTheme }) => {
  return (
    <WatchPartyProvider>
      <DashboardContent theme={theme} toggleTheme={toggleTheme} />
    </WatchPartyProvider>
  );
};

export default TimeBoxPage;
