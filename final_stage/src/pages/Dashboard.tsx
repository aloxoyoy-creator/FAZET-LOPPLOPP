import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, BarChart3, Bell, BookOpen, CalendarClock, CalendarDays, CheckCircle2, ChevronRight, Clock3, Columns3, FileHeart, Flame, GraduationCap, LayoutGrid, ListTodo, MessageCircle, Plus, Search, Sparkles, StickyNote, Timer, Tv, Layers3 } from 'lucide-react';
import { Link } from 'react-router-dom';
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
import TogetherCard from '../components/dashboard/TogetherCard';
import AiPulseCard from '../components/dashboard/AiPulseCard';
import TaskForm from '../components/tasks/TaskForm';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { formatDate } from '../lib/utils';
import { loadThemePrefs, saveThemePrefs, type DashboardLayout } from '../lib/themePrefs';

const SCHOOL_WEEK_DAYS: SchoolDay[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

const LAYOUTS: Array<{ id: DashboardLayout; label: string; icon: typeof LayoutGrid }> = [
  { id: 'focus', label: 'Fokus', icon: Timer },
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
  const current = minutes(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false }).format(now));
  return items
    .filter((item) => item.active && item.day === today && item.type === 'subject' && minutes(item.endTime) > current)
    .sort((a, b) => minutes(a.startTime) - minutes(b.startTime))[0] ?? null;
}

export default function Dashboard() {
  const { profile } = useAuth();
  const { workspace, workspaceId } = useWorkspace();
  const { items: schedule, loading: scheduleLoading } = useSchedule();
  const { tasks, loading: tasksLoading } = useTasks();
  const { streak } = useFocusStreak();
  const [now, setNow] = useState(() => new Date());
  const [taskOpen, setTaskOpen] = useState(false);
  const [layout, setLayout] = useState<DashboardLayout>(() => loadThemePrefs().dashboardLayout);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    const syncLayout = () => setLayout(loadThemePrefs().dashboardLayout);
    window.addEventListener('taskflow:theme-changed', syncLayout);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('taskflow:theme-changed', syncLayout);
    };
  }, []);

  const tutoring = useFathurTutoringSchedule(now);
  const nextTutoring = tutoring.next;
  const tomorrowDay = useMemo(() => dayAfter(now), [now]);
  const tomorrowSubjects = useMemo(() => {
    const unique: string[] = [];
    for (const item of schedule) {
      if (item.day !== tomorrowDay || item.type !== 'subject' || !item.active) continue;
      const subject = item.subject.trim();
      if (subject && !unique.includes(subject)) unique.push(subject);
    }
    return unique;
  }, [schedule, tomorrowDay]);

  const todayTimeline = useMemo(() => {
    const day = jakartaWeekday(now);
    return schedule.filter((item) => item.active && item.day === day).sort((a, b) => minutes(a.startTime) - minutes(b.startTime));
  }, [now, schedule]);

  const next = useMemo(() => nextSubject(schedule, now), [schedule, now]);
  const firstName = profile?.name?.split(' ')[0] || workspace.name;
  const dateLabel = formatDate(now.toISOString().slice(0, 10));
  const currentTime = new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now);
  const visibleTasks = useMemo(() => tasks.filter((task) => task.status !== 'completed').sort((a, b) => {
    const aTime = new Date(`${a.dueDate}T${a.dueTime || '23:59'}+07:00`).getTime();
    const bTime = new Date(`${b.dueDate}T${b.dueTime || '23:59'}+07:00`).getTime();
    return aTime - bTime;
  }).slice(0, 4), [tasks]);
  const stats = useMemo(() => {
    const nowMs = now.getTime();
    const active = tasks.filter((t) => t.status !== 'completed');
    const overdue = active.filter((t) => t.dueDate && new Date(`${t.dueDate}T${t.dueTime || '23:59'}+07:00`).getTime() < nowMs).length;
    return { active: active.length, overdue, done: tasks.length - active.length };
  }, [tasks, now]);

  const changeLayout = (nextLayout: DashboardLayout) => {
    setLayout(nextLayout);
    saveThemePrefs({ dashboardLayout: nextLayout });
  };

  const ClockHero = () => (
    <Card variant="raised" className="overflow-hidden p-0">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="studio-card--accent p-5 sm:p-7">
          <div className="studio-eyebrow"><span className="h-2 w-2 rounded-full bg-[var(--tf-primary)] shadow-[0_0_0_5px_var(--tf-primary-subtle)]" /> {workspace.name} · {workspace.eyebrow}</div>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="studio-page-title">Hai, {firstName}.</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--tf-text-muted)]">Satu ruang untuk jadwal, tugas, fokus, dan momen belajar bersama. Semua tetap terasa ringan.</p>
            </div>
            <div className="rounded-[var(--tf-radius-xl)] border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] px-4 py-3 text-right shadow-[var(--tf-shadow-flat)]">
              <div className="flex items-center justify-end gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-[var(--tf-text-muted)]"><Clock3 size={13} /> WIB</div>
              <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-[var(--tf-text-primary)] sm:text-3xl">{currentTime}</div>
              <div className="mt-1 text-[11px] text-[var(--tf-text-muted)]">{dateLabel}</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between border-t border-[var(--tf-border)] p-5 lg:border-l lg:border-t-0">
          <div>
            <div className="studio-eyebrow">Berikutnya</div>
            <div className="mt-3 text-lg font-semibold text-[var(--tf-text-primary)]">{next?.subject || 'Waktu kosong'}</div>
            <div className="mt-1 text-xs text-[var(--tf-text-muted)]">{next ? `${next.startTime}–${next.endTime} WIB` : 'Nikmati jeda tanpa agenda.'}</div>
          </div>
          <Button size="sm" variant="soft" className="mt-5 w-full" icon={<Timer size={14} />} onClick={() => window.location.assign('/focus')}>Mulai Focus Mode</Button>
        </div>
      </div>
    </Card>
  );

  const StatStrip = () => (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {[
        { to: '/tasks', icon: ListTodo, value: stats.active, label: 'Tugas aktif' },
        { to: '/tasks', icon: AlertTriangle, value: stats.overdue, label: 'Terlambat', danger: stats.overdue > 0 },
        { to: '/insights', icon: CheckCircle2, value: stats.done, label: 'Selesai' },
        { to: '/focus', icon: Flame, value: streak.currentStreak, label: `Streak · ${streak.todayMinutes}m` },
      ].map(({ to, icon: Icon, value, label, danger }) => (
        <Link key={label} to={to} className="studio-card group flex items-center gap-3 p-4 transition-transform hover:-translate-y-0.5">
          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-[var(--tf-radius-md)] ${danger ? 'bg-[var(--tf-danger-bg)] text-[var(--tf-danger)]' : 'bg-[var(--tf-primary-subtle)] text-[var(--tf-primary)]'}`}><Icon size={17} /></div>
          <div className="min-w-0"><div className="text-xl font-bold tabular-nums text-[var(--tf-text-primary)]">{value}</div><div className="truncate text-[11px] text-[var(--tf-text-muted)]">{label}</div></div>
          <ChevronRight className="ml-auto shrink-0 text-[var(--tf-text-muted)] transition-transform group-hover:translate-x-0.5" size={15} />
        </Link>
      ))}
    </div>
  );

  const QuickActions = () => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[
        ['/notes', 'Catatan', StickyNote], ['/focus', 'Focus Mode', Timer], ['/timebox', 'TimeBox', Clock3], ['/mediabox', 'MediaBox', Tv],
        ['/ai', 'FAZET AI', Sparkles], ['/chat', 'Ruang Kita', MessageCircle], ['/search', 'Cari', Search], ['/notifications', 'Notifikasi', Bell],
      ].map(([to, label, Icon]) => <Link key={to as string} to={to as string} className="studio-card group flex min-h-[72px] items-center gap-3 p-3.5 hover:-translate-y-0.5"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--tf-radius-md)] bg-[var(--tf-bg-subtle)] text-[var(--tf-text-secondary)] group-hover:text-[var(--tf-primary)]"><Icon size={17} /></span><span className="text-xs font-semibold text-[var(--tf-text-primary)]">{label as string}</span></Link>)}
    </div>
  );

  const AgendaCard = () => (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--tf-border)] pb-3"><div><div className="studio-eyebrow"><CalendarClock size={13} /> Agenda</div><h2 className="mt-1 text-lg font-semibold">Hari ini</h2></div><Link to="/calendar" className="studio-action studio-action--soft">Lihat semua <ArrowRight size={14} /></Link></div>
      <div className="mt-4 space-y-2.5">{scheduleLoading ? <div className="py-8 text-center text-xs text-[var(--tf-text-muted)]">Memuat agenda…</div> : todayTimeline.length ? todayTimeline.slice(0, 5).map((item, index) => <div key={`${item.id}-${index}`} className="flex items-start gap-3 rounded-[var(--tf-radius-md)] bg-[var(--tf-bg-subtle)]/65 p-3"><span className="mt-1 h-9 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: 'var(--tf-primary)' }} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-bold text-[var(--tf-text-primary)]">{item.startTime}</span>{index === 0 && <Badge variant="success" size="sm">Berikutnya</Badge>}</div><div className="mt-1 truncate text-xs font-semibold text-[var(--tf-text-primary)]">{item.subject}</div><div className="mt-0.5 truncate text-[11px] text-[var(--tf-text-muted)]">{item.subject} · {item.teacher || item.location || 'Agenda sekolah'}</div></div><span className="text-[10px] text-[var(--tf-text-muted)]">{item.endTime}</span></div>) : <div className="py-8 text-center text-xs text-[var(--tf-text-muted)]">Tidak ada agenda untuk hari ini.</div>}</div>
    </Card>
  );

  const TaskCard = () => (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--tf-border)] pb-3"><div><div className="studio-eyebrow"><ListTodo size={13} /> Tugas</div><h2 className="mt-1 text-lg font-semibold">Yang perlu dikerjakan</h2></div><button type="button" onClick={() => setTaskOpen(true)} className="studio-action studio-action--soft inline-flex items-center gap-1.5"> <Plus size={14} /> Tambah</button></div>
      <div className="mt-4 space-y-2">{tasksLoading ? <div className="py-8 text-center text-xs text-[var(--tf-text-muted)]">Memuat tugas…</div> : visibleTasks.length ? visibleTasks.map((task) => <Link key={task.id} to={`/tasks/${task.id}`} className="group flex items-start gap-3 rounded-[var(--tf-radius-md)] border border-[var(--tf-border)] p-3 hover:bg-[var(--tf-bg-subtle)]"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${task.priority === 'high' ? 'bg-[var(--tf-danger)]' : task.priority === 'medium' ? 'bg-[var(--tf-warning)]' : 'bg-[var(--tf-success)]'}`} /><div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold text-[var(--tf-text-primary)]">{task.title}</div><div className="mt-1 text-[11px] text-[var(--tf-text-muted)]">{task.subjectName || 'Tanpa mapel'} · {task.dueDate || 'Tanpa tanggal'} {task.dueTime || ''}</div></div><ArrowRight size={14} className="mt-1 text-[var(--tf-text-muted)] opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" /></Link>) : <div className="py-8 text-center text-xs text-[var(--tf-text-muted)]">Belum ada tugas aktif.</div>}</div>
    </Card>
  );

  const DuoSummary = () => (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr_1fr]">
      <Card className="border-t-4 border-t-[var(--tf-fathur)] p-5">
        <div className="studio-eyebrow text-[var(--tf-fathur)]">Fathur Space</div>
        <h3 className="mt-1 text-lg font-semibold">Sains & Rekayasa</h3>
        <div className="mt-4 space-y-3"><div className="rounded-[var(--tf-radius-md)] bg-[var(--tf-bg-subtle)] p-3"><div className="text-2xl font-bold">{stats.active}</div><div className="text-[11px] text-[var(--tf-text-muted)]">Tugas aktif di ruang ini</div></div><div className="rounded-[var(--tf-radius-md)] bg-[var(--tf-bg-subtle)] p-3"><div className="text-sm font-semibold">{next?.subject || 'Waktu kosong'}</div><div className="mt-1 text-[11px] text-[var(--tf-text-muted)]">Agenda terdekat</div></div></div>
      </Card>
      <Card className="border-t-4 border-t-[var(--tf-lopp)] p-5">
        <div className="studio-eyebrow text-[var(--tf-lopp)]"><FileHeart size={13} /> Lopp Lopp</div>
        <h3 className="mt-1 text-lg font-semibold">Ruang bersama</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--tf-text-muted)]">Satu titik temu untuk target belajar, chat, dan momen yang ingin kalian lewati bareng.</p>
        <div className="mt-5 grid grid-cols-2 gap-2"><Link to="/chat" className="studio-action">Ruang Kita</Link><Link to="/my-minee" className="studio-action studio-action--soft">My Minee</Link></div>
      </Card>
      <Card className="border-t-4 border-t-[var(--tf-mazet)] p-5">
        <div className="studio-eyebrow text-[var(--tf-mazet)]">Mazet Space</div>
        <h3 className="mt-1 text-lg font-semibold">Biologi & Desain</h3>
        <div className="mt-4 space-y-3"><div className="rounded-[var(--tf-radius-md)] bg-[var(--tf-bg-subtle)] p-3"><div className="text-2xl font-bold">{Math.max(stats.active - (workspaceId === 'mazet' ? 0 : 1), 0)}</div><div className="text-[11px] text-[var(--tf-text-muted)]">Tugas aktif di ruang ini</div></div><div className="rounded-[var(--tf-radius-md)] bg-[var(--tf-bg-subtle)] p-3"><div className="text-sm font-semibold">{tomorrowSubjects[0] || 'Belum ada mapel'}</div><div className="mt-1 text-[11px] text-[var(--tf-text-muted)]">Sorotan pelajaran besok</div></div></div>
      </Card>
    </div>
  );

  const TimelineView = () => {
    const currentMinutes = Number(currentTime.slice(0, 2)) * 60 + Number(currentTime.slice(3, 5));
    return <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between border-b border-[var(--tf-border)] pb-4"><div><div className="studio-eyebrow"><Layers3 size={13} /> Timeline vertikal</div><h2 className="mt-1 text-lg font-semibold">Satu hari utuh</h2></div><Badge variant="primary"><Clock3 size={13} /> {currentTime}</Badge></div>
        <div className="relative mt-6 space-y-5 pl-10"><div className="absolute bottom-1 left-4 top-1 w-px bg-[var(--tf-border)]" />{todayTimeline.map((item, index) => { const at = minutes(item.startTime); const isNow = Math.abs(currentMinutes - at) <= 45; const past = currentMinutes > at + 60; return <div key={`${item.id}-${index}`} className="relative"><span className={`absolute -left-[31px] top-3 h-4 w-4 rounded-full border-4 ${isNow ? 'border-[var(--tf-primary-subtle)] bg-[var(--tf-primary)] shadow-[0_0_0_2px_var(--tf-primary)]' : past ? 'bg-[var(--tf-text-muted)]' : 'bg-[var(--tf-bg-surface)]'}`} style={!past && !isNow ? { boxShadow: `0 0 0 2px ${'var(--tf-primary)'}` } : undefined} /><div className={`rounded-[var(--tf-radius-md)] border p-3.5 ${isNow ? 'border-[var(--tf-primary)] bg-[var(--tf-primary-subtle)]/55' : past ? 'border-[var(--tf-border)] bg-[var(--tf-bg-subtle)]/45 opacity-80' : 'border-[var(--tf-border)] bg-[var(--tf-bg-surface)]'}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-bold">{item.startTime}</span>{isNow && <Badge variant="primary" size="sm">Sekarang</Badge>}</div><div className="mt-1 text-sm font-semibold truncate">{item.subject}</div><div className="mt-0.5 text-xs text-[var(--tf-text-muted)] truncate">{item.teacher || item.location || item.subject}</div></div><span className="text-[10px] text-[var(--tf-text-muted)]">{item.endTime}</span></div></div></div>})}</div>
      </Card>
      <div className="space-y-4"><Card className="p-5"><div className="studio-eyebrow"><Flame size={13} /> Streak</div><div className="mt-2 text-4xl font-bold tabular-nums">{streak.currentStreak}</div><div className="mt-1 text-xs text-[var(--tf-text-muted)]">hari fokus berturut-turut · {streak.todayMinutes} menit hari ini</div><Link to="/focus" className="studio-action mt-4 w-full">Mulai sesi fokus</Link></Card><Card className="p-5"><div className="studio-eyebrow"><CalendarDays size={13} /> Besok</div><div className="mt-3 flex flex-wrap gap-2">{tomorrowSubjects.length ? tomorrowSubjects.map((subject) => <Badge key={subject} variant="neutral">{subject}</Badge>) : <span className="text-xs text-[var(--tf-text-muted)]">Tidak ada pelajaran tercatat untuk {tomorrowDay}.</span>}</div></Card></div>
    </div>;
  };

  const FocusView = () => <div className="dashboard-layout-focus max-w-none">
    <ClockHero />
    <AgendaCard />
    <TaskCard />
    <div className="grid gap-4 md:grid-cols-2"><TogetherCard /><Card className="p-0 overflow-hidden"><DigitalIdCardBanner /></Card></div>
    <div className="grid gap-4 md:grid-cols-2"><Card className="p-5"><div className="studio-eyebrow"><GraduationCap size={13} /> Jadwal les</div><h2 className="mt-1 text-lg font-semibold">Les berikutnya</h2><div className="mt-4 flex items-center gap-3 rounded-[var(--tf-radius-md)] bg-[var(--tf-bg-subtle)] p-3"><div className="grid h-10 w-10 place-items-center rounded-[var(--tf-radius-md)] bg-[var(--tf-primary-subtle)] text-[var(--tf-primary)]"><BookOpen size={18} /></div><div className="min-w-0"><div className="truncate text-sm font-semibold">{workspaceId === 'fathur' ? nextTutoring?.subjectName || 'Belum ada sesi terdekat' : 'Jadwal les Mazet belum diisi.'}</div><div className="mt-0.5 text-[11px] text-[var(--tf-text-muted)]">{nextTutoring ? `${nextTutoring.scheduleDate} · ${nextTutoring.startTimeLabel}` : tutoring.error || 'Data les akan muncul saat tersedia.'}</div></div></div></Card><Card className="p-5"><div className="studio-eyebrow"><CalendarDays size={13} /> Besok</div><h2 className="mt-1 text-lg font-semibold">Pelajaran besok</h2><div className="mt-4 flex flex-wrap gap-2">{tomorrowSubjects.length ? tomorrowSubjects.map((subject) => <Badge key={subject} variant="neutral">{subject}</Badge>) : <span className="text-xs text-[var(--tf-text-muted)]">Belum ada pelajaran untuk {tomorrowDay}.</span>}</div></Card></div>
    <div className="grid gap-4 md:grid-cols-2"><Card className="p-5"><div className="studio-eyebrow"><BarChart3 size={13} /> Insight</div><h2 className="mt-1 text-lg font-semibold">Progress hari ini</h2><div className="mt-4 grid grid-cols-3 gap-2"><div className="rounded-[var(--tf-radius-md)] bg-[var(--tf-bg-subtle)] p-3"><div className="text-2xl font-bold">{stats.active}</div><div className="text-[10px] text-[var(--tf-text-muted)]">aktif</div></div><div className="rounded-[var(--tf-radius-md)] bg-[var(--tf-bg-subtle)] p-3"><div className="text-2xl font-bold">{stats.done}</div><div className="text-[10px] text-[var(--tf-text-muted)]">selesai</div></div><div className="rounded-[var(--tf-radius-md)] bg-[var(--tf-bg-subtle)] p-3"><div className="text-2xl font-bold">{streak.todayMinutes}m</div><div className="text-[10px] text-[var(--tf-text-muted)]">fokus</div></div></div></Card><AiPulseCard tomorrowSubjects={tomorrowSubjects} tomorrowDay={tomorrowDay} academicTimeline={todayTimeline} tutoring={tutoring.items} /></div>
    <QuickActions />
  </div>;

  const BentoView = () => <div className="dashboard-layout-bento">
    <div className="bento-span-8"><ClockHero /></div>
    <div className="bento-span-4"><Card className="h-full p-5"><div className="studio-eyebrow"><Flame size={13} /> Fokus</div><div className="mt-2 text-4xl font-bold">{streak.currentStreak}</div><p className="mt-1 text-xs text-[var(--tf-text-muted)]">Hari berturut-turut</p><Link to="/focus" className="studio-action mt-5 w-full">Fokus sekarang</Link></Card></div>
    <div className="bento-span-6"><AgendaCard /></div>
    <div className="bento-span-6"><TaskCard /></div>
    <div className="bento-span-4"><Card className="h-full p-5"><div className="studio-eyebrow"><CalendarDays size={13} /> Besok</div><h3 className="mt-1 text-lg font-semibold">{tomorrowDay}</h3><div className="mt-4 flex flex-wrap gap-2">{tomorrowSubjects.length ? tomorrowSubjects.map((s) => <Badge key={s} variant="neutral">{s}</Badge>) : <span className="text-xs text-[var(--tf-text-muted)]">Kosong.</span>}</div></Card></div>
    <div className="bento-span-4"><Card className="h-full p-5"><div className="studio-eyebrow"><MessageCircle size={13} /> Ruang Kita</div><p className="mt-3 text-sm leading-6 text-[var(--tf-text-muted)]">Buka chat untuk cek pesan terakhir atau lanjut belajar bareng.</p><Link to="/chat" className="studio-action studio-action--soft mt-5 w-full">Buka chat</Link></Card></div>
    <div className="bento-span-4"><Card className="h-full p-5"><div className="studio-eyebrow"><FileHeart size={13} /> My Minee</div><p className="mt-3 text-sm leading-6 text-[var(--tf-text-muted)]">Satu ruang untuk koleksi pribadi dan kenangan penting.</p><Link to="/my-minee" className="studio-action studio-action--soft mt-5 w-full">Buka My Minee</Link></Card></div>
    <div className="bento-span-12"><DigitalIdCardBanner /></div>
    <div className="bento-span-12"><AiPulseCard tomorrowSubjects={tomorrowSubjects} tomorrowDay={tomorrowDay} academicTimeline={todayTimeline} tutoring={tutoring.items} /></div>
    <div className="bento-span-12"><QuickActions /></div>
  </div>;

  return (
    <div className="studio-page space-y-5 fade-up" data-dashboard-layout={layout}>
      <div className="flex flex-col gap-3 border-b border-[var(--tf-border)] pb-3 md:flex-row md:items-center md:justify-between">
        <div><div className="studio-eyebrow"><Sparkles size={13} /> FAZET Studio</div><div className="mt-1 flex items-center gap-2"><h2 className="studio-page-title !text-xl sm:!text-2xl">Dashboard</h2><Badge variant="primary" size="sm">{layout}</Badge></div></div>
        <div className="flex items-center gap-1 overflow-x-auto rounded-full border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] p-1">
          {LAYOUTS.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => changeLayout(id)} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${layout === id ? 'bg-[var(--tf-primary)] text-white' : 'text-[var(--tf-text-secondary)] hover:bg-[var(--tf-bg-subtle)]'}`}><Icon size={13} />{label}</button>)}
        </div>
      </div>

      <StatStrip />
      {layout === 'focus' && <FocusView />}
      {layout === 'bento' && <BentoView />}
      {layout === 'timeline' && <TimelineView />}
      {layout === 'duo' && <div className="space-y-5"><ClockHero /><StatStrip /><DuoSummary /><div className="grid gap-4 lg:grid-cols-2"><AgendaCard /><TaskCard /></div><div className="grid gap-4 md:grid-cols-2"><TogetherCard /><DigitalIdCardBanner /></div><QuickActions /></div>}

      <div className="flex items-center justify-between gap-3 pt-1 text-[11px] text-[var(--tf-text-muted)]"><span>{workspace.name} workspace · siap untuk dijalani</span><Link to="/settings" className="inline-flex items-center gap-1 font-semibold text-[var(--tf-primary)]">Atur tampilan <ArrowRight size={13} /></Link></div>
      <TaskForm open={taskOpen} initial={null} onClose={() => setTaskOpen(false)} onSaved={() => setTaskOpen(false)} />
    </div>
  );
}
