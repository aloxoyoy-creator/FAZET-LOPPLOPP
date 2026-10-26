import { useAppConfig } from '../context/AppConfigContext';
import RandomMotion from '../components/ui/RandomMotion';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  CalendarHeart,
  Cake,
  ChevronRight,
  Clock3,
  Coffee,
  Flame,
  GraduationCap,
  Heart,
  Images,
  ListTodo,
  Sparkles,
  StickyNote,
  Timer,
  Tv,
  Target,
  UserRound,
  Wallet,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import JadwalSholat from '../components/widgets/JadwalSholat';
import TKADashboard from '../components/widgets/TKADashboard';
import CurrentSubjectAlert from '../components/widgets/CurrentSubjectAlert';
import YoutubeWidget from '../components/widgets/YoutubeWidget';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { useSchedule } from '../hooks/useSchedule';
import { useFathurTutoringSchedule } from '../hooks/useFathurTutoringSchedule';
import { useTasks } from '../hooks/useTasks';
import { useFocusStreak } from '../hooks/useFocusStreak';
import { jakartaWeekday } from '../lib/schoolCalendar';
import type { SchoolDay } from '../lib/schoolCalendar';
import type { ScheduleItem } from '../types';
import DigitalIdCardBanner from '../components/dashboard/DigitalIdCardBanner';
import AiPulseCard from '../components/dashboard/AiPulseCard';
import AiBriefing from '../components/dashboard/AiBriefing';
import DailyQuote from '../components/widgets/DailyQuote';
import FinanceQuickCard from '../components/widgets/FinanceQuickCard';
import DailyHabitTrackerCard from '../components/dashboard/DailyHabitTrackerCard';
import TaskForm from '../components/tasks/TaskForm';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { isTkaFeatureActive } from '../data/tkaSchedule2026';

const SCHOOL_WEEK_DAYS: SchoolDay[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

function minutes(value: string) {
  const [h, m] = value.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function dayAfter(date: Date): SchoolDay {
  const today = jakartaWeekday(date);
  const index = SCHOOL_WEEK_DAYS.indexOf(today as SchoolDay);
  return index >= 0 ? SCHOOL_WEEK_DAYS[(index + 1) % SCHOOL_WEEK_DAYS.length] : 'Senin';
}

function localDate(year: number, month: number, day: number, hour = 0, minute = 0) {
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

function nextBirthday(month: number, day: number, now: Date) {
  const year = now.getFullYear() + (now <= localDate(now.getFullYear(), month, day) ? 0 : 1);
  return localDate(year, month, day);
}

function nextAnniversary(now: Date) {
  const year = now.getFullYear() + (now <= localDate(now.getFullYear(), 6, 2, 18, 55) ? 0 : 1);
  return localDate(year, 6, 2, 18, 55);
}

function countdownParts(target: Date, now: Date) {
  const diff = Math.max(0, target.getTime() - now.getTime());
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function elapsedParts(start: Date, now: Date) {
  const diff = Math.max(0, now.getTime() - start.getTime());
  const totalMinutes = Math.floor(diff / 60000);
  return {
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
  };
}

function two(value: number) {
  return String(value).padStart(2, '0');
}

type MineePreviewItem = { id: string; title: string; storagePath: string; fileType: string; originalName: string };

function isImageAsset(fileType: string, name: string) {
  return fileType.startsWith('image/') || /\.(jpe?g|png|webp|gif|svg)$/i.test(name);
}

function MineePreviewCard() {
  const [items, setItems] = useState<MineePreviewItem[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      const { data, count: total } = await supabase
        .from('romantic_gallery')
        .select('id,title,storage_path,file_type,original_name', { count: 'exact' })
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })
        .limit(8);

      if (!active) return;
      const rows = (data ?? [])
        .map((row) => ({
          id: String(row.id),
          title: String(row.title ?? 'My Minee'),
          storagePath: String(row.storage_path),
          fileType: String(row.file_type ?? ''),
          originalName: String(row.original_name ?? row.title ?? ''),
        }))
        .filter((row) => isImageAsset(row.fileType, row.originalName));
      const signed = await Promise.all(
        rows.map(async (row) => {
          const { data: signedData } = await supabase.storage.from('my-minee').createSignedUrl(row.storagePath, 3600);
          return [row.id, signedData?.signedUrl ?? ''] as const;
        })
      );
      if (!active) return;
      setItems(rows);
      setUrls(Object.fromEntries(signed.filter(([, url]) => Boolean(url))));
      setCount(total ?? null);
      setLoading(false);
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <Card className="overflow-hidden p-0 border border-[var(--tf-border)] bg-[var(--tf-bg-surface)]">
      <div className="border-b border-[var(--tf-border)] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="studio-eyebrow">
              <Images size={12} />
              <span>My Minee &bull; Arsip Visual</span>
            </div>
            <h3 className="mt-1 font-serif text-xl sm:text-2xl font-medium text-[var(--tf-text-primary)]">
              Galeri Momen &amp; Perjalanan Kita
            </h3>
            <p className="mt-0.5 text-xs text-[var(--tf-text-muted)]">
              Kurasi foto dan kenangan pribadi yang tersimpan di ruang My Minee.
            </p>
          </div>
          <Link
            to="/my-minee"
            className="self-start sm:self-center shrink-0 text-xs font-medium px-4 py-2 rounded-xl inline-flex items-center gap-1.5 bg-[var(--tf-primary)] text-[var(--tf-bg-surface)] hover:opacity-90 transition-opacity"
          >
            <span>Buka Galeri</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 p-5">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="aspect-square animate-pulse rounded-xl bg-[var(--tf-bg-subtle)]" />
          ))}
        </div>
      ) : items.length ? (
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 p-5">
          {items.map((item) => (
            <Link
              key={item.id}
              to="/my-minee"
              className="group relative aspect-square overflow-hidden rounded-xl bg-[var(--tf-bg-subtle)] border border-[var(--tf-border)]"
            >
              {urls[item.id] ? (
                <img
                  src={urls[item.id]}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-[var(--tf-text-muted)]">
                  <Heart size={15} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                <span className="text-[10px] text-white font-medium truncate">{item.title}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-6 text-xs text-center text-[var(--tf-text-muted)]">
          Pratinjau koleksi foto belum tersedia pada sesi ini. Buka halaman My Minee untuk melihat seluruh arsip.
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-[var(--tf-border)] px-5 sm:px-6 py-3 text-xs text-[var(--tf-text-muted)] bg-[var(--tf-bg-subtle)]/40">
        <span>{count == null ? 'Koleksi My Minee' : `${count} bingkai tersimpan di galeri`}</span>
        <Link to="/my-minee" className="font-medium text-[var(--tf-accent)] hover:underline inline-flex items-center gap-1">
          <span>Lihat seluruh koleksi</span>
          <ChevronRight size={13} />
        </Link>
      </div>
    </Card>
  );
}

function QuickActions() {
  const { workspaceId } = useWorkspace();
  const showTka = workspaceId !== 'mazet' && isTkaFeatureActive();
  const actions = [
    ...(showTka ? [{ to: '/tka', label: 'TKA 2026', icon: Target }] : []),
    { to: '/tasks', label: 'Tugas', icon: ListTodo },
    { to: '/notes', label: 'Catatan', icon: StickyNote },
    { to: '/finance', label: 'Keuangan', icon: Wallet },
    { to: '/lifestyle', label: 'Lifestyle', icon: Coffee },
    { to: '/schedule', label: workspaceId === 'mazet' ? 'Kuliah' : 'Sekolah', icon: CalendarClock },
    { to: '/ai', label: 'FAZET AI', icon: Sparkles },
    { to: '/my-minee', label: 'My Minee', icon: Heart },
  ];

  return (
    <div className={`grid grid-cols-4 ${showTka ? 'md:grid-cols-8' : 'md:grid-cols-7'} gap-2.5`}>
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <Link
            key={act.to}
            to={act.to}
            className="group flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-[var(--tf-bg-surface)] border border-[var(--tf-border)] hover:border-[var(--tf-accent)]/50 hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--tf-bg-subtle)] text-[var(--tf-text-secondary)] group-hover:bg-[var(--tf-accent-soft)] group-hover:text-[var(--tf-accent)] transition-colors">
              <Icon size={17} strokeWidth={1.75} />
            </div>
            <span className="text-xs font-medium text-[var(--tf-text-primary)] group-hover:text-[var(--tf-accent)] transition-colors">
              {act.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const { profile } = useAuth();
  const { workspace, workspaceId } = useWorkspace();
  const { dashboard } = useAppConfig();
  const RELATIONSHIP_START = dashboard.relationshipStart;
  const BIRTHDAYS = dashboard.birthdays;
  const { items: schedule } = useSchedule();
  const { tasks } = useTasks();
  const { streak } = useFocusStreak();
  const [now, setNow] = useState(() => new Date());
  const [taskOpen, setTaskOpen] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const tutoring = useFathurTutoringSchedule(now);
  const tomorrowDay = useMemo(() => dayAfter(now), [now]);

  const tomorrowDateString = new Date(now.getTime() + 86400000).toISOString().slice(0, 10);
  const tomorrowTasks = useMemo(() => {
    return tasks.filter((t) => t.dueDate === tomorrowDateString && t.status !== 'completed');
  }, [tasks, tomorrowDateString]);

  const tomorrowSubjects = useMemo(() => {
    const unique: string[] = [];
    for (const item of schedule) {
      if (item.day !== tomorrowDay || item.type !== 'subject' || !item.active) continue;
      const subject = item.subject.trim();
      if (
        !unique.includes(subject) &&
        !subject.toLowerCase().includes('istirahat') &&
        !subject.toLowerCase().includes('sholat')
      ) {
        unique.push(subject);
      }
    }
    return unique;
  }, [schedule, tomorrowDay]);

  const todayTutoring = useMemo(() => {
    return tutoring.items.filter((item) => item.scheduleDate === now.toISOString().slice(0, 10));
  }, [tutoring.items, now]);

  const todayTimeline = useMemo(() => {
    const isPast18 = now.getHours() >= 18;
    const tomorrowDate = new Date(now);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const nextDay = jakartaWeekday(tomorrowDate);
    const targetDay = isPast18 ? nextDay : jakartaWeekday(now);

    const todayItems = schedule
      .filter((item) => item.active && item.day === targetDay)
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
  }, [now, schedule]);

  const firstName = profile?.name?.split(' ')[0] || workspace.name;
  const currentMinutes = minutes(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(now)
  );

  const relationshipStart = useMemo(
    () =>
      localDate(
        RELATIONSHIP_START.year,
        RELATIONSHIP_START.month,
        RELATIONSHIP_START.day,
        RELATIONSHIP_START.hour,
        RELATIONSHIP_START.minute
      ),
    [RELATIONSHIP_START]
  );
  const relationshipAnniversary = useMemo(() => nextAnniversary(now), [now]);
  const relationshipElapsed = useMemo(() => elapsedParts(relationshipStart, now), [relationshipStart, now]);
  const anniversaryCountdown = useMemo(() => countdownParts(relationshipAnniversary, now), [relationshipAnniversary, now]);
  const birthdayCountdowns = useMemo(
    () =>
      BIRTHDAYS.map((birthday) => ({
        ...birthday,
        target: nextBirthday(birthday.month, birthday.day, now),
        countdown: countdownParts(nextBirthday(birthday.month, birthday.day, now), now),
      })),
    [now, BIRTHDAYS]
  );

  const greetingTime =
    now.getHours() < 11 ? 'Pagi' : now.getHours() < 15 ? 'Siang' : now.getHours() < 18 ? 'Sore' : 'Malam';

  return (
    <div className="studio-page space-y-7 sm:space-y-8 fade-up pb-20">
      {/* 1. Executive Editorial Greeting Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--tf-border)] pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <span className="studio-eyebrow">
              <span>FAZET Studio</span>
              <span>&bull;</span>
              <span>{workspace.name}</span>
            </span>
            {streak.currentStreak > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[var(--tf-accent-soft)] text-[var(--tf-accent)] border border-[var(--tf-accent)]/20">
                <Flame size={11} />
                <span>Streak {streak.currentStreak} Hari</span>
              </span>
            )}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-[var(--tf-text-primary)]">
            Selamat {greetingTime}, {firstName}.
          </h1>
          <p className="text-xs sm:text-sm text-[var(--tf-text-muted)] mt-1">
            {new Intl.DateTimeFormat('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              timeZone: 'Asia/Jakarta',
            }).format(now)}{' '}
            &mdash; Semoga harimu berjalan terarah dan penuh ketenangan.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--tf-bg-surface)] border border-[var(--tf-border)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--tf-accent)]" />
            <span className="font-mono text-xs font-medium text-[var(--tf-text-primary)]">
              {two(now.getHours())}:{two(now.getMinutes())}:{two(now.getSeconds())} WIB
            </span>
          </div>

          <Link
            to="/focus"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] hover:border-[var(--tf-accent)]/40 text-xs font-medium text-[var(--tf-text-primary)] transition-colors"
          >
            <Timer size={14} className="text-[var(--tf-accent)]" />
            <span>Fokus</span>
          </Link>

          <Button size="sm" onClick={() => setTaskOpen(true)} icon={<ListTodo size={14} />}>
            Tugas Baru
          </Button>
        </div>
      </section>

      {/* 2. Quick Navigation Dock */}
      <RandomMotion delayIndex={0}>
        <QuickActions />
      </RandomMotion>

      {/* 3. Finance Summary & Daily Editorial Quote */}
      <RandomMotion delayIndex={0}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-7">
            <FinanceQuickCard />
          </div>
          <div className="lg:col-span-5">
            <DailyQuote />
          </div>
        </div>
      </RandomMotion>

      {/* 4. Daily Habit & Focus Sprint */}
      <RandomMotion delayIndex={0}>
        <DailyHabitTrackerCard />
      </RandomMotion>

      {/* 5. Jadwal Sholat & Ibadah */}
      <RandomMotion delayIndex={1}>
        <JadwalSholat />
      </RandomMotion>

      {/* 6. Digital ID Banner & AI Intelligence Row */}
      <RandomMotion delayIndex={1}>
        <div className="space-y-5">
          <DigitalIdCardBanner />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AiBriefing firstName={firstName} tasks={tasks} tomorrowSubjects={tomorrowSubjects} />
            <AiPulseCard
              tomorrowSubjects={tomorrowSubjects}
              tomorrowDay={tomorrowDay}
              academicTimeline={todayTimeline}
              tutoring={todayTutoring}
            />
          </div>
        </div>
      </RandomMotion>

      {/* 7. Dual-Column Bento: Academic Timeline & Relationship Editorial */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7/8 cols): Academic & Schedule */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <RandomMotion delayIndex={0}>
            <TKADashboard />
          </RandomMotion>

          <RandomMotion delayIndex={1}>
            <Card className="p-5 sm:p-6 overflow-hidden border border-[var(--tf-border)] bg-[var(--tf-bg-surface)]">
              <div className="flex items-center justify-between border-b border-[var(--tf-border)] pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--tf-accent-soft)] text-[var(--tf-accent)] border border-[var(--tf-accent)]/20">
                    <CalendarClock size={17} strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="studio-eyebrow">Agenda Akademik</div>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-[var(--tf-text-primary)]">
                      {now.getHours() >= 18
                        ? workspaceId === 'mazet'
                          ? 'Jadwal Kuliah Besok'
                          : 'Jadwal Sekolah Besok'
                        : workspaceId === 'mazet'
                          ? 'Jadwal Kuliah Hari Ini'
                          : 'Jadwal Sekolah Hari Ini'}
                    </h3>
                  </div>
                </div>
                <Link
                  to="/schedule"
                  className="text-xs font-medium text-[var(--tf-text-secondary)] hover:text-[var(--tf-accent)] inline-flex items-center gap-1 transition-colors"
                >
                  <span>Selengkapnya</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              <CurrentSubjectAlert />

              {tomorrowTasks.length > 0 && (
                <div className="mb-5 rounded-xl bg-[var(--tf-warning-bg)] p-4 border border-[var(--tf-warning)]/25">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--tf-warning)] flex items-center gap-1.5">
                      <AlertTriangle size={13} /> Tenggat Tugas Besok
                    </span>
                    <Badge variant="warning" size="sm">
                      {tomorrowTasks.length} Tugas
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {tomorrowTasks.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between text-xs sm:text-sm bg-[var(--tf-bg-surface)] p-2.5 rounded-lg border border-[var(--tf-border)]"
                      >
                        <span className="font-medium text-[var(--tf-text-primary)]">{t.title}</span>
                        <span className="text-xs text-[var(--tf-text-muted)] font-mono">{t.dueTime || '23:59'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {todayTutoring.length > 0 && (
                <div className="mb-5 rounded-xl bg-[var(--tf-bg-subtle)] p-4 border border-[var(--tf-border)]">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--tf-accent)] flex items-center gap-1.5">
                      <GraduationCap size={14} /> Jadwal Les Hari Ini
                    </span>
                    <Badge variant="neutral" size="sm">
                      {todayTutoring.length} Sesi
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {todayTutoring.map((t, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center text-xs sm:text-sm bg-[var(--tf-bg-surface)] p-2.5 rounded-lg border border-[var(--tf-border)]"
                      >
                        <span className="font-medium text-[var(--tf-text-primary)]">{t.subjectName}</span>
                        <span className="text-[var(--tf-accent)] font-mono text-xs font-medium">{t.startTimeLabel}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                {todayTimeline.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[var(--tf-border)] p-8 text-center text-xs sm:text-sm text-[var(--tf-text-muted)]">
                    Tidak ada sesi pelajaran aktif yang terjadwal saat ini. Gunakan waktu untuk istirahat atau belajar mandiri.
                  </div>
                ) : (
                  <div className="relative space-y-3 pl-6 sm:pl-7">
                    <div className="absolute bottom-2 left-2 sm:left-2.5 top-2 w-px bg-[var(--tf-border)]" />
                    {todayTimeline.map((item, index) => {
                      const isPast18 = now.getHours() >= 18;
                      const atStart = minutes(item.startTime);
                      const atEnd = minutes(item.endTime);
                      const isNow = !isPast18 && currentMinutes >= atStart && currentMinutes <= atEnd;
                      const past = !isPast18 && currentMinutes > atEnd;

                      return (
                        <div key={`${item.id}-${index}`} className="relative group">
                          <span
                            className={`absolute -left-[21px] sm:-left-[23px] top-4 h-2.5 w-2.5 rounded-full border transition-all ${
                              isNow
                                ? 'border-[var(--tf-accent)] bg-[var(--tf-accent)] ring-4 ring-[var(--tf-accent)]/20'
                                : past
                                  ? 'border-[var(--tf-border)] bg-[var(--tf-text-muted)] opacity-50'
                                  : 'border-[var(--tf-accent)] bg-[var(--tf-bg-surface)]'
                            }`}
                          />
                          <div
                            className={`rounded-xl border p-4 transition-all ${
                              isNow
                                ? 'border-[var(--tf-accent)] bg-[var(--tf-accent-soft)]'
                                : past
                                  ? 'border-[var(--tf-border)] bg-[var(--tf-bg-subtle)]/40 opacity-75'
                                  : 'border-[var(--tf-border)] bg-[var(--tf-bg-surface)] hover:border-[var(--tf-accent)]/40'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <span
                                    className={`font-mono text-[11px] font-medium px-2 py-0.5 rounded-md ${
                                      isNow
                                        ? 'bg-[var(--tf-accent)] text-[var(--tf-on-accent)]'
                                        : 'bg-[var(--tf-bg-subtle)] text-[var(--tf-text-muted)]'
                                    }`}
                                  >
                                    {item.startTime} &ndash; {item.endTime}
                                  </span>
                                  {isNow && (
                                    <Badge variant="primary" size="sm">
                                      Berlangsung
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm sm:text-base font-semibold text-[var(--tf-text-primary)] truncate">
                                  {item.subject}
                                </div>
                                {item.teacher && (
                                  <div className="mt-0.5 text-xs text-[var(--tf-text-muted)] flex items-center gap-1.5">
                                    <UserRound size={12} /> {item.teacher}
                                  </div>
                                )}
                              </div>
                              {item.location && (
                                <span className="self-start sm:self-center text-xs font-medium px-2.5 py-1 rounded-lg bg-[var(--tf-bg-subtle)] text-[var(--tf-text-secondary)] border border-[var(--tf-border)]">
                                  {item.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </RandomMotion>
        </div>

        {/* Right Column (4/5 cols): Quiet Luxury Relationship Hub & Milestones */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <Card className="overflow-hidden p-0 border border-[var(--tf-border)] bg-[var(--tf-bg-surface)]">
            <div className="p-6">
              <div className="studio-eyebrow">
                <CalendarHeart size={12} />
                <span>Catatan Perjalanan</span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-[var(--tf-text-primary)]">
                    Fathur <span className="italic text-[var(--tf-accent)]">&amp;</span> Mazet
                  </h2>
                  <p className="mt-1 text-xs text-[var(--tf-text-muted)]">
                    Sejak{' '}
                    <span className="text-[var(--tf-text-primary)] font-medium">
                      {relationshipStart.toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                      , {two(relationshipStart.getHours())}:{two(relationshipStart.getMinutes())} WIB
                    </span>
                  </p>
                </div>

                <div className="flex items-center -space-x-2">
                  <div className="romantic-avatar">F</div>
                  <div className="romantic-avatar">M</div>
                </div>
              </div>

              {/* Elapsed Time Pillars */}
              <div className="mt-5 grid grid-cols-3 gap-2.5">
                <div className="rounded-xl p-3 text-center bg-[var(--tf-bg-subtle)] border border-[var(--tf-border)]">
                  <strong className="block font-mono text-xl sm:text-2xl font-semibold text-[var(--tf-text-primary)]">
                    {relationshipElapsed.days}
                  </strong>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--tf-text-muted)]">Hari</span>
                </div>
                <div className="rounded-xl p-3 text-center bg-[var(--tf-bg-subtle)] border border-[var(--tf-border)]">
                  <strong className="block font-mono text-xl sm:text-2xl font-semibold text-[var(--tf-text-primary)]">
                    {two(relationshipElapsed.hours)}
                  </strong>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--tf-text-muted)]">Jam</span>
                </div>
                <div className="rounded-xl p-3 text-center bg-[var(--tf-bg-subtle)] border border-[var(--tf-border)]">
                  <strong className="block font-mono text-xl sm:text-2xl font-semibold text-[var(--tf-text-primary)]">
                    {two(relationshipElapsed.minutes)}
                  </strong>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--tf-text-muted)]">Menit</span>
                </div>
              </div>
            </div>

            {/* Anniversary Countdown */}
            <div className="border-t border-[var(--tf-border)] bg-[var(--tf-bg-subtle)]/50 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="studio-eyebrow">
                  <Heart size={12} />
                  <span>Menuju Anniversary</span>
                </div>
                <span className="text-[11px] font-mono font-medium text-[var(--tf-text-secondary)]">
                  2 Juni {relationshipAnniversary.getFullYear()}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { val: anniversaryCountdown.days, label: 'Hari' },
                  { val: two(anniversaryCountdown.hours), label: 'Jam' },
                  { val: two(anniversaryCountdown.minutes), label: 'Mnt' },
                  { val: two(anniversaryCountdown.seconds), label: 'Dtk', accent: true },
                ].map((unit) => (
                  <div
                    key={unit.label}
                    className={`p-2.5 rounded-xl border ${
                      unit.accent
                        ? 'bg-[var(--tf-accent-soft)] border-[var(--tf-accent)]/30 text-[var(--tf-accent)]'
                        : 'bg-[var(--tf-bg-surface)] border-[var(--tf-border)] text-[var(--tf-text-primary)]'
                    }`}
                  >
                    <strong className="block font-mono text-base sm:text-lg font-semibold">{unit.val}</strong>
                    <span className="text-[9px] uppercase tracking-[0.14em] opacity-75">{unit.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Upcoming Birthdays */}
          <div className="space-y-2.5">
            <div className="px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tf-text-muted)] flex items-center gap-1.5">
              <Cake size={12} className="text-[var(--tf-accent)]" />
              <span>Ulang Tahun Mendatang</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
              {birthdayCountdowns.map((birthday) => (
                <Card key={birthday.key} className="p-4 border border-[var(--tf-border)] bg-[var(--tf-bg-surface)]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-[var(--tf-text-primary)]">{birthday.name}</span>
                    <Badge variant="primary" size="sm">
                      {birthday.countdown.days} Hari Lagi
                    </Badge>
                  </div>
                  <div className="mt-1.5 flex items-baseline justify-between">
                    <p className="text-xs text-[var(--tf-text-muted)]">{birthday.label}</p>
                    <span className="text-xs font-mono text-[var(--tf-text-secondary)]">
                      {two(birthday.countdown.hours)}j {two(birthday.countdown.minutes)}m {two(birthday.countdown.seconds)}d
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Key Dates Summary */}
          <Card className="p-5 border border-[var(--tf-border)] bg-[var(--tf-bg-surface)]">
            <div className="studio-eyebrow mb-3">
              <CalendarHeart size={12} />
              <span>Arsip Tanggal Penting</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-[var(--tf-bg-subtle)] border border-[var(--tf-border)]">
                <span className="text-[var(--tf-text-muted)]">Awal Perjalanan</span>
                <strong className="font-medium text-[var(--tf-text-primary)]">2 Juni 2024 &bull; 18:55 WIB</strong>
              </div>
              {BIRTHDAYS.map((b) => (
                <div
                  key={b.key}
                  className="flex justify-between items-center p-2.5 rounded-xl bg-[var(--tf-bg-subtle)] border border-[var(--tf-border)]"
                >
                  <span className="text-[var(--tf-text-muted)]">Ulang Tahun {b.name}</span>
                  <strong className="font-medium text-[var(--tf-text-primary)]">{b.label}</strong>
                </div>
              ))}
            </div>
            <Link
              to="/calendar"
              className="mt-4 w-full inline-flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 rounded-xl border border-[var(--tf-border)] bg-[var(--tf-bg-subtle)] hover:border-[var(--tf-accent)]/40 text-[var(--tf-text-primary)] transition-colors"
            >
              <span>Buka Kalender Akademik</span>
              <ArrowUpRight size={13} />
            </Link>
          </Card>
        </div>
      </div>

      {/* 8. My Minee Gallery Preview */}
      <MineePreviewCard />

      {/* 9. Audio & Focus Lounge */}
      <div className="space-y-3">
        <div className="px-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tf-text-muted)]">
          <Tv size={13} className="text-[var(--tf-accent)]" />
          <span>Audio &amp; Focus Lounge</span>
        </div>
        <YoutubeWidget />
      </div>

      <TaskForm open={taskOpen} initial={null} onClose={() => setTaskOpen(false)} onSaved={() => setTaskOpen(false)} />
    </div>
  );
}
