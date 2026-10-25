import { useState, useEffect, useRef } from 'react';
import { useSchedule } from './useSchedule';
import { jakartaWeekday } from '../lib/schoolCalendar';

export interface TimeBoxScheduleItem {
  name: string;
  startTime: string;
  endTime: string;
  type: 'special' | 'regular';
}

export interface TimeBoxScheduleReturn {
  currentSchedule: TimeBoxScheduleItem | null;
  nextSchedule: TimeBoxScheduleItem | null;
  upcomingItems: TimeBoxScheduleItem[];
  showCountdown: boolean;
  countdownSeconds: number;
  targetSchedule: TimeBoxScheduleItem | null;
}

const parseMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

export const useTimeBoxSchedule = (): TimeBoxScheduleReturn => {
  const { items: rawItems } = useSchedule();
  const [currentSchedule, setCurrentSchedule] = useState<TimeBoxScheduleItem | null>(null);
  const [nextSchedule, setNextSchedule] = useState<TimeBoxScheduleItem | null>(null);
  const [upcomingItems, setUpcomingItems] = useState<TimeBoxScheduleItem[]>([]);
  const [showCountdown, setShowCountdown] = useState<boolean>(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(10);
  const [targetSchedule, setTargetSchedule] = useState<TimeBoxScheduleItem | null>(null);

  const triggeredCountdowns = useRef<Set<string>>(new Set());
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideCountdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleCheckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (hideCountdownTimeoutRef.current) clearTimeout(hideCountdownTimeoutRef.current);
      if (scheduleCheckTimeoutRef.current) clearTimeout(scheduleCheckTimeoutRef.current);
    };
  }, []);

  const startTenSecondCountdown = (targetItem: TimeBoxScheduleItem, triggerKey: string) => {
    if (triggeredCountdowns.current.has(triggerKey)) return;
    triggeredCountdowns.current.add(triggerKey);

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (hideCountdownTimeoutRef.current) clearTimeout(hideCountdownTimeoutRef.current);

    setTargetSchedule(targetItem);
    setCountdownSeconds(10);
    setShowCountdown(true);

    let remaining = 10;
    countdownIntervalRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        setCountdownSeconds(remaining);
      } else {
        setCountdownSeconds(0);
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        hideCountdownTimeoutRef.current = setTimeout(() => {
          setShowCountdown(false);
          setTargetSchedule(null);
        }, 4000);
      }
    }, 1000);
  };

  useEffect(() => {
    const evaluateScheduleAndPlanNext = () => {
      if (scheduleCheckTimeoutRef.current) {
        clearTimeout(scheduleCheckTimeoutRef.current);
      }

      const now = new Date();
      const currentDayName = jakartaWeekday(now);
      const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
      const currentTotalSeconds = currentTotalMinutes * 60 + now.getSeconds();
      const nowMs = now.getTime();

      const todayItems: TimeBoxScheduleItem[] = rawItems
        .filter((it) => it.active && it.day === currentDayName)
        .sort((a, b) => parseMinutes(a.startTime) - parseMinutes(b.startTime))
        .map((it) => {
          const lower = it.subject.toLowerCase();
          const isSpecial =
            it.type === 'break' ||
            lower.includes('istirahat') ||
            lower.includes('upacara') ||
            lower.includes('sholat') ||
            lower.includes('pulang');
          return {
            name: it.subject,
            startTime: it.startTime,
            endTime: it.endTime,
            type: isSpecial ? 'special' : 'regular',
          };
        });

      if (todayItems.length === 0) {
        setCurrentSchedule({ name: 'Hari Libur / Bebas', startTime: '', endTime: '', type: 'special' });
        setNextSchedule({
          name: 'Tidak ada jadwal hari ini',
          startTime: '',
          endTime: '',
          type: 'special',
        });
        setUpcomingItems([]);

        const tomorrow = new Date(now);
        tomorrow.setHours(24, 0, 0, 50);
        scheduleCheckTimeoutRef.current = setTimeout(
          evaluateScheduleAndPlanNext,
          tomorrow.getTime() - nowMs
        );
        return;
      }

      let foundCurrent: TimeBoxScheduleItem | null = null;
      let foundNext: TimeBoxScheduleItem | null = null;
      let foundUpcoming: TimeBoxScheduleItem[] = [];

      for (let i = 0; i < todayItems.length; i++) {
        const item = todayItems[i];
        const startMin = parseMinutes(item.startTime);
        const endMin = parseMinutes(item.endTime);

        if (currentTotalMinutes >= startMin && currentTotalMinutes < endMin) {
          foundCurrent = item;
          foundNext = todayItems[i + 1] || {
            name: 'Pulang / Selesai',
            startTime: '',
            endTime: '',
            type: 'special',
          };
          foundUpcoming = todayItems.slice(i + 1);
          break;
        }
      }

      if (!foundCurrent) {
        const firstMin = parseMinutes(todayItems[0].startTime);
        const lastMin = parseMinutes(todayItems[todayItems.length - 1].endTime);

        if (currentTotalMinutes < firstMin) {
          foundCurrent = {
            name: 'Belum Dimulai',
            startTime: '',
            endTime: todayItems[0].startTime,
            type: 'special',
          };
          foundNext = todayItems[0];
          foundUpcoming = todayItems;
        } else if (currentTotalMinutes >= lastMin) {
          foundCurrent = {
            name: 'Jadwal Selesai',
            startTime: '',
            endTime: '',
            type: 'special',
          };
          foundNext = {
            name: 'Sampai Jumpa Besok!',
            startTime: '',
            endTime: '',
            type: 'special',
          };
          foundUpcoming = [];
        } else {
          foundCurrent = {
            name: 'Waktu Transisi',
            startTime: '',
            endTime: '',
            type: 'regular',
          };
          const upcomingIdx = todayItems.findIndex(
            (item) => parseMinutes(item.startTime) > currentTotalMinutes
          );
          foundNext =
            upcomingIdx !== -1
              ? todayItems[upcomingIdx]
              : { name: 'Tidak Diketahui', startTime: '', endTime: '', type: 'regular' };
          foundUpcoming = upcomingIdx !== -1 ? todayItems.slice(upcomingIdx) : [];
        }
      }

      setCurrentSchedule(foundCurrent);
      setNextSchedule(foundNext);
      setUpcomingItems(foundUpcoming);

      if (foundNext && foundNext.type === 'special' && foundNext.startTime) {
        const nextStartSeconds = parseMinutes(foundNext.startTime) * 60;
        const diffSec = nextStartSeconds - currentTotalSeconds;
        const triggerKey = `${now.toDateString()}-${foundNext.name}-${foundNext.startTime}`;

        if (diffSec > 0 && diffSec <= 10) {
          startTenSecondCountdown(foundNext, triggerKey);
        }
      }

      const candidateDelaysMs: number[] = [];
      const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 50;
      candidateDelaysMs.push(msToNextMinute);

      if (foundNext && foundNext.startTime) {
        const nextStartSec = parseMinutes(foundNext.startTime) * 60;
        const secUntilCountdown = nextStartSec - 10 - currentTotalSeconds;
        if (secUntilCountdown > 0) {
          candidateDelaysMs.push(secUntilCountdown * 1000 - now.getMilliseconds() + 20);
        }
        const secUntilStart = nextStartSec - currentTotalSeconds;
        if (secUntilStart > 0) {
          candidateDelaysMs.push(secUntilStart * 1000 - now.getMilliseconds() + 20);
        }
      }

      const nextDelay = Math.max(250, Math.min(...candidateDelaysMs));
      scheduleCheckTimeoutRef.current = setTimeout(evaluateScheduleAndPlanNext, nextDelay);
    };

    evaluateScheduleAndPlanNext();

    return () => {
      if (scheduleCheckTimeoutRef.current) {
        clearTimeout(scheduleCheckTimeoutRef.current);
      }
    };
  }, [rawItems]);

  return {
    currentSchedule,
    nextSchedule,
    upcomingItems,
    showCountdown,
    countdownSeconds,
    targetSchedule,
  };
};
