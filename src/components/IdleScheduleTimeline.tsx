import React, { useState, useEffect, useMemo } from 'react';
import { TimeBoxScheduleItem as ScheduleItem } from '@/hooks/useTimeBoxSchedule';
import { useTranslation } from '@/context/LanguageContext';

interface IdleScheduleTimelineProps {
  upcomingItems: ScheduleItem[];
}

const ITEMS_PER_PAGE = 3;

export const IdleScheduleTimeline: React.FC<IdleScheduleTimelineProps> = ({ upcomingItems }) => {
  const { t } = useTranslation();

  // Filter out non-timed placeholders and keep valid upcoming items
  const validItems = useMemo(
    () => upcomingItems.filter((item) => Boolean(item.startTime)),
    [upcomingItems]
  );

  const totalPages = Math.max(1, Math.ceil(validItems.length / ITEMS_PER_PAGE));
  const [page, setPage] = useState(0);
  const [animClass, setAnimClass] = useState('animate-fade-in-slide-up');

  // Reset pagination when schedule items change
  useEffect(() => {
    setPage(0);
  }, [validItems.length, validItems[0]?.startTime]);

  // Auto-cycle pages every 15 seconds if there are more than 3 upcoming items
  useEffect(() => {
    if (totalPages <= 1) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    const intervalId = setInterval(() => {
      setAnimClass('animate-fade-out-slide-up');
      timeoutId = setTimeout(() => {
        setPage((prev) => (prev + 1) % totalPages);
        setAnimClass('animate-fade-in-slide-up');
      }, 280);
    }, 15000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [totalPages]);

  if (validItems.length === 0) {
    return null;
  }

  const startIdx = page * ITEMS_PER_PAGE;
  const pageItems = validItems.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  return (
    <div className="w-full max-w-md mx-auto px-5 py-4 flex flex-col justify-center select-none pointer-events-none">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {t('schedule.upcomingAgenda')}
          </span>
        </div>
        {totalPages > 1 && (
          <span className="text-[10px] font-mono font-semibold text-muted-foreground/70 bg-muted/60 px-2 py-0.5 rounded-full">
            {t('schedule.pageIndicator', { current: page + 1, total: totalPages })}
          </span>
        )}
      </div>

      {/* 3-Line Vertical Stepper Container */}
      <div className={`relative pl-5 space-y-2.5 ${animClass}`}>
        {/* Vertical Timeline Connector Line */}
        <div
          className="absolute left-[7px] top-3 bottom-3 w-[1.5px] bg-gradient-to-b from-foreground/40 via-border to-transparent"
          aria-hidden="true"
        />

        {pageItems.map((item, idx) => {
          const globalIdx = startIdx + idx;
          const isImmediateNext = globalIdx === 0;
          const isSpecial = item.type === 'special';

          return (
            <div key={`${item.startTime}-${item.name}-${globalIdx}`} className="relative flex items-center">
              {/* Timeline Node Dot */}
              <div
                className={`absolute -left-5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isImmediateNext
                    ? 'bg-foreground border-foreground shadow-[0_0_8px_rgba(255,255,255,0.3)]'
                    : isSpecial
                    ? 'bg-amber-400/20 border-amber-400'
                    : 'bg-background border-muted-foreground/50'
                }`}
              >
                {isImmediateNext && (
                  <span className="w-1.5 h-1.5 rounded-full bg-background" />
                )}
              </div>

              {/* Schedule Line Card */}
              <div
                className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg border transition-colors ${
                  isImmediateNext
                    ? 'bg-muted/80 border-foreground/25 shadow-sm'
                    : 'bg-muted/30 border-border/60'
                }`}
              >
                <div className="flex flex-col min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-body font-bold text-sm sm:text-base truncate ${
                        isImmediateNext ? 'text-foreground' : 'text-foreground/80'
                      }`}
                    >
                      {item.name}
                    </span>
                    {isImmediateNext && (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-foreground text-background rounded flex-shrink-0">
                        {t('schedule.upNextBadge')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Time Pill */}
                <span
                  className={`font-mono text-xs sm:text-sm font-semibold px-2.5 py-1 rounded flex-shrink-0 ${
                    isImmediateNext
                      ? 'bg-background text-foreground border border-border'
                      : 'text-muted-foreground'
                  }`}
                >
                  {item.startTime}
                  {item.endTime ? ` - ${item.endTime}` : ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subtle Progress Indicator when multi-page */}
      {totalPages > 1 && (
        <div className="w-full h-[2px] bg-border/40 rounded-full overflow-hidden mt-3">
          <div
            key={page}
            className="h-full bg-foreground/40 rounded-full animate-agenda-progress"
          />
        </div>
      )}
    </div>
  );
};
