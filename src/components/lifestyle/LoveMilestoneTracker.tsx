import { useState, useEffect } from 'react';
import Card from '../ui/Card';
import { CalendarHeart, Sparkles, Heart, Trophy, Clock, Edit2, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'fazet_relationship_start_date';
const DEFAULT_DATE = '2024-10-26'; // Tanggal spesial 26 Oktober

interface Milestone {
  days: number;
  label: string;
  desc: string;
  badge: string;
}

const MILESTONES: Milestone[] = [
  { days: 30, label: '1 Bulan Manis', desc: 'Awal dari berjuta tawa & cerita indah berdua.', badge: '🌱' },
  { days: 100, label: '100 Hari Bersama', desc: 'Ratusan hari dipenuhi kasih sayang & saling melengkapi.', badge: '💖' },
  { days: 200, label: '200 Hari Penuh Arti', desc: 'Makin kompak, saling dukung di setiap langkah & impian.', badge: '✨' },
  { days: 365, label: '1 Tahun (Anniversary #1)', desc: 'Satu tahun perjalanan cinta yang luar biasa!', badge: '👑' },
  { days: 500, label: 'Setengah Milenium Cinta (500 Hari)', desc: 'Cinta yang teruji makin kokoh dan dewasa.', badge: '💎' },
  { days: 730, label: '2 Tahun Penuh Berkah', desc: 'Menuju masa depan berdua yang makin nyata.', badge: '🏰' },
  { days: 1000, label: '1000 Hari Cinta Abadi', desc: 'Bukti cinta sejati yang tak lekang oleh waktu.', badge: '🌌' },
];

export default function LoveMilestoneTracker() {
  const [startDateStr, setStartDateStr] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_DATE;
  });
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [tempDate, setTempDate] = useState(startDateStr);

  const [timeDiff, setTimeDiff] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCounter = () => {
      const start = new Date(`${startDateStr}T00:00:00+07:00`).getTime();
      const now = Date.now();
      const diff = Math.max(0, now - start);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeDiff({ days, hours, minutes, seconds });
    };

    updateCounter();
    const interval = setInterval(updateCounter, 1000);
    return () => clearInterval(interval);
  }, [startDateStr]);

  const handleSaveDate = () => {
    if (tempDate) {
      setStartDateStr(tempDate);
      localStorage.setItem(STORAGE_KEY, tempDate);
      setIsEditingDate(false);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } catch {}
    }
  };

  const nextMilestone = MILESTONES.find(m => m.days > timeDiff.days) || MILESTONES[MILESTONES.length - 1];
  const daysToNext = Math.max(0, nextMilestone.days - timeDiff.days);

  return (
    <Card className="p-6 border-2 border-rose-200/90 dark:border-rose-900/40 bg-gradient-to-br from-rose-50/70 via-white to-pink-50/50 dark:from-rose-950/20 dark:via-[#090d16] dark:to-pink-950/10 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl text-white shadow-md shadow-rose-500/20">
            <CalendarHeart size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-rose-950 dark:text-rose-100">
                Kisah Cinta Fathur & Mazet
              </h2>
              <Heart size={18} className="text-rose-500 fill-rose-500 animate-bounce" />
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--tf-text-muted)] mt-0.5">
              <span>Dimulai sejak: {new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(`${startDateStr}T00:00:00`))}</span>
              <button
                onClick={() => {
                  setTempDate(startDateStr);
                  setIsEditingDate(!isEditingDate);
                }}
                className="text-rose-500 hover:text-rose-600 hover:underline inline-flex items-center gap-0.5 font-semibold"
              >
                <Edit2 size={11} /> Ubah
              </button>
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100/90 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800">
          <Sparkles size={14} /> Selalu Bersama
        </div>
      </div>

      {isEditingDate && (
        <div className="mb-6 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 flex flex-wrap items-center gap-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Atur Tanggal Awal Kebersamaan:
          </label>
          <input
            type="date"
            value={tempDate}
            onChange={(e) => setTempDate(e.target.value)}
            className="input h-10 text-sm px-3 max-w-[180px]"
          />
          <button
            onClick={handleSaveDate}
            className="h-10 px-4 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Check size={14} /> Simpan Tanggal
          </button>
          <button
            onClick={() => setIsEditingDate(false)}
            className="h-10 px-3 text-slate-500 hover:text-slate-700 text-xs font-semibold"
          >
            Batal
          </button>
        </div>
      )}

      {/* Counter Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-rose-100 dark:border-rose-900/30 text-center shadow-xs">
          <div className="text-3xl sm:text-4xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight">
            {timeDiff.days}
          </div>
          <div className="text-xs font-bold text-[var(--tf-text-muted)] mt-1 uppercase tracking-wider">
            Hari
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-rose-100 dark:border-rose-900/30 text-center shadow-xs">
          <div className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 font-mono tracking-tight">
            {String(timeDiff.hours).padStart(2, '0')}
          </div>
          <div className="text-xs font-bold text-[var(--tf-text-muted)] mt-1 uppercase tracking-wider">
            Jam
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-rose-100 dark:border-rose-900/30 text-center shadow-xs">
          <div className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 font-mono tracking-tight">
            {String(timeDiff.minutes).padStart(2, '0')}
          </div>
          <div className="text-xs font-bold text-[var(--tf-text-muted)] mt-1 uppercase tracking-wider">
            Menit
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-rose-100 dark:border-rose-900/30 text-center shadow-xs">
          <div className="text-3xl sm:text-4xl font-black text-rose-500 font-mono tracking-tight animate-pulse">
            {String(timeDiff.seconds).padStart(2, '0')}
          </div>
          <div className="text-xs font-bold text-[var(--tf-text-muted)] mt-1 uppercase tracking-wider">
            Detik
          </div>
        </div>
      </div>

      {/* Target Milestone Berikutnya */}
      <div className="p-4 rounded-2xl bg-rose-500/10 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 mb-6">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-rose-500" />
            <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
              Milestone Berikutnya: {nextMilestone.badge} {nextMilestone.label}
            </span>
          </div>
          <span className="text-xs font-black text-rose-600 dark:text-rose-400">
            {daysToNext === 0 ? 'Tercapai Hari Ini! 🎉' : `Tinggal ${daysToNext} hari lagi`}
          </span>
        </div>
        <div className="h-2.5 w-full bg-rose-100 dark:bg-rose-900/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(100, Math.round((timeDiff.days / nextMilestone.days) * 100))}%` }}
          />
        </div>
        <p className="text-[11px] text-[var(--tf-text-muted)] mt-2 italic">
          "{nextMilestone.desc}"
        </p>
      </div>

      {/* Milestone List */}
      <div className="space-y-2.5">
        <div className="text-xs font-bold text-[var(--tf-text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <Clock size={13} /> Jejak Milestone Cinta
        </div>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {MILESTONES.map((m) => {
            const isUnlocked = timeDiff.days >= m.days;
            return (
              <div
                key={m.days}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  isUnlocked
                    ? 'bg-white dark:bg-slate-900/90 border-emerald-300 dark:border-emerald-800/60 shadow-xs'
                    : 'bg-slate-50/60 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl shrink-0">{m.badge}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate text-slate-900 dark:text-white">
                      {m.label}
                    </div>
                    <div className="text-[10px] text-[var(--tf-text-muted)] truncate">
                      {m.days} Hari Bersama
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  {isUnlocked ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                      <Check size={10} /> Terlewati
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400">
                      -{m.days - timeDiff.days} h
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
