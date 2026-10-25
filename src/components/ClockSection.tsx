import React from 'react';
import { ClockTime } from '@/hooks/useClockTime';
import { WatchPartyControls } from './WatchPartyControls';
import { Card } from '@schoolhub/ui';

interface ClockSectionProps {
  time: ClockTime;
}

export const ClockSection: React.FC<ClockSectionProps> = ({ time }) => {
  return (
    <div className="flex flex-col gap-3 lg:gap-4 h-full">
      {/* Clock & Date Display Card */}
      <Card
        chamfer="top-right"
        className="p-4 flex flex-col justify-center items-center flex-1 text-center transition-colors duration-300 shadow-lg"
      >
        <div
          id="clock"
          className="font-display text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-widest flex items-center justify-center text-foreground"
        >
          <span>{time.hours}</span>
          <span className="animate-blink mx-1 text-foreground">:</span>
          <span>{time.minutes}</span>
        </div>
        <div
          id="date"
          className="text-base sm:text-xl md:text-2xl mt-2 text-muted-foreground font-medium"
        >
          {time.weekday}, {time.day} {time.month} {time.year}
        </div>
      </Card>

      {/* MediaBox Watch Together Controls Card */}
      <Card
        chamfer="dual"
        className="px-3 py-2 sm:px-4 sm:py-3 flex flex-col justify-center items-center flex-shrink-0 text-center transition-colors duration-300 shadow-md"
      >
        <WatchPartyControls />
      </Card>
    </div>
  );
};
