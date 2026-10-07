import { useAppConfig } from '../context/AppConfigContext';
import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  CalendarClock,
  CalendarDays,
  CalendarHeart,
  Cake,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Columns3,
  FileHeart,
  Flame,
  GraduationCap,
  Heart,
  Images,
  LayoutGrid,
  ListTodo,
  MessageCircle,
  Search,
  Sparkles,
  StickyNote,
  Timer,
  Tv,
  Layers3,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import JadwalSholat from '../components/widgets/JadwalSholat';
import CountdownTKA from '../components/widgets/CountdownTKA';
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
import TaskForm from '../components/tasks/TaskForm';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { formatDate } from '../lib/utils';
import { loadThemePrefs, saveThemePrefs, type DashboardLayout } from '../lib/themePrefs';
import { supabase } from '../lib/supabase';

const SCHOOL_WEEK_DAYS: SchoolDay[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

const LAYOUTS: Array<{ id: DashboardLayout; label: string; icon: typeof LayoutGrid }> = [
  { id: 'focus', label: 'Romantis', icon: Heart },
  { id: 'bento', label: 'Bento', icon: LayoutGrid },
  { id: 'timeline', label: 'Timeline', icon: Layers3 },
  { id: 'duo', label: 'Duo', icon: Columns3 },
];

function minutes(value: string) {
  const [h, m] = value.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function dayAfter(date: Date): SchoolDay {
  const today = jakartaWeekday(date);
  const index = SCHOOL_WEEK_DAYS.indexOf(today as SchoolDay);
  return index >= 0 ? SCHOOL_WEEK_DAYS[(index + 1) % SCHOOL_WEEK_DAYS.length] : 'Senin';
}

function nextSubject(items: ScheduleItem[], now: Date) {
  const today = jakartaWeekday(now);
  const current = minutes(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(now),
  );
  return items
    .filter((item) => item.active && item.day === today && item.type === 'subject' && minutes(item.endTime) > current)
    .sort((a, b) => minutes(a.startTime) - minutes(b.startTime))[0] ?? null;
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
        }),
      );
      if (!active) return;
      setItems(rows);
      setUrls(Object.fromEntries(signed.filter(([, url]) => Boolean(url))));
      setCount(total ?? null);
      setLoading(false);
    };
    void load();
    return () => { active = false; };
  }, []);

  return (
    <Card interactive className="overflow-hidden p-0">
      <div className="border-b border-[var(--tf-border)] p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="studio-eyebrow"><Images size={13} /> My Minee</div>
            <h2 className="mt-1 text-lg font-semibold">Foto-foto perjalanan kita</h2>
            <p className="mt-1 max-w-xl text-xs leading-5 text-[var(--tf-text-muted)]">
              Preview otomatis mengambil koleksi yang tersimpan di galeri My Minee, jadi foto lama tetap ikut muncul tanpa dibundel ulang ke aplikasi.
            </p>
          </div>
          <Link to="/my-minee" className="studio-action studio-action--soft shrink-0">Buka</Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-2 p-3 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => <div key={index} className="aspect-square animate-pulse rounded-[var(--tf-radius-md)] bg-[var(--tf-bg-subtle)]" />)}
        </div>
      ) : items.length ? (
        <div className="grid grid-cols-3 gap-2 p-3 sm:grid-cols-4">
          {items.map((item) => (
            <Link key={item.id} to="/my-minee" className="group relative aspect-square overflow-hidden rounded-[var(--tf-radius-md)] bg-[var(--tf-bg-subtle)]">
              {urls[item.id] ? <img src={urls[item.id]} alt={item.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <div className="grid h-full w-full place-items-center text-[var(--tf-text-muted)]"><Heart size={20} /></div>}
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-5 text-xs leading-5 text-[var(--tf-text-muted)]">
          Koleksi foto belum dapat dipreview dari sesi ini. Halaman My Minee tetap terhubung ke galeri storage yang sama.
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-[var(--tf-border)] px-5 py-3 text-[11px] text-[var(--tf-text-muted)]">
        <span>{count == null ? 'Koleksi My Minee' : `${count} item tersimpan`}</span>
        <Link to="/my-minee" className="font-semibold text-[var(--tf-primary)]">Lihat semua</Link>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { profile } = useAuth();
  const { workspace, workspaceId } = useWorkspace();
  const { dashboard } = useAppConfig();
  const RELATIONSHIP_START = dashboard.relationshipStart;
  const BIRTHDAYS = dashboard.birthdays;
  const { items: schedule, loading: scheduleLoading } = useSchedule();
  const { tasks, loading: tasksLoading } = useTasks();
  const { streak } = useFocusStreak();
  const [now, setNow] = useState(() => new Date());
  const [taskOpen, setTaskOpen] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const tutoring = useFathurTutoringSchedule(now);
  const tomorrowDay = useMemo(() => dayAfter(now), [now]);
  
  // Tugas Besok
  const tomorrowDateString = new Date(now.getTime() + 86400000).toISOString().slice(0, 10);
  const tomorrowTasks = useMemo(() => {
    return tasks.filter(t => t.dueDate === tomorrowDateString && t.status !== 'completed');
  }, [tasks, tomorrowDateString]);

  // Jadwal Besok Harinya
  const showTomorrowSchedule = now.getHours() >= 18;
  const tomorrowSubjects = useMemo(() => {
    const unique: string[] = [];
    for (const item of schedule) {
      if (item.day !== tomorrowDay || item.type !== 'subject' || !item.active) continue;
      const subject = item.subject.trim();
      if (!unique.includes(subject) && !subject.toLowerCase().includes('istirahat') && !subject.toLowerCase().includes('sholat')) {
        unique.push(subject);
      }
    }
    return unique;
  }, [schedule, tomorrowDay]);

  // Jadwal Les Hari Ini
  const todayTutoring = useMemo(() => {
    return tutoring.items.filter(item => item.scheduleDate === now.toISOString().slice(0, 10));
  }, [tutoring.items, now]);

  // Jadwal Sekolah Hari Ini (Timeline Vertikal dengan Penggabungan)
  const todayTimeline = useMemo(() => {
    const day = jakartaWeekday(now);
    const todayItems = schedule
      .filter((item) => item.active && item.day === day)
      .sort((a, b) => minutes(a.startTime) - minutes(b.startTime));
    
    const groups: ScheduleItem[] = [];
    for (const item of todayItems) {
      if (item.type !== 'subject') continue;
      if (item.subject.toLowerCase().includes('sholat') || item.subject.toLowerCase().includes('dhuhur') || item.subject.toLowerCase().includes('jumat') || item.subject.toLowerCase().includes('ashar')) continue;
      if (item.subject.toLowerCase().includes('istirahat') || item.subject.toLowerCase().includes('upacara') || item.subject.toLowerCase().includes('literasi')) continue;

      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.subject.trim().toLowerCase() === item.subject.trim().toLowerCase()) {
        // Gabungkan karena sama (misal 3 jam pelajaran bahasa inggris kepotong istirahat)
        lastGroup.endTime = item.endTime;
      } else {
        groups.push({ ...item });
      }
    }
    return groups;
  }, [now, schedule]);

  const firstName = profile?.name?.split(' ')[0] || workspace.name;
  const currentMinutes = minutes(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false }).format(now));

  const relationshipStart = useMemo(() => localDate(RELATIONSHIP_START.year, RELATIONSHIP_START.month, RELATIONSHIP_START.day, RELATIONSHIP_START.hour, RELATIONSHIP_START.minute), [RELATIONSHIP_START]);
  const relationshipAnniversary = useMemo(() => nextAnniversary(now), [now]);
  const relationshipElapsed = useMemo(() => elapsedParts(relationshipStart, now), [relationshipStart, now]);
  const anniversaryCountdown = useMemo(() => countdownParts(relationshipAnniversary, now), [relationshipAnniversary, now]);
  const birthdayCountdowns = useMemo(() => BIRTHDAYS.map((birthday) => ({ ...birthday, target: nextBirthday(birthday.month, birthday.day, now), countdown: countdownParts(nextBirthday(birthday.month, birthday.day, now), now) })), [now, BIRTHDAYS]);

  return (
    <div className="studio-page space-y-8 fade-up pb-24">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-[var(--tf-border)] pb-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="studio-eyebrow"><Sparkles size={13} /> FAZET Studio</div>
          <div className="mt-1 flex items-center gap-2"><h2 className="studio-page-title !text-xl sm:!text-2xl">Dashboard</h2></div>
        </div>
      </div>

      {/* 1. TIMELINE VERTIKAL (TKA, Tugas Besok, Jadwal Besok, Jadwal Les, Jadwal Sekolah) */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--tf-text-secondary)] flex items-center gap-2"><Layers3 size={16} /> Timeline Hari Ini</h3>
        <Card className="p-5 overflow-hidden border border-[var(--tf-primary-subtle)]">
          <div className="mb-6"><CountdownTKA /></div>
          
          {/* Tugas Besok */}
          {tomorrowTasks.length > 0 && (
            <div className="mb-6 rounded-[var(--tf-radius-md)] bg-[var(--tf-bg-subtle)] p-4 border-l-4 border-orange-500">
              <div className="studio-eyebrow text-orange-600 mb-2">Tugas Besok</div>
              <div className="space-y-2">
                {tomorrowTasks.map(t => (
                  <div key={t.id} className="text-sm font-semibold">{t.title}</div>
                ))}
              </div>
            </div>
          )}

          {/* Jadwal Besok Harinya (Muncul di atas jam 18:00) */}
          {showTomorrowSchedule && (
            <div className="mb-6 rounded-[var(--tf-radius-md)] bg-[var(--tf-primary-subtle)]/30 p-4 border-l-4 border-[var(--tf-primary)]">
              <div className="studio-eyebrow text-[var(--tf-primary)] mb-2">Pelajaran Besok ({tomorrowDay})</div>
              <div className="flex flex-wrap gap-2">
                {tomorrowSubjects.length > 0 ? tomorrowSubjects.map(s => <Badge key={s} variant="primary">{s}</Badge>) : <span className="text-xs text-[var(--tf-text-muted)]">Kosong.</span>}
              </div>
            </div>
          )}

          {/* Jadwal Les Hari Ini */}
          {todayTutoring.length > 0 && (
            <div className="mb-6 rounded-[var(--tf-radius-md)] bg-purple-500/10 p-4 border-l-4 border-purple-500">
              <div className="studio-eyebrow text-purple-600 mb-2"><GraduationCap size={12}/> Jadwal Les Hari Ini</div>
              <div className="space-y-2">
                {todayTutoring.map((t, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="font-semibold">{t.subjectName}</span>
                    <span className="text-[var(--tf-text-muted)] font-mono">{t.startTimeLabel}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Jadwal Sekolah Vertikal */}
          <div>
            <div className="studio-eyebrow mb-4"><Clock3 size={12}/> Jadwal Sekolah</div>
            {todayTimeline.length === 0 ? (
              <div className="text-sm text-[var(--tf-text-muted)]">Tidak ada jadwal tercatat hari ini.</div>
            ) : (
              <div className="relative space-y-6 pl-8">
                <div className="absolute bottom-1 left-3 top-1 w-px bg-[var(--tf-border)]" />
                {todayTimeline.map((item, index) => { 
                  const atStart = minutes(item.startTime); 
                  const atEnd = minutes(item.endTime);
                  const isNow = currentMinutes >= atStart && currentMinutes <= atEnd; 
                  const past = currentMinutes > atEnd; 
                  
                  return (
                    <div key={`${item.id}-${index}`} className="relative group">
                      <span className={`absolute -left-[37px] top-1 h-3.5 w-3.5 rounded-full border-[3px] transition-colors ${isNow ? 'border-[var(--tf-primary-subtle)] bg-[var(--tf-primary)] shadow-[0_0_0_2px_var(--tf-primary)]' : past ? 'border-[var(--tf-border)] bg-[var(--tf-text-muted)]' : 'border-[var(--tf-border)] bg-[var(--tf-bg-surface)] group-hover:border-[var(--tf-primary)]'}`} />
                      <div className={`rounded-[var(--tf-radius-md)] border p-3.5 transition-colors ${isNow ? 'border-[var(--tf-primary)] bg-[var(--tf-primary-subtle)]/55' : past ? 'border-[var(--tf-border)] bg-[var(--tf-bg-subtle)]/45 opacity-80' : 'border-[var(--tf-border)] bg-[var(--tf-bg-surface)] hover:bg-[var(--tf-bg-subtle)]/50'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`font-mono text-xs font-bold ${isNow ? 'text-[var(--tf-primary)]' : ''}`}>{item.startTime} - {item.endTime}</span>
                              {isNow && <Badge variant="primary" size="sm" className="animate-pulse">Sedang Berlangsung</Badge>}
                            </div>
                            <div className="mt-1.5 text-base font-semibold truncate">{item.subject}</div>
                            {item.teacher && <div className="mt-0.5 text-xs text-[var(--tf-text-muted)] truncate">{item.teacher}</div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* 2. BENTO KITA (Waktu Sholat & Animasi) */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--tf-text-secondary)]">Waktu Sholat</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-2 lg:col-span-3 rounded-2xl overflow-hidden shadow-lg border border-[var(--tf-border)] bg-gradient-to-br from-[var(--tf-primary-subtle)] to-[var(--tf-bg-surface)] relative group">
            <div className="absolute inset-0 bg-[var(--tf-primary)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="p-6 relative z-10">
               <JadwalSholat />
            </div>
          </div>
        </div>
      </div>

      {/* 3. ROMANTISS (Perjalanan Kita, Ulang Tahun, My Minee) */}
      {workspaceId === 'fathur' && (
        <div className="space-y-4">
          <div className="dashboard-layout-romantic">
            <Card interactive className="overflow-hidden p-0 romantic-hero">
              <div className="romantic-hero__glow" />
              <div className="relative grid gap-0 lg:grid-cols-[minmax(0,1.2fr)_360px]">
                <div className="p-6 sm:p-8">
                  <div className="studio-eyebrow"><CalendarHeart size={14} /> Perjalanan kita</div>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <div className="romantic-avatar romantic-avatar--fathur">F</div>
                    <Heart size={20} className="romantic-heart" fill="currentColor" />
                    <div className="romantic-avatar romantic-avatar--mazet">M</div>
                  </div>
                  <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">Fathur <span className="romantic-script">&</span> Mazet</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--tf-text-muted)]">Kita mulai pada <strong className="text-[var(--tf-text-primary)]">{relationshipStart.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}, {two(relationshipStart.getHours())}:{two(relationshipStart.getMinutes())} WIB</strong>. Dashboard ini menghitung perjalanan sejak momen itu dan terus menuju anniversary berikutnya.</p>
                  <div className="mt-6 grid grid-cols-3 gap-2 sm:max-w-lg">
                    <div className="romantic-stat"><strong>{relationshipElapsed.days}</strong><span>hari</span></div>
                    <div className="romantic-stat"><strong>{two(relationshipElapsed.hours)}</strong><span>jam</span></div>
                    <div className="romantic-stat"><strong>{two(relationshipElapsed.minutes)}</strong><span>menit</span></div>
                  </div>
                </div>
                <div className="relative border-t border-[var(--tf-border)] p-6 lg:border-l lg:border-t-0 lg:p-7">
                  <div className="studio-eyebrow"><Heart size={13} /> Menuju anniversary</div>
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
                    <div className="romantic-countdown"><strong>{anniversaryCountdown.days}</strong><span>hari</span></div>
                    <div className="romantic-countdown"><strong>{two(anniversaryCountdown.hours)}</strong><span>jam</span></div>
                    <div className="romantic-countdown"><strong>{two(anniversaryCountdown.minutes)}</strong><span>menit</span></div>
                    <div className="romantic-countdown"><strong>{two(anniversaryCountdown.seconds)}</strong><span>detik</span></div>
                  </div>
                  <div className="mt-4 rounded-[var(--tf-radius-md)] bg-[var(--tf-primary-subtle)] p-3 text-[11px] leading-5 text-[var(--tf-primary)]"><strong>2 Juni {relationshipAnniversary.getFullYear()}</strong> · 18:55 WIB · satu tahun perjalanan berikutnya.</div>
                </div>
              </div>
            </Card>
            
            <div className="grid gap-4 md:grid-cols-2">
              {birthdayCountdowns.map((birthday) => (
                <Card interactive key={birthday.key} className="romantic-birthday-card h-full p-5">
                  <div className="flex items-center justify-between gap-3"><div className="studio-eyebrow"><Cake size={13} /> Ulang tahun</div><Badge variant="neutral">{birthday.target.getFullYear()}</Badge></div>
                  <div className="mt-3 flex items-end justify-between gap-4"><div><h2 className="text-xl font-semibold">{birthday.name}</h2><p className="mt-1 text-xs text-[var(--tf-text-muted)]">{birthday.label}</p></div><div className="romantic-birthday-chip">{birthday.countdown.days}<span>hari</span></div></div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-[var(--tf-radius-md)] bg-[var(--tf-bg-subtle)] p-2"><strong>{two(birthday.countdown.hours)}</strong><span>jam</span></div><div className="rounded-[var(--tf-radius-md)] bg-[var(--tf-bg-subtle)] p-2"><strong>{two(birthday.countdown.minutes)}</strong><span>menit</span></div><div className="rounded-[var(--tf-radius-md)] bg-[var(--tf-bg-subtle)] p-2"><strong>{two(birthday.countdown.seconds)}</strong><span>detik</span></div></div>
                </Card>
              ))}
            </div>
            
            <div className="grid gap-4">
              <Card interactive className="p-5">
                <div className="studio-eyebrow"><CalendarHeart size={13} /> Tanggal penting</div>
                <div className="mt-4 space-y-3">
                  <div className="romantic-date-row"><span>Hubungan</span><strong>{relationshipStart.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} —  {two(relationshipStart.getHours())}:{two(relationshipStart.getMinutes())}</strong></div>
                  {BIRTHDAYS.map(b => <div key={b.key} className="romantic-date-row"><span>Ulang tahun {b.name}</span><strong>{b.label}</strong></div>)}
                </div>
                <Link to="/calendar" className="studio-action studio-action--soft mt-5 w-full">Buka Academic Timeline</Link>
              </Card>
            </div>
          </div>
          
          <div className="mb-8">
            <MineePreviewCard />
          </div>
        </div>
      )}

      <TaskForm open={taskOpen} initial={null} onClose={() => setTaskOpen(false)} onSaved={() => setTaskOpen(false)} />
    </div>
  );
}
