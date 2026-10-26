import React, { useState, useEffect } from 'react';
import { TimeBoxScheduleItem as ScheduleItem } from '../hooks/useTimeBoxSchedule';
import { useTranslation } from '@/context/LanguageContext';
import { Card } from '@schoolhub/ui';

interface ScheduleSectionProps {
  currentSchedule: ScheduleItem | null;
  nextSchedule: ScheduleItem | null;
  upcomingItems?: ScheduleItem[];
  isVideoPlaying?: boolean;
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  currentSchedule,
  nextSchedule,
  upcomingItems = [],
  isVideoPlaying = false,
}) => {
  const { t } = useTranslation();

  // Dynamic rotation through upcomingItems every 5s when video is actively playing
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [animClass, setAnimClass] = useState('animate-fade-in-slide-up');

  const validUpcoming = upcomingItems.filter((item) => Boolean(item.startTime));
  const shouldRotate = isVideoPlaying && validUpcoming.length > 1;

  useEffect(() => {
    setCarouselIdx(0);
  }, [validUpcoming.length, isVideoPlaying]);

  useEffect(() => {
    if (!shouldRotate) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    const intervalId = setInterval(() => {
      setAnimClass('animate-fade-out-slide-up');
      timeoutId = setTimeout(() => {
        setCarouselIdx((prev) => (prev + 1) % validUpcoming.length);
        setAnimClass('animate-fade-in-slide-up');
      }, 280);
    }, 5000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [shouldRotate, validUpcoming.length]);

  const displayedNext: ScheduleItem | null = shouldRotate
    ? validUpcoming[carouselIdx % validUpcoming.length]
    : nextSchedule;

  const formatTime = (item: ScheduleItem | null) => {
    if (!item || !item.startTime) return '';
    return `${item.startTime} - ${item.endTime}`;
  };

  return (
    <div className="grid grid-cols-2 gap-3 lg:gap-4 flex-shrink-0">
      {/* Current Schedule Card */}
      <Card
        className="p-3 sm:p-4 flex flex-col justify-center items-center text-center transition-colors duration-300 shadow-md relative overflow-hidden"
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <h2 className="font-body text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t('schedule.currentSchedule')}
          </h2>
          {currentSchedule?.endTime && (
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-muted text-foreground border border-border rounded-full">
              {t('schedule.endsAt', { time: currentSchedule.endTime })}
            </span>
          )}
        </div>
        <div
          id="current-schedule"
          className="font-body text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate max-w-full px-1"
        >
          {currentSchedule ? currentSchedule.name : t('schedule.loading')}
        </div>
        <div id="current-schedule-time" className="text-xs sm:text-sm mt-1 text-muted-foreground font-mono">
          {formatTime(currentSchedule)}
        </div>
      </Card>

      {/* Next Schedule Card (Dynamic Carousel during Playback) */}
      <Card
        className="p-3 sm:p-4 flex flex-col justify-center items-center text-center transition-colors duration-300 shadow-md relative overflow-hidden"
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <h2 className="font-body text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t('schedule.nextSchedule')}
          </h2>
          {shouldRotate && (
            <span className="text-[10px] font-mono font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {(carouselIdx % validUpcoming.length) + 1}/{validUpcoming.length}
            </span>
          )}
        </div>

        <div className={`w-full flex flex-col items-center ${shouldRotate ? animClass : ''}`}>
          <div
            id="next-schedule"
            className="font-body text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate max-w-full px-1"
          >
            {displayedNext ? displayedNext.name : t('schedule.loading')}
          </div>
          <div id="next-schedule-time" className="text-xs sm:text-sm mt-1 text-muted-foreground font-mono">
            {formatTime(displayedNext)}
          </div>
        </div>

        {/* Bottom Progress Bar when rotating */}
        {shouldRotate && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-border/30 overflow-hidden">
            <div
              key={carouselIdx}
              className="h-full bg-foreground/50 animate-schedule-progress"
            />
          </div>
        )}
      </Card>
    </div>
  );
};
