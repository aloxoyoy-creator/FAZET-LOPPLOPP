import { useAppConfig } from '../context/AppConfigContext';
import { SmoothCard } from '../components/ui/Motion';
import RandomMotion from '../components/ui/RandomMotion';
import ContinuousMotion from '../components/ui/ContinuousMotion';
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
  Coffee,
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
  Target,
  UserRound,
  Wallet,
  ArrowDownRight,
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
import TaskForm from '../components/tasks/TaskForm';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { formatDate } from '../lib/utils';
import { supabase } from '../lib/supabase';

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
    <Card interactive className="overflow-hidden p-0 rounded-3xl border border-[var(--tf-border)] shadow-sm">
      <div className="border-b border-[var(--tf-border)] p-5 sm:p-6 bg-gradient-to-r from-rose-500/10 via-[var(--tf-bg-surface)] to-[var(--tf-bg-surface)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="studio-eyebrow flex items-center gap-1.5 text-rose-500 font-bold">
              <ContinuousMotion intensity="low" className="inline-block"><Images size={14} /></ContinuousMotion> My Minee • Galeri Kenangan Kita
            </div>
            <h3 className="mt-1 text-lg font-bold text-[var(--tf-text-primary)]">Momen & Foto Perjalanan Kita Berdua</h3>
            <p className="mt-0.5 text-xs text-[var(--tf-text-muted)]">
              Koleksi foto romantis yang tersimpan di cloud gallery My Minee
            </p>
          </div>
          <Link to="/my-minee" className="studio-action studio-action--soft self-start sm:self-center shrink-0 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-xs">
            <Heart size={13} fill="currentColor" /> Buka Galeri Lengkap
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 p-4 sm:p-5">
          {Array.from({ length: 8 }).map((_, index) => <div key={index} className="aspect-square animate-pulse rounded-2xl bg-[var(--tf-bg-subtle)]" />)}
        </div>
      ) : items.length ? (
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 p-4 sm:p-5">
          {items.map((item) => (
            <Link key={item.id} to="/my-minee" className="group relative aspect-square overflow-hidden rounded-2xl bg-[var(--tf-bg-subtle)] border border-[var(--tf-border)] shadow-xs">
              {urls[item.id] ? (
                <img src={urls[item.id]} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <div className="grid h-full w-full place-items-center text-[var(--tf-text-muted)]"><Heart size={16} /></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                <span className="text-[10px] text-white font-medium truncate">{item.title}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-6 text-xs text-center text-[var(--tf-text-muted)]">
          Koleksi foto belum dapat dipreview dari sesi ini. Halaman My Minee tetap terhubung ke galeri storage.
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-[var(--tf-border)] px-5 sm:px-6 py-3 text-xs text-[var(--tf-text-muted)] bg-[var(--tf-bg-subtle)]/40">
        <span>{count == null ? 'Koleksi My Minee' : `${count} foto tersimpan di galeri`}</span>
        <Link to="/my-minee" className="font-semibold text-rose-500 hover:underline flex items-center gap-1">
          Lihat semua foto →
        </Link>
      </div>
    </Card>
  );
}

function QuickActions() {
  const { workspaceId } = useWorkspace();
  const actions = [
    { to: '/tasks', label: 'Tugas', icon: ListTodo, color: 'text-blue-500', bg: 'bg-blue-500/10 group-hover:bg-blue-500/20', hoverText: 'group-hover:text-blue-600' },
    { to: '/notes', label: 'Catatan', icon: StickyNote, color: 'text-emerald-500', bg: 'bg-emerald-500/10 group-hover:bg-emerald-500/20', hoverText: 'group-hover:text-emerald-600' },
    { to: '/finance', label: 'Keuangan', icon: Wallet, color: 'text-amber-500', bg: 'bg-amber-500/10 group-hover:bg-amber-500/20', hoverText: 'group-hover:text-amber-600' },
    { to: '/lifestyle', label: 'Lifestyle', icon: Coffee, color: 'text-cyan-500', bg: 'bg-cyan-500/10 group-hover:bg-cyan-500/20', hoverText: 'group-hover:text-cyan-600' },
    { to: '/schedule', label: workspaceId === 'mazet' ? 'Kuliah' : 'Sekolah', icon: CalendarClock, color: 'text-indigo-500', bg: 'bg-indigo-500/10 group-hover:bg-indigo-500/20', hoverText: 'group-hover:text-indigo-600' },
    { to: '/ai', label: 'Tanya AI', icon: Sparkles, color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10 group-hover:bg-fuchsia-500/20', hoverText: 'group-hover:text-fuchsia-600' },
    { to: '/my-minee', label: 'My Minee', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10 group-hover:bg-rose-500/20', hoverText: 'group-hover:text-rose-600' },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2.5 sm:gap-3">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <Link
            key={act.to}
            to={act.to}
            className="group flex flex-col items-center justify-center gap-2 p-3.5 sm:p-4 rounded-2xl bg-[var(--tf-bg-surface)] border border-[var(--tf-border)] hover:border-[var(--tf-primary-subtle)] hover:shadow-md hover:-translate-y-1 active:scale-95 transition-all duration-300"
          >
            <div className={`p-2.5 rounded-2xl transition-all duration-300 ${act.bg} group-hover:scale-110`}>
              <Icon size={20} className={act.color} />
            </div>
            <span className={`text-xs font-semibold text-[var(--tf-text-primary)] transition-colors ${act.hoverText}`}>
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
  
  // Tugas Besok
  const tomorrowDateString = new Date(now.getTime() + 86400000).toISOString().slice(0, 10);
  const tomorrowTasks = useMemo(() => {
    return tasks.filter(t => t.dueDate === tomorrowDateString && t.status !== 'completed');
  }, [tasks, tomorrowDateString]);

  // Jadwal Besok Harinya
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
    const isPast18 = now.getHours() >= 18;
    const tomorrowDate = new Date(now);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowDay = jakartaWeekday(tomorrowDate);
    const targetDay = isPast18 ? tomorrowDay : jakartaWeekday(now);
    
    const todayItems = schedule
      .filter((item) => item.active && item.day === targetDay)
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

  const firstName = profile?.name?.split(' ')[0] || workspace.name;
  const currentMinutes = minutes(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false }).format(now));

  const relationshipStart = useMemo(() => localDate(RELATIONSHIP_START.year, RELATIONSHIP_START.month, RELATIONSHIP_START.day, RELATIONSHIP_START.hour, RELATIONSHIP_START.minute), [RELATIONSHIP_START]);
  const relationshipAnniversary = useMemo(() => nextAnniversary(now), [now]);
  const relationshipElapsed = useMemo(() => elapsedParts(relationshipStart, now), [relationshipStart, now]);
  const anniversaryCountdown = useMemo(() => countdownParts(relationshipAnniversary, now), [relationshipAnniversary, now]);
  const birthdayCountdowns = useMemo(() => BIRTHDAYS.map((birthday) => ({ ...birthday, target: nextBirthday(birthday.month, birthday.day, now), countdown: countdownParts(nextBirthday(birthday.month, birthday.day, now), now) })), [now, BIRTHDAYS]);

  return (
    <div className="studio-page space-y-6 sm:space-y-8 fade-up pb-24">
      {/* 1. Header Bar: Casual, Modern & Personal Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--tf-border)] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <ContinuousMotion intensity="high" className="inline-block"><Sparkles size={12} /></ContinuousMotion> FAZET Studio
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--tf-text-muted)]">
              • {workspace.name} ({workspaceId === 'mazet' ? 'Mahasiswi' : 'Siswa'})
            </span>
            {streak.currentStreak > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Flame size={11} className="fill-amber-500 text-amber-500" /> {streak.currentStreak} Hari
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--tf-text-primary)]">
            Selamat {now.getHours() < 11 ? 'Pagi' : now.getHours() < 15 ? 'Siang' : now.getHours() < 18 ? 'Sore' : 'Malam'}, {firstName}! ✨
          </h1>
          <p className="text-xs sm:text-sm text-[var(--tf-text-muted)] mt-0.5">
            {new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(now)} • Semoga harimu menyenangkan dan selalu berkah! ❤️
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[var(--tf-bg-surface)] border border-[var(--tf-border)] shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs font-bold text-[var(--tf-text-primary)]">
              {two(now.getHours())}:{two(now.getMinutes())}:{two(now.getSeconds())} WIB
            </span>
          </div>

          <Button
            size="sm"
            onClick={() => setTaskOpen(true)}
            icon={<ListTodo size={15} />}
            className="rounded-2xl shadow-sm"
          >
            + Tugas
          </Button>
        </div>
      </div>

      {/* 2. Daily Quote */}
      <RandomMotion delayIndex={0}><DailyQuote /></RandomMotion>

      {/* 3. Quick Actions Menu (7 Buttons) */}
      <RandomMotion delayIndex={0}><QuickActions /></RandomMotion>

      {/* 3.1 Finance Quick Card */}
      <RandomMotion delayIndex={0}><FinanceQuickCard /></RandomMotion>

      {/* 4. WAKTU SHOLAT & IBADAH (PALING ATAS SESUAI PERMINTAAN USER) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--tf-text-secondary)]">
            <Clock3 size={15} className="text-emerald-500" />
            <span>Waktu Sholat & Ibadah ({workspaceId === 'fathur' ? 'Tuban' : 'Tasikmalaya'})</span>
          </div>
          <Link to="/lifestyle" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
            Buka Jadwal Lengkap →
          </Link>
        </div>
        <div className="rounded-3xl overflow-hidden shadow-sm border border-[var(--tf-border)] bg-gradient-to-br from-emerald-500/10 via-[var(--tf-bg-surface)] to-[var(--tf-bg-surface)] p-5 sm:p-6">
          <RandomMotion delayIndex={1}><JadwalSholat /></RandomMotion>
        </div>
      </div>

      {/* 5. Digital ID Banner & AI Assistants */}
      <RandomMotion delayIndex={1}>
        <div className="space-y-4">
          <DigitalIdCardBanner />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AiBriefing firstName={firstName} tasks={tasks} tomorrowSubjects={tomorrowSubjects} />
            <AiPulseCard tomorrowSubjects={tomorrowSubjects} tomorrowDay={tomorrowDay} academicTimeline={todayTimeline} tutoring={todayTutoring} />
          </div>
        </div>
      </RandomMotion>

      {/* 6. TATA LETAK BENTO DUAL-COLUMN (AKADEMIK & ROMANTIS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* KOLOM KIRI (7-8 Kolom): AKADEMIK, JADWAL & TUGAS */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          
          {/* A. TKA Dashboard (Target & Countdown TKA) */}
          <RandomMotion delayIndex={0}>
            <TKADashboard />
          </RandomMotion>

          {/* B. Agenda & Timeline Pelajaran Hari Ini / Besok */}
          <RandomMotion delayIndex={1}>
            <Card className="p-5 sm:p-6 overflow-hidden border border-[var(--tf-border)] shadow-sm rounded-3xl bg-[var(--tf-bg-surface)] backdrop-blur-md">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-[var(--tf-border)] pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-500">
                    <CalendarClock size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[var(--tf-text-primary)]">
                      {now.getHours() >= 18 ? (workspaceId === 'mazet' ? "Agenda Kuliah Besok" : "Agenda Sekolah Besok") : (workspaceId === 'mazet' ? "Agenda Kuliah Hari Ini" : "Agenda Sekolah Hari Ini")}
                    </h3>
                    <p className="text-xs text-[var(--tf-text-muted)]">
                      {new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeZone: 'Asia/Jakarta' }).format(now)}
                    </p>
                  </div>
                </div>
                <Link to="/schedule" className="text-xs font-semibold text-[var(--tf-primary)] hover:underline flex items-center gap-1">
                  Lihat Semua <ChevronRight size={14} />
                </Link>
              </div>

              {/* Status Pelajaran (Jam/Menit/Detik menuju pelajaran berikutnya) */}
              <CurrentSubjectAlert />
              
              {/* Tugas Besok */}
              {tomorrowTasks.length > 0 && (
                <div className="mb-6 rounded-2xl bg-amber-500/10 p-4 border-l-4 border-amber-500">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle size={13} /> Tugas Deadline Besok
                    </span>
                    <Badge variant="warning" size="sm">{tomorrowTasks.length} Tugas</Badge>
                  </div>
                  <div className="space-y-2">
                    {tomorrowTasks.map(t => (
                      <div key={t.id} className="flex items-center justify-between text-sm bg-white/60 dark:bg-slate-900/40 p-2.5 rounded-xl border border-amber-200/40 dark:border-amber-900/30">
                        <span className="font-semibold text-slate-800 dark:text-slate-100">{t.title}</span>
                        <span className="text-xs text-amber-700 dark:text-amber-300 font-mono font-medium">{t.dueTime || '23:59'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Jadwal Les Hari Ini */}
              {todayTutoring.length > 0 && (
                <div className="mb-6 rounded-2xl bg-purple-500/10 p-4 border-l-4 border-purple-500">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                      <GraduationCap size={14}/> Jadwal Les Hari Ini
                    </span>
                    <Badge variant="neutral" size="sm">{todayTutoring.length} Sesi</Badge>
                  </div>
                  <div className="space-y-2">
                    {todayTutoring.map((t, i) => (
                      <div key={i} className="flex justify-between items-center text-sm bg-white/60 dark:bg-slate-900/40 p-2.5 rounded-xl border border-purple-200/40 dark:border-purple-900/30">
                        <span className="font-semibold">{t.subjectName}</span>
                        <span className="text-purple-600 dark:text-purple-400 font-mono font-medium">{t.startTimeLabel}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Jadwal Sekolah/Kuliah Vertikal */}
              <div>
                {todayTimeline.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[var(--tf-border)] p-6 text-center text-sm text-[var(--tf-text-muted)]">
                    Tidak ada jam pelajaran aktif yang tercatat hari ini. Selamat beristirahat atau belajar mandiri! ✨
                  </div>
                ) : (
                  <div className="relative space-y-4 pl-6 sm:pl-8">
                    <div className="absolute bottom-2 left-2.5 sm:left-3.5 top-2 w-0.5 bg-gradient-to-b from-[var(--tf-primary)] via-[var(--tf-border)] to-transparent" />
                    {todayTimeline.map((item, index) => { 
                      const isPast18 = now.getHours() >= 18;
                      const atStart = minutes(item.startTime); 
                      const atEnd = minutes(item.endTime);
                      const isNow = !isPast18 && currentMinutes >= atStart && currentMinutes <= atEnd; 
                      const past = !isPast18 && currentMinutes > atEnd; 
                      
                      return (
                        <div key={`${item.id}-${index}`} className="relative group transition-all duration-300 hover:-translate-y-0.5">
                          <span className={`absolute -left-[27px] sm:-left-[31px] top-3.5 h-3.5 w-3.5 rounded-full border-2 transition-all duration-300 ${isNow ? 'border-white dark:border-slate-900 bg-[var(--tf-primary)] ring-4 ring-[var(--tf-primary)]/20 animate-pulse' : past ? 'border-[var(--tf-border)] bg-[var(--tf-text-muted)] opacity-60' : 'border-[var(--tf-border)] bg-[var(--tf-bg-surface)] group-hover:border-[var(--tf-primary)]'}`} />
                          <div className={`rounded-2xl border p-4 transition-all duration-300 group-hover:shadow-md ${isNow ? 'border-[var(--tf-primary)] bg-[var(--tf-primary-subtle)]/60 shadow-sm' : past ? 'border-[var(--tf-border)] bg-[var(--tf-bg-subtle)]/40 opacity-75' : 'border-[var(--tf-border)] bg-[var(--tf-bg-surface)] hover:bg-[var(--tf-bg-subtle)]/50'}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <span className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg ${isNow ? 'bg-[var(--tf-primary)] text-white' : 'bg-[var(--tf-bg-subtle)] text-[var(--tf-text-muted)]'}`}>
                                    {item.startTime} - {item.endTime}
                                  </span>
                                  {isNow && <Badge variant="primary" size="sm" className="animate-pulse">Sedang Berlangsung</Badge>}
                                </div>
                                <div className="text-base font-bold text-[var(--tf-text-primary)] truncate group-hover:text-[var(--tf-primary)] transition-colors">
                                  {item.subject}
                                </div>
                                {item.teacher && (
                                  <div className="mt-0.5 text-xs text-[var(--tf-text-muted)] flex items-center gap-1.5">
                                    <UserRound size={12} /> {item.teacher}
                                  </div>
                                )}
                              </div>
                              {item.location && (
                                <span className="self-start sm:self-center text-xs font-semibold px-2.5 py-1 rounded-xl bg-[var(--tf-bg-subtle)] text-[var(--tf-text-muted)] border border-[var(--tf-border)]">
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

        {/* KOLOM KANAN (4-5 Kolom): HUB ROMANTIS, ANNIVERSARY & ULANG TAHUN */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          
          {/* A. Romantic Hero Card */}
          <SmoothCard className="overflow-hidden p-0 romantic-hero rounded-3xl border border-[var(--tf-border)] shadow-sm">
            <div className="romantic-hero__glow" />
            <div className="p-6 sm:p-7">
              <div className="studio-eyebrow flex items-center gap-1.5 text-rose-500 font-bold">
                <CalendarHeart size={14} /> Perjalanan Kita
              </div>
              
              <div className="mt-4 flex items-center gap-3">
                <div className="romantic-avatar romantic-avatar--fathur transition-transform hover:scale-110 shadow-md">F</div>
                <Heart size={22} className="romantic-heart animate-pulse text-rose-500" fill="currentColor" />
                <div className="romantic-avatar romantic-avatar--mazet transition-transform hover:scale-110 shadow-md">M</div>
              </div>

              <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
                Fathur <span className="romantic-script text-rose-500">&</span> Mazet
              </h2>
              <p className="mt-2 text-xs leading-5 text-[var(--tf-text-muted)]">
                Dimulai sejak <strong className="text-[var(--tf-text-primary)]">{relationshipStart.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}, {two(relationshipStart.getHours())}:{two(relationshipStart.getMinutes())} WIB</strong>.
              </p>

              {/* Elapsed Time Pills */}
              <div className="mt-5 grid grid-cols-3 gap-2">
                <div className="romantic-stat rounded-2xl p-2.5 text-center bg-white/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50">
                  <strong className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">{relationshipElapsed.days}</strong>
                  <span className="text-[10px] uppercase font-bold text-[var(--tf-text-muted)]">hari</span>
                </div>
                <div className="romantic-stat rounded-2xl p-2.5 text-center bg-white/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50">
                  <strong className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">{two(relationshipElapsed.hours)}</strong>
                  <span className="text-[10px] uppercase font-bold text-[var(--tf-text-muted)]">jam</span>
                </div>
                <div className="romantic-stat rounded-2xl p-2.5 text-center bg-white/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50">
                  <strong className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">{two(relationshipElapsed.minutes)}</strong>
                  <span className="text-[10px] uppercase font-bold text-[var(--tf-text-muted)]">menit</span>
                </div>
              </div>
            </div>

            {/* Anniversary Countdown Section */}
            <div className="border-t border-[var(--tf-border)] bg-rose-50/40 dark:bg-rose-950/20 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="studio-eyebrow text-rose-600 flex items-center gap-1.5 font-bold">
                  <ContinuousMotion intensity="high" className="inline-block"><Heart size={13} fill="currentColor" /></ContinuousMotion> Menuju Anniversary
                </div>
                <span className="text-[11px] font-mono font-bold text-rose-500">2 Juni</span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-rose-200/40 dark:border-rose-900/30">
                  <strong className="block text-base sm:text-lg font-black text-slate-900 dark:text-white">{anniversaryCountdown.days}</strong>
                  <span className="text-[10px] uppercase font-semibold text-[var(--tf-text-muted)]">Hari</span>
                </div>
                <div className="p-2 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-rose-200/40 dark:border-rose-900/30">
                  <strong className="block text-base sm:text-lg font-black text-slate-900 dark:text-white">{two(anniversaryCountdown.hours)}</strong>
                  <span className="text-[10px] uppercase font-semibold text-[var(--tf-text-muted)]">Jam</span>
                </div>
                <div className="p-2 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-rose-200/40 dark:border-rose-900/30">
                  <strong className="block text-base sm:text-lg font-black text-slate-900 dark:text-white">{two(anniversaryCountdown.minutes)}</strong>
                  <span className="text-[10px] uppercase font-semibold text-[var(--tf-text-muted)]">Mnt</span>
                </div>
                <div className="p-2 rounded-2xl bg-rose-500/10 border border-rose-300/50 dark:border-rose-800/50">
                  <strong className="block text-base sm:text-lg font-black text-rose-600 dark:text-rose-400 animate-pulse">{two(anniversaryCountdown.seconds)}</strong>
                  <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">Detik</span>
                </div>
              </div>

              <div className="mt-3.5 rounded-2xl bg-rose-100/60 dark:bg-rose-900/30 p-2.5 text-[11px] leading-relaxed text-rose-800 dark:text-rose-200 text-center font-medium">
                ✨ <strong>2 Juni {relationshipAnniversary.getFullYear()}</strong> • 18:55 WIB • Satu tahun perjalanan berikutnya.
              </div>
            </div>
          </SmoothCard>

          {/* B. Birthday Countdowns */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--tf-text-secondary)]">
              <Cake size={13} className="text-amber-500" />
              <span>Ulang Tahun Mendatang</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {birthdayCountdowns.map((birthday) => (
                <Card interactive key={birthday.key} className="romantic-birthday-card p-4 rounded-2xl border border-[var(--tf-border)] shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="studio-eyebrow flex items-center gap-1 font-bold"><Cake size={12} /> {birthday.name}</div>
                    <Badge variant="neutral" size="sm">{birthday.countdown.days} Hari Lagi</Badge>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <p className="text-xs text-[var(--tf-text-muted)] font-medium">{birthday.label}</p>
                    <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                      {two(birthday.countdown.hours)}j {two(birthday.countdown.minutes)}m {two(birthday.countdown.seconds)}s
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* C. Tanggal Penting Card */}
          <Card interactive className="p-5 rounded-3xl border border-[var(--tf-border)] shadow-sm">
            <div className="studio-eyebrow flex items-center gap-1.5 text-indigo-500 font-bold">
              <CalendarHeart size={14} /> Tanggal Penting Kita
            </div>
            <div className="mt-3 space-y-2.5 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-2xl bg-[var(--tf-bg-subtle)]">
                <span className="text-[var(--tf-text-muted)]">Mulai Hubungan</span>
                <strong className="text-[var(--tf-text-primary)]">2 Juni 2024 (18:55 WIB)</strong>
              </div>
              {BIRTHDAYS.map(b => (
                <div key={b.key} className="flex justify-between items-center p-2.5 rounded-2xl bg-[var(--tf-bg-subtle)]">
                  <span className="text-[var(--tf-text-muted)]">Ultah {b.name}</span>
                  <strong className="text-[var(--tf-text-primary)]">{b.label}</strong>
                </div>
              ))}
            </div>
            <Link to="/calendar" className="studio-action studio-action--soft mt-4 w-full justify-center text-center text-xs font-bold py-2.5 rounded-2xl">
              Buka Academic Timeline →
            </Link>
          </Card>

        </div>
      </div>

      {/* 7. MY MINEE (TENGAH SESUAI PERMINTAAN USER) */}
      <div className="space-y-3">
        <MineePreviewCard />
      </div>

      {/* 8. HIBURAN & FOKUS BELAJAR (YOUTUBE) (PALING BAWAH SESUAI PERMINTAAN USER) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--tf-text-secondary)]">
          <Tv size={15} className="text-indigo-500" />
          <span>Hiburan & Fokus Belajar (YouTube)</span>
        </div>
        <YoutubeWidget />
      </div>

      {/* Task Modal Form */}
      <TaskForm open={taskOpen} initial={null} onClose={() => setTaskOpen(false)} onSaved={() => setTaskOpen(false)} />
    </div>
  );
}
