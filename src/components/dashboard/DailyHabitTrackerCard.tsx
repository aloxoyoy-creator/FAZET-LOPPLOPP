import { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  RotateCcw,
  Sparkles,
  Play,
  Pause,
  Timer,
  Trash2,
  Target,
} from 'lucide-react';
import Card from '../ui/Card';

interface HabitItem {
  id: string;
  label: string;
  category: 'akademik' | 'spiritual' | 'kesehatan';
}

const DEFAULT_HABITS: HabitItem[] = [
  { id: 'h-sholat', label: 'Sholat 5 Waktu Tepat Waktu & Dzikir', category: 'spiritual' },
  { id: 'h-fokus', label: 'Deep Work / Belajar Fokus Minimal 2x25 Menit', category: 'akademik' },
  { id: 'h-review', label: 'Review Catatan Materi & Cicil Tugas H-1', category: 'akademik' },
  { id: 'h-hidrasi', label: 'Minum Air Putih 8 Gelas & Istirahat Cukup', category: 'kesehatan' },
];

const HABIT_LIST_KEY = 'fazet_daily_habits_list_v1';
const HABIT_CHECK_PREFIX = 'fazet_daily_habits_done_';

function getTodayKey() {
  const now = new Date();
  return `${HABIT_CHECK_PREFIX}${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
}

export default function DailyHabitTrackerCard() {
  const todayKey = useMemo(() => getTodayKey(), []);

  const [habits, setHabits] = useState<HabitItem[]>(() => {
    try {
      const saved = localStorage.getItem(HABIT_LIST_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_HABITS;
  });

  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(todayKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [newHabitText, setNewHabitText] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);

  // Mini Quick Pomodoro Timer (25m / 15m / 5m)
  const [timerMode, setTimerMode] = useState<number>(25);
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(HABIT_LIST_KEY, JSON.stringify(habits));
    } catch {
      // ignore
    }
  }, [habits]);

  useEffect(() => {
    try {
      localStorage.setItem(todayKey, JSON.stringify(completedIds));
    } catch {
      // ignore
    }
  }, [completedIds, todayKey]);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const toggleHabit = (id: string) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitText.trim()) return;
    const next: HabitItem = {
      id: `h-${Date.now()}`,
      label: newHabitText.trim(),
      category: 'akademik',
    };
    setHabits((prev) => [...prev, next]);
    setNewHabitText('');
    setShowAddInput(false);
  };

  const handleDeleteHabit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setCompletedIds((prev) => prev.filter((c) => c !== id));
  };

  const selectTimerPreset = (mins: number) => {
    setTimerRunning(false);
    setTimerMode(mins);
    setSecondsLeft(mins * 60);
  };

  const progressPct =
    habits.length > 0 ? Math.round((completedIds.length / habits.length) * 100) : 0;

  const minsStr = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secsStr = String(secondsLeft % 60).padStart(2, '0');

  return (
    <Card className="p-5 sm:p-6 rounded-3xl border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left 8 Cols: Minimalist Daily Habit & Target Checklist */}
        <div className="lg:col-span-8 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950">
                <Target size={17} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-extrabold text-[var(--tf-text-primary)]">
                    Target & Kebiasaan Harian Minimalis
                  </h3>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {completedIds.length}/{habits.length} Selesai ({progressPct}%)
                  </span>
                </div>
                <p className="text-xs text-[var(--tf-text-muted)]">
                  Konsistensi langkah kecil setiap hari menuju produktivitas tingkat tinggi
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddInput((v) => !v)}
              className="inline-flex items-center gap-1 rounded-xl border border-[var(--tf-border)] bg-[var(--tf-bg-subtle)] px-2.5 py-1.5 text-xs font-bold text-[var(--tf-text-primary)] hover:border-slate-400 transition cursor-pointer"
            >
              <Plus size={13} /> Target Baru
            </button>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--tf-bg-subtle)]">
            <div
              className="h-full rounded-full bg-slate-900 dark:bg-white transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {showAddInput && (
            <form onSubmit={handleAddHabit} className="flex gap-2">
              <input
                type="text"
                value={newHabitText}
                onChange={(e) => setNewHabitText(e.target.value)}
                placeholder="Tulis kebiasaan atau target harian baru..."
                className="flex-1 rounded-xl border border-[var(--tf-border)] bg-[var(--tf-bg-subtle)] px-3 py-1.5 text-xs outline-none focus:border-slate-500"
              />
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white dark:bg-white dark:text-slate-950 cursor-pointer"
              >
                Simpan
              </button>
            </form>
          )}

          {/* Habit Pills Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {habits.map((habit) => {
              const isDone = completedIds.includes(habit.id);
              return (
                <div
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className={`group flex cursor-pointer items-center justify-between gap-2.5 rounded-2xl border px-3.5 py-2.5 text-xs transition-all ${
                    isDone
                      ? 'border-emerald-500/30 bg-emerald-500/5 text-slate-500 dark:text-slate-400 line-through'
                      : 'border-[var(--tf-border)] bg-[var(--tf-bg-subtle)]/40 text-[var(--tf-text-primary)] hover:border-slate-400 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isDone ? (
                      <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
                    ) : (
                      <Circle size={16} className="shrink-0 text-slate-400" />
                    )}
                    <span className="font-semibold truncate">{habit.label}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteHabit(habit.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-0.5 transition-opacity"
                    title="Hapus target"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 4 Cols: Minimalist Instant Focus Sprint Timer */}
        <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl border border-[var(--tf-border)] bg-[var(--tf-bg-subtle)]/50 p-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--tf-text-muted)]">
              <Timer size={13} /> Quick Focus Sprint
            </span>
            <div className="flex items-center gap-1">
              {[15, 25, 45].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => selectTimerPreset(m)}
                  className={`rounded-lg px-2 py-0.5 font-mono text-[10px] font-bold transition cursor-pointer ${
                    timerMode === m
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                      : 'text-[var(--tf-text-muted)] hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          <div className="my-3 text-center">
            <div className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-[var(--tf-text-primary)]">
              {minsStr}:{secsStr}
            </div>
            <p className="mt-0.5 text-[11px] text-[var(--tf-text-muted)]">
              {timerRunning ? 'Sesi fokus sedang berjalan...' : 'Siap mulai sprint fokus instan'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTimerRunning((r) => !r)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 cursor-pointer"
            >
              {timerRunning ? (
                <>
                  <Pause size={14} /> Jeda
                </>
              ) : (
                <>
                  <Play size={14} /> Mulai Fokus
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setTimerRunning(false);
                setSecondsLeft(timerMode * 60);
              }}
              className="rounded-xl border border-[var(--tf-border)] p-2 text-[var(--tf-text-muted)] hover:text-[var(--tf-text-primary)] transition cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
