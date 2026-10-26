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
      if (
        item.subject.toLowerCase().includes('sholat') ||
        item.subject.toLowerCase().includes('dhuhur') ||
        item.subject.toLowerCase().includes('jumat') ||
        item.subject.toLowerCase().includes('ashar')
      )
        continue;
      if (
        item.subject.toLowerCase().includes('istirahat') ||
        item.subject.toLowerCase().includes('upacara') ||
        item.subject.toLowerCase().includes('literasi')
      )
        continue;

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
    let diffSeconds = h * 3600 + m * 60 - (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds());
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
    <div className="space-y-3 mb-5">
      {(todayTka || tomorrowTka) && (
        <div className="rounded-xl bg-[var(--tf-accent-soft)] p-4 border border-[var(--tf-accent)]/25">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="studio-eyebrow mb-1">
                <Target size={13} />
                <span>
                  {todayTka
                    ? `Ujian TKA Hari Ini (Hari Ke-${todayTka.hariKe})`
                    : `Siaga H-1 Ujian TKA Besok (Hari Ke-${tomorrowTka!.hariKe})`}
                </span>
              </div>
              <div className="text-sm font-semibold text-[var(--tf-text-primary)]">
                {(todayTka || tomorrowTka)!.shortTitle}{' '}
                <span className="font-mono text-xs font-medium text-[var(--tf-accent)]">
                  ({(todayTka || tomorrowTka)!.mulaiWib} – {(todayTka || tomorrowTka)!.perkiraanSelesaiWib} WIB)
                </span>
              </div>
              <p className="text-xs text-[var(--tf-text-secondary)] mt-1">
                {(todayTka || tomorrowTka)!.persiapanTips}
              </p>
            </div>
            <Link
              to="/tka"
              className="self-start sm:self-center shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--tf-primary)] text-[var(--tf-bg-surface)] text-xs font-medium transition-opacity hover:opacity-90"
            >
              <span>Buka CBT</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}

      {(currentSubject || nextSubject) && (
        <div className="rounded-xl bg-[var(--tf-bg-subtle)] p-4 border border-[var(--tf-border)]">
          <div className="flex items-center gap-2 text-[var(--tf-accent)] mb-1.5">
            <BookOpen size={14} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em]">Status Sesi Akademik</span>
          </div>

          {currentSubject ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-sm text-[var(--tf-text-secondary)]">
                Sedang berlangsung:{' '}
                <strong className="text-[var(--tf-text-primary)] font-semibold">{currentSubject.subject}</strong>
              </div>
              <div className="text-xs text-[var(--tf-text-muted)] flex items-center gap-1.5">
                <Clock size={13} className="text-[var(--tf-accent)]" />
                <span className="font-mono font-medium text-[var(--tf-text-primary)] bg-[var(--tf-bg-surface)] px-2 py-0.5 rounded-md border border-[var(--tf-border)]">
                  {formatCountdown(currentSubject.endTime)}
                </span>
                <span>{nextSubject ? `menuju ${nextSubject.subject}` : 'tersisa'}</span>
              </div>
            </div>
          ) : (
            nextSubject && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-sm text-[var(--tf-text-secondary)]">
                  Sesi berikutnya:{' '}
                  <strong className="text-[var(--tf-text-primary)] font-semibold">{nextSubject.subject}</strong>
                </div>
                <div className="text-xs text-[var(--tf-text-muted)] flex items-center gap-1.5">
                  <Clock size={13} className="text-[var(--tf-accent)]" />
                  <span>Dimulai dalam</span>
                  <span className="font-mono font-medium text-[var(--tf-text-primary)] bg-[var(--tf-bg-surface)] px-2 py-0.5 rounded-md border border-[var(--tf-border)]">
                    {formatCountdown(nextSubject.startTime)}
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
