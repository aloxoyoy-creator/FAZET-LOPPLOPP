import { useState, useEffect, useMemo } from 'react';
import { BookOpen, Clock, Target, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSchedule } from '../../hooks/useSchedule';
import { useWorkspace } from '../../context/WorkspaceContext';
import { dateKey, jakartaWeekday } from '../../lib/schoolCalendar';
import { getExamDayByDate, isTkaFeatureActive } from '../../data/tkaSchedule2026';
import type { ScheduleItem } from '../../types';

function minutes(value: string) {
  const [h, m] = value.replace('.', ':').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export default function CurrentSubjectAlert() {
  const { items: schedule } = useSchedule();
  const { workspaceId } = useWorkspace();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = dateKey(now);
  const tomorrowStr = dateKey(new Date(now.getTime() + 86400000));
  const tkaActive = workspaceId !== 'mazet' && isTkaFeatureActive(now);
  const todayTka = tkaActive ? getExamDayByDate(todayStr) : undefined;
  const tomorrowTka = tkaActive ? getExamDayByDate(tomorrowStr) : undefined;

  const todayDay = jakartaWeekday(now);
  const todayTimeline = useMemo(() => {
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
  }, [todayDay, schedule]);

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
      if (!currentSubject && !nextSubject) {
        nextSubject = item;
      }
    }
  }

  const formatCountdown = (targetTime: string) => {
    const [h, m] = targetTime.replace('.', ':').split(':').map(Number);
    let diffSeconds = (h * 3600 + m * 60) - (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds());
    if (diffSeconds < 0) diffSeconds = 0;
    
    const hours = Math.floor(diffSeconds / 3600);
    const minutesLeft = Math.floor((diffSeconds % 3600) / 60);
    const secondsLeft = diffSeconds % 60;
    
    return `${hours > 0 ? `${hours}j ` : ''}${minutesLeft}m ${secondsLeft}d`;
  };

  if (!currentSubject && !nextSubject && !todayTka && !tomorrowTka) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {/* TKA Live / H-1 Alert */}
      {(todayTka || tomorrowTka) && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-transparent p-4 border-l-4 border-amber-500 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider mb-1">
                <Target size={15} className="animate-pulse" />
                {todayTka ? `Ujian TKA Hari Ini (Hari Ke-${todayTka.hariKe})` : `Siaga H-1 Ujian TKA Besok (Hari Ke-${tomorrowTka!.hariKe})`}
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {(todayTka || tomorrowTka)!.shortTitle}{' '}
                <span className="font-mono text-xs font-semibold text-amber-700 dark:text-amber-300">
                  ({(todayTka || tomorrowTka)!.mulaiWib} – {(todayTka || tomorrowTka)!.perkiraanSelesaiWib} WIB • {(todayTka || tomorrowTka)!.totalMenit} Menit)
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {(todayTka || tomorrowTka)!.persiapanTips}
              </p>
            </div>
            <Link
              to="/tka"
              className="self-start sm:self-center shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
            >
              Buka CBT <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}

      {/* Regular Subject Alert */}
      {(currentSubject || nextSubject) && (
        <div className="rounded-[var(--tf-radius-md)] bg-blue-500/10 p-4 border-l-4 border-blue-500 shadow-sm relative overflow-hidden group">
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
      )}
    </div>
  );
}
