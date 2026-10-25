import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Activity, Award, BellRing, BookOpen, CheckCircle2, Flame, GraduationCap, ListChecks, Sparkles, Target, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Card from '../components/ui/Card';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import Reveal from '../components/ui/Reveal';
import SmartAdvisorCard from '../components/insights/SmartAdvisorCard';
import AchievementsShowcase from '../components/insights/AchievementsShowcase';
import WeeklyGoalCard from '../components/insights/WeeklyGoalCard';
import { useTasks, useTaskStats } from '../hooks/useTasks';
import { useSchedule } from '../hooks/useSchedule';
import { useFocusStreak } from '../hooks/useFocusStreak';
import { cn } from '../lib/utils';
import { computeAchievements } from '../services/achievementService';
import { computeSmartPlan } from '../services/smartAdvisorService';
import { countTasksCompletedThisWeek } from '../services/goalService';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { buildInsightSnapshot, saveInsightSnapshot } from '../services/intelligenceService';
import { getSavedTkaSyncStatus } from '../services/tkaNotificationService';
import { tkaQuestions } from '../data/tkaQuestions';
import { getActiveOrNextExamDay, isTkaFeatureActive } from '../data/tkaSchedule2026';

type Metric = { icon: LucideIcon; value: number; suffix?: string; label: string };

interface TkaHistoryEntry {
  id: string;
  date: string;
  subtest: string;
  score: number;
  correct: number;
  total: number;
}

export default function Insights({admin=false}:{admin?:boolean}) {
  const { tasks } = useTasks(admin);
  const { user } = useAuth();
  const { workspaceId } = useWorkspace();
  const { items: schedule } = useSchedule();
  const stats = useTaskStats(tasks);
  const { streak } = useFocusStreak();
  const focusMinutes = streak.totalMinutes;
  const now = useMemo(() => new Date(), []);
  const tkaActive = !admin && workspaceId !== 'mazet' && isTkaFeatureActive(now);

  const tkaStats = useMemo(() => {
    try {
      const raw = localStorage.getItem('fazet_tka_history');
      const list: TkaHistoryEntry[] = raw ? JSON.parse(raw) : [];
      const count = list.length;
      const highestScore = count > 0 ? Math.max(...list.map((i) => i.score)) : 0;
      const avgScore = count > 0 ? Math.round(list.reduce((acc, cur) => acc + cur.score, 0) / count) : 0;
      const totalQuestionsAnswered = list.reduce((acc, cur) => acc + cur.total, 0);
      const totalCorrect = list.reduce((acc, cur) => acc + cur.correct, 0);
      const accuracy = totalQuestionsAnswered > 0 ? Math.round((totalCorrect / totalQuestionsAnswered) * 100) : 0;
      return { count, highestScore, avgScore, accuracy, recent: list.slice(0, 4) };
    } catch {
      return { count: 0, highestScore: 0, avgScore: 0, accuracy: 0, recent: [] as TkaHistoryEntry[] };
    }
  }, []);

  const tkaSyncStatus = useMemo(() => getSavedTkaSyncStatus(), []);
  const nextExamDay = useMemo(() => getActiveOrNextExamDay(now), [now]);

  const bySubject = useMemo(()=>{const m=new Map<string,{subject:string;total:number;completed:number}>();tasks.forEach(t=>{const k=t.subjectName||'Lainnya';const row=m.get(k)||{subject:k,total:0,completed:0};row.total++;if(t.status==='completed')row.completed++;m.set(k,row)});return [...m.values()].sort((a,b)=>b.total-a.total).slice(0,8)},[tasks]);
  const trend = useMemo(()=>Array.from({length:14},(_,i)=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-(13-i));const key=d.toISOString().slice(0,10);return {date:d.toLocaleDateString('id-ID',{day:'2-digit',month:'short'}),created:tasks.filter(t=>t.createdAt?.slice(0,10)===key).length,done:tasks.filter(t=>t.completedAt?.slice(0,10)===key).length}}),[tasks]);
  const completionRate = stats.total?Math.round((stats.completed/stats.total)*100):0;
  const achievements = useMemo(() => computeAchievements(tasks, streak), [tasks, streak]);
  const completedThisWeek = useMemo(() => countTasksCompletedThisWeek(tasks), [tasks]);

  useEffect(() => {
    if (!user?.id || admin) return;
    const snapshot = buildInsightSnapshot({ userId: user.id, workspaceId, tasks, streak, plan: computeSmartPlan(now, tasks, schedule, streak) });
    void saveInsightSnapshot(snapshot).catch((error) => console.debug('Insight snapshot persistence skipped:', error));
  }, [admin, now, schedule, streak, tasks, user?.id, workspaceId]);

  const metrics: Metric[] = [
    { icon: ListChecks, value: stats.total, label: 'Total Tugas' },
    { icon: CheckCircle2, value: stats.completed, label: 'Selesai' },
    { icon: Activity, value: stats.inProgress, label: 'Dikerjakan' },
    { icon: Flame, value: stats.overdue, label: 'Terlambat' },
    { icon: Target, value: completionRate, suffix: '%', label: 'Completion' },
    { icon: TrendingUp, value: focusMinutes, suffix: 'm', label: 'Focus Time' },
  ];

  return <div className="space-y-5 fade-up">
    <div><h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{admin?'Analytics Sistem':'Insight Produktivitas'}</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Semua metrik dihitung real-time dari data Supabase.</p></div>

    <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
      {metrics.map(({icon: Icon, value, suffix, label}, index) => (
        <Reveal key={String(label)} delay={index * 50}>
          <Card className="hub-card-interactive p-4">
            <Icon size={18} className="text-blue-600 dark:text-blue-400"/>
            <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white"><AnimatedNumber value={value} suffix={suffix} /></div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
          </Card>
        </Reveal>
      ))}
    </div>

    {tkaActive && (
      <Card className="p-5 border-indigo-200/80 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40 dark:from-indigo-950/25 dark:via-[#0f1219] dark:to-purple-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/25">
              <GraduationCap size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base text-slate-900 dark:text-white">Analitik Kesiapan TKA & TryOut CBT 2026</h2>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                  IRT Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {nextExamDay?.exam
                  ? `Target Terdekat: Hari ke-${nextExamDay.exam.hariKe} (${nextExamDay.exam.tanggalFormatted}) • ${nextExamDay.exam.shortTitle}`
                  : 'Rekapitulasi performa simulasi TryOut CBT & sinkronisasi pengingat ujian'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/tka"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
            >
              <Sparkles size={14} /> Mulai TryOut CBT
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-white/90 dark:bg-slate-900/70 p-3.5 border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Skor IRT Tertinggi</span>
              <Award size={15} className="text-amber-500" />
            </div>
            <div className="mt-1.5 text-2xl font-black text-slate-900 dark:text-white">
              {tkaStats.highestScore > 0 ? tkaStats.highestScore : '—'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Rata-rata: <b className="text-indigo-600 dark:text-indigo-400">{tkaStats.avgScore || 0}</b> poin
            </div>
          </div>

          <div className="rounded-2xl bg-white/90 dark:bg-slate-900/70 p-3.5 border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>TryOut Selesai</span>
              <CheckCircle2 size={15} className="text-emerald-500" />
            </div>
            <div className="mt-1.5 text-2xl font-black text-slate-900 dark:text-white">
              {tkaStats.count} <span className="text-xs font-bold text-slate-400">Sesi</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Akurasi Jawab: <b className="text-emerald-600 dark:text-emerald-400">{tkaStats.accuracy}%</b>
            </div>
          </div>

          <div className="rounded-2xl bg-white/90 dark:bg-slate-900/70 p-3.5 border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Bank Soal HOTS</span>
              <BookOpen size={15} className="text-indigo-500" />
            </div>
            <div className="mt-1.5 text-2xl font-black text-slate-900 dark:text-white">
              {tkaQuestions.length} <span className="text-xs font-bold text-slate-400">Soal</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              5 Subtes + Pembahasan AI
            </div>
          </div>

          <div className="rounded-2xl bg-white/90 dark:bg-slate-900/70 p-3.5 border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Alarm Jadwal TKA</span>
              <BellRing size={15} className={tkaSyncStatus ? 'text-emerald-500' : 'text-amber-500'} />
            </div>
            <div className="mt-1.5 text-sm font-black text-slate-900 dark:text-white">
              {tkaSyncStatus ? 'Tersinkronisasi Aktif' : 'Siap Sinkronisasi'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {tkaSyncStatus
                ? `${tkaSyncStatus.scheduledCount} alarm lokal & inbox aktif`
                : 'Buka menu Jadwal/TKA untuk sinkron'}
            </div>
          </div>
        </div>
      </Card>
    )}

    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <SmartAdvisorCard now={now} tasks={tasks} schedule={schedule} streak={streak} variant="full" />
      <WeeklyGoalCard completedThisWeek={completedThisWeek} />
    </div>

    <AchievementsShowcase summary={achievements} />

    <div className="grid gap-5 xl:grid-cols-2">
      <Card className="p-5"><h2 className="font-bold text-slate-900 dark:text-white">Aktivitas 14 Hari</h2><p className="text-xs text-slate-500 dark:text-slate-400">Tugas dibuat dan diselesaikan</p><div className="mt-5 h-72"><ResponsiveContainer width="100%" height="100%"><LineChart data={trend}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="date" fontSize={10}/><YAxis allowDecimals={false} fontSize={10}/><Tooltip/><Line type="monotone" dataKey="created" stroke="currentColor" className="text-blue-600" strokeWidth={3}/><Line type="monotone" dataKey="done" stroke="currentColor" className="text-emerald-600" strokeWidth={3}/></LineChart></ResponsiveContainer></div></Card>
      <Card className="p-5"><h2 className="font-bold text-slate-900 dark:text-white">Beban per Mata Pelajaran</h2><p className="text-xs text-slate-500 dark:text-slate-400">Top 8 mata pelajaran berdasarkan jumlah tugas</p><div className="mt-5 h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={bySubject} layout="vertical" margin={{left:20,right:10}}><XAxis type="number" allowDecimals={false}/><YAxis dataKey="subject" type="category" width={110} fontSize={10}/><Tooltip/><Bar dataKey="total" fill="currentColor" className="text-blue-600" radius={[0,7,7,0]}/></BarChart></ResponsiveContainer></div></Card>
    </div>

    <Card className="p-5">
      <div className="flex items-center justify-between"><div><h2 className="font-bold text-slate-900 dark:text-white">Interpretasi Cepat</h2><p className="text-xs text-slate-500 dark:text-slate-400">Saran berbasis data saat ini</p></div><Target size={19} className={cn(completionRate>=75?'text-emerald-600':'text-amber-500')}/></div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-4 text-sm text-slate-900 dark:text-white"><b>Completion</b><p className="mt-1 text-slate-500 dark:text-slate-400">{completionRate>=75?'Ritmemu sudah konsisten. Pertahankan.':completionRate>=45?'Prioritaskan tugas yang hampir deadline.':'Mulai dari satu tugas prioritas tinggi dan selesaikan.'}</p></div>
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-4 text-sm text-slate-900 dark:text-white"><b>Overdue</b><p className="mt-1 text-slate-500 dark:text-slate-400">{stats.overdue===0?'Tidak ada tugas terlambat.':`${stats.overdue} tugas terlambat perlu segera ditangani.`}</p></div>
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-4 text-sm text-slate-900 dark:text-white"><b>Focus & Simulasi</b><p className="mt-1 text-slate-500 dark:text-slate-400">{focusMinutes?`Kamu sudah fokus ${focusMinutes} menit (${tkaStats.count} sesi TryOut CBT).`:'Belum ada sesi fokus. Coba Focus Mode atau simulasi TKA.'}</p></div>
      </div>
    </Card>
  </div>;
}
