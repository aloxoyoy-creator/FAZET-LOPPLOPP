import { useState, useEffect } from 'react';

export interface ClockTime {
  hours: string;
  minutes: string;
  day: string;
  month: string;
  year: string;
  weekday: string;
}

const getClockTime = (): ClockTime => {
  const now = new Date();
  return {
    hours: String(now.getHours()).padStart(2, '0'),
    minutes: String(now.getMinutes()).padStart(2, '0'),
    day: String(now.getDate()).padStart(2, '0'),
    month: now.toLocaleString('id-ID', { month: 'long' }),
    year: String(now.getFullYear()),
    weekday: now.toLocaleString('id-ID', { weekday: 'long' }),
  };
};

/**
 * Low-CPU clock hook that only updates once per minute on the exact minute boundary.
 */
export const useClockTime = (): ClockTime => {
  const [time, setTime] = useState<ClockTime>(() => getClockTime());

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNextTick = () => {
      const now = new Date();
      // Calculate milliseconds remaining until the next 00-second mark (+50ms buffer)
      const msUntilNextMinute =
        (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 50;

      timeoutId = setTimeout(() => {
        setTime(getClockTime());
        scheduleNextTick();
      }, msUntilNextMinute);
    };

    scheduleNextTick();
    return () => clearTimeout(timeoutId);
  }, []);

  return time;
};
