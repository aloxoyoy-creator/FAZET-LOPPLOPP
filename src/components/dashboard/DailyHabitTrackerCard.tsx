import { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  RotateCcw,
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
    <Card className="p-5 sm:p-6 border border-[var(--tf-border)] bg-[var(--tf-bg-surface)]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 8 Cols: Daily Habit Checklist */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--tf-accent-soft)] text-[var(--tf-accent)] border border-[var(--tf-accent)]/20">
                <Target size={16} strokeWidth={1.75} />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="studio-eyebrow">Ritme Harian</span>
                  <span className="rounded-full bg-[var(--tf-bg-subtle)] border border-[var(--tf-border)] px-2.5 py-0.5 font-mono text-[10px] font-medium text-[var(--tf-text-secondary)]">
                    {completedIds.length}/{habits.length} Selesai ({progressPct}%)
                  </span>
                </div>
                <h3 className="font-serif text-lg font-medium text-[var(--tf-text-primary)] mt-0.5">
                  Target &amp; Kebiasaan Produktif
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddInput((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--tf-border)] bg-[var(--tf-bg-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--tf-text-primary)] hover:border-[var(--tf-accent)]/40 transition-colors cursor-pointer"
            >
              <Plus size={13} />
              <span>Target Baru</span>
            </button>
          </div>

          {/* Progress Hairline */}
          <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--tf-bg-subtle)]">
            <div
              className="h-full rounded-full bg-[var(--tf-accent)] transition-all duration-500"
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
                className="flex-1 rounded-xl border border-[var(--tf-border)] bg-[var(--tf-bg-subtle)] px-3.5 py-2 text-xs outline-none focus:border-[var(--tf-accent)]"
              />
              <button
                type="submit"
                className="rounded-xl bg-[var(--tf-primary)] px-4 py-2 text-xs font-medium text-[var(--tf-bg-surface)] cursor-pointer"
              >
                Simpan
              </button>
            </form>
          )}

          {/* Habit Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {habits.map((habit) => {
              const isDone = completedIds.includes(habit.id);
              return (
                <div
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className={`group flex cursor-pointer items-center justify-between gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs transition-all ${
                    isDone
                      ? 'border-[var(--tf-border)] bg-[var(--tf-bg-subtle)]/60 text-[var(--tf-text-muted)] line-through'
                      : 'border-[var(--tf-border)] bg-[var(--tf-bg-surface)] text-[var(--tf-text-primary)] hover:border-[var(--tf-accent)]/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isDone ? (
                      <CheckCircle2 size={15} className="shrink-0 text-[var(--tf-accent)]" />
                    ) : (
                      <Circle size={15} className="shrink-0 text-[var(--tf-text-muted)]" />
                    )}
                    <span className="font-medium truncate">{habit.label}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteHabit(habit.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-[var(--tf-text-muted)] hover:text-[var(--tf-danger)] p-0.5 transition-opacity"
                    title="Hapus target"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 4 Cols: Minimalist Focus Timer */}
        <div className="lg:col-span-4 flex flex-col justify-between rounded-xl border border-[var(--tf-border)] bg-[var(--tf-bg-subtle)]/50 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tf-text-muted)]">
              <Timer size={12} className="text-[var(--tf-accent)]" /> Focus Sprint
            </span>
            <div className="flex items-center gap-1">
              {[15, 25, 45].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => selectTimerPreset(m)}
                  className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-medium transition cursor-pointer ${
                    timerMode === m
                      ? 'bg-[var(--tf-primary)] text-[var(--tf-bg-surface)]'
                      : 'text-[var(--tf-text-muted)] hover:text-[var(--tf-text-primary)]'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          <div className="my-4 text-center">
            <div className="font-mono text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--tf-text-primary)]">
              {minsStr}:{secsStr}
            </div>
            <div className="text-[11px] text-[var(--tf-text-muted)] mt-1">
              {timerRunning ? 'Sesi fokus sedang berjalan' : 'Siap memulai sesi konsentrasi'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTimerRunning((r) => !r)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--tf-primary)] py-2 text-xs font-medium text-[var(--tf-bg-surface)] hover:opacity-90 transition cursor-pointer"
            >
              {timerRunning ? <Pause size={13} /> : <Play size={13} />}
              <span>{timerRunning ? 'Jeda' : 'Mulai'}</span>
            </button>
            <button
              type="button"
              onClick={() => selectTimerPreset(timerMode)}
              className="grid h-8 w-8 place-items-center rounded-xl border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] text-[var(--tf-text-secondary)] hover:text-[var(--tf-text-primary)] transition cursor-pointer"
              title="Ulangi waktu"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
