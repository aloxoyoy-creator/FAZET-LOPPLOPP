import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock3, Wifi, WifiOff, Loader2, Target } from 'lucide-react';
import { useConnectionState } from '../../hooks/useConnectionState';
import { useSchedule, useScheduleHelpers } from '../../hooks/useSchedule';
import { useGoogleHolidays } from '../../hooks/useGoogleHolidays';
import { dateKey, jakartaParts, isWeekend } from '../../lib/schoolCalendar';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getExamDayByDate, isTkaFeatureActive } from '../../data/tkaSchedule2026';

function minutesFromString(value: string) {
  const [h, m] = value.split(':').map(Number);
  return h * 60 + m;
}

function formatClock(date: Date) {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

function formatDay(date: Date) {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export default function LiveStatusBar() {
  const { workspaceId } = useWorkspace();
  const { items } = useSchedule();
  const connection = useConnectionState();
  const { current } = useScheduleHelpers(items);
  const { byDate: holidays } = useGoogleHolidays(new Date());
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const key = dateKey(now);
  const tomorrowKey = dateKey(new Date(now.getTime() + 86400000));
  const parts = jakartaParts(now);
  const holiday = holidays.get(key)?.[0];
  const weekend = isWeekend(key);
  const tkaActive = workspaceId !== 'mazet' && isTkaFeatureActive(now);

  const todayTka = tkaActive ? getExamDayByDate(key) : undefined;
  const tomorrowTka = tkaActive ? getExamDayByDate(tomorrowKey) : undefined;

  const progress = useMemo(() => {
    if (!current || weekend || holiday) {
      return ((parts.minute + parts.second / 60) / 60) * 100;
    }
    const currentMinutes = parts.hour * 60 + parts.minute + parts.second / 60;
    const start = minutesFromString(current.startTime);
    const end = minutesFromString(current.endTime);
    if (currentMinutes < start || currentMinutes >= end) return 0;
    return Math.min(100, Math.max(0, ((currentMinutes - start) / Math.max(end - start, 1)) * 100));
  }, [current, parts.hour, parts.minute, parts.second, weekend, holiday]);

  const label = todayTka
    ? `TKA Hari Ke-${todayTka.hariKe}: ${todayTka.shortTitle} (${todayTka.mulaiWib}-${todayTka.perkiraanSelesaiWib} WIB)`
    : tomorrowTka
      ? `H-1 TKA Hari Ke-${tomorrowTka.hariKe}: ${tomorrowTka.shortTitle} (Besok 07:00 WIB)`
      : weekend
        ? 'Akhir pekan'
        : holiday
          ? `Libur: ${holiday.summary}`
          : current
            ? `${current.subject} (${current.startTime} - ${current.endTime})`
            : 'Tidak ada sesi terjadwal saat ini';

  const connectionLabel =
    connection === 'ONLINE'
      ? 'TERHUBUNG'
      : connection === 'SYNCING'
        ? 'SINKRONISASI'
        : connection === 'DEGRADED'
          ? 'LAMBAT'
          : 'OFFLINE';
  const ConnectionIcon = connection === 'OFFLINE' ? WifiOff : connection === 'SYNCING' ? Loader2 : Wifi;

  return (
    <div
      className="live-statusbar border-t border-[var(--tf-border)] bg-[var(--tf-bg-surface)] text-[var(--tf-text-secondary)]"
      aria-label="Status waktu dan jadwal realtime"
    >
      <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-3 px-4 py-2 text-[11px] sm:px-6 lg:px-10">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--tf-accent)]" />
          <CalendarDays size={12} className="shrink-0 text-[var(--tf-text-muted)]" />
          <span className="hidden sm:inline font-medium">{formatDay(now)}</span>
          <span className="sm:hidden font-medium">{parts.weekday}</span>
          <span className="opacity-30">|</span>
          <Clock3 size={12} className="shrink-0 text-[var(--tf-text-muted)]" />
          <span className="font-mono font-medium text-[var(--tf-text-primary)]">{formatClock(now)}</span>
          <span className="opacity-30 hidden md:inline">|</span>
          <span className="truncate text-[var(--tf-text-muted)]">{label}</span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {(todayTka || tomorrowTka) && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--tf-accent-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--tf-accent)]">
              <Target size={11} /> TKA 2026
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tf-border)] bg-[var(--tf-bg-subtle)] px-2.5 py-0.5 text-[10px] font-mono font-medium text-[var(--tf-text-secondary)]">
            <ConnectionIcon size={10} className={connection === 'SYNCING' ? 'animate-spin' : ''} />
            {connectionLabel}
          </span>
        </div>
      </div>
      <div className="h-[2px] w-full bg-[var(--tf-bg-subtle)] overflow-hidden" aria-hidden="true">
        <div
          className="h-full bg-[var(--tf-accent)] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
