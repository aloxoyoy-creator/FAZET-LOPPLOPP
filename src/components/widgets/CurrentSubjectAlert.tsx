import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import { useSchedule } from '../../hooks/useSchedule';
import { jakartaWeekday } from '../../lib/schoolCalendar';
import type { ScheduleItem } from '../../types';

function minutes(value: string) {
  const [h, m] = value.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export default function CurrentSubjectAlert() {
  const { items: schedule } = useSchedule();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayTimeline = useMemo(() => {
    const todayDay = jakartaWeekday(now);
    const todayItems = schedule
      .filter((item) => item.active && item.day === todayDay)
      .sort((a, b) => minutes(a.startTime) - minutes(b.startTime));
    
    const groups: ScheduleItem[] = [];
    for (const item of todayItems) {
      if (item.type !== 'subject') continue;
      if (item.subject.toLowerCase().includes('sholat') || item.subject.toLowerCase().includes('dhuhur') || item.subject.toLowerCase().includes('jumat') || item.subject.toLowerCase().includes('ashar')) continue;
      if (item.subject.toLowerCase().includes('istirahat') || item.subject.toLowerCase().includes('upacara') || item.subject.toLowerCase().includes('literasi')) continue;

      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.subject.trim().toLowerCase() === item.subject.trim().toLowerCase()) {
        lastGroup.endTime = item.endTime;
      } else {
        groups.push({ ...item });
      }
    }
    return groups;
  }, [now, schedule]);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let currentSubject = null;
  let nextSubject = null;

  for (let i = 0; i < todayTimeline.length; i++) {
    const item = todayTimeline[i];
    const startMins = minutes(item.startTime);
    const endMins = minutes(item.endTime);

    if (currentMinutes >= startMins && currentMinutes < endMins) {
      currentSubject = item;
      if (i + 1 < todayTimeline.length) {
        nextSubject = todayTimeline[i + 1];
      }
      break;
    } else if (startMins > currentMinutes) {
      // We haven't reached this subject yet
      if (!currentSubject && !nextSubject) {
        nextSubject = item;
      }
    }
  }

  if (!currentSubject && !nextSubject) {
    return null; // Tidak ada pelajaran saat ini atau berikutnya
  }

  const formatCountdown = (targetTime: string) => {
    const [h, m] = targetTime.split(':').map(Number);
    let diffSeconds = (h * 3600 + m * 60) - (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds());
    if (diffSeconds < 0) diffSeconds = 0;
    
    const hours = Math.floor(diffSeconds / 3600);
    const minutesLeft = Math.floor((diffSeconds % 3600) / 60);
    const secondsLeft = diffSeconds % 60;
    
    return `${hours > 0 ? `${hours}j ` : ''}${minutesLeft}m ${secondsLeft}d`;
  };

  return (
    <div className="mb-6 rounded-[var(--tf-radius-md)] bg-blue-500/10 p-4 border-l-4 border-blue-500 shadow-sm relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-2">
          <BookOpen size={16} className="animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest">Status Pelajaran</span>
        </div>
        
        {currentSubject ? (
          <div>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Sekarang: <strong className="text-blue-600 dark:text-blue-400 text-lg">{currentSubject.subject}</strong>
            </div>
            {nextSubject && (
              <div className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Clock size={14} className="text-slate-400" />
                <span className="font-mono text-blue-600 dark:text-blue-400 text-sm bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">
                  {formatCountdown(currentSubject.endTime)}
                </span>
                lagi menuju <strong className="text-slate-800 dark:text-slate-200">{nextSubject.subject}</strong>
              </div>
            )}
            {!nextSubject && (
              <div className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Clock size={14} className="text-slate-400" />
                <span className="font-mono text-blue-600 dark:text-blue-400 text-sm bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">
                  {formatCountdown(currentSubject.endTime)}
                </span>
                lagi selesai hari ini.
              </div>
            )}
          </div>
        ) : (
          <div>
            {nextSubject && (
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Pelajaran berikutnya: <strong className="text-blue-600 dark:text-blue-400 text-lg">{nextSubject.subject}</strong>
                <div className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Clock size={14} className="text-slate-400" />
                  Dimulai dalam 
                  <span className="font-mono text-blue-600 dark:text-blue-400 text-sm bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">
                    {formatCountdown(nextSubject.startTime)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
