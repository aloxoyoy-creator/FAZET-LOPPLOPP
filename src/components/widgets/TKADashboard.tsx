import { useState, useEffect } from 'react';
import { 
  Calendar, Flame, Clock, CheckCircle2, AlertCircle, Info, 
  ChevronDown, ChevronUp, Layers, Sparkles, Timer, ShieldCheck,
  CalendarDays, Hourglass, ArrowRight, BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { useWorkspace } from '../../context/WorkspaceContext';
import { 
  EXAM_DAYS_2026, 
  TKA_STAGES_2026, 
  TKA_SCHEDULE_2026_META,
  type ExamDaySchedule,
  type StageSchedule 
} from '../../data/tkaSchedule2026';

interface Props {
  className?: string;
}

// Clean sub-details for each day for a clean breakdown
const DAY_COMPONENTS: Record<number, { title: string; subtitle: string; chips: string[]; steps: { name: string; dur: string }[] }> = {
  1: {
    title: 'Bahasa Indonesia Wajib & Literasi',
    subtitle: 'Literasi Membaca & Survei Karakter',
    chips: ['105 Menit', '30 Soal', 'Survei Karakter'],
    steps: [
      { name: 'Latihan Ujian', dur: '5 Menit' },
      { name: 'Tes Literasi Membaca (30 Soal)', dur: '75 Menit' },
      { name: 'Survei Karakter', dur: '25 Menit' }
    ]
  },
  2: {
    title: 'Bahasa Inggris Wajib',
    subtitle: 'Literasi Bahasa Inggris & Sulingjar',
    chips: ['105 Menit', '30 Soal', 'Survei Lingkungan'],
    steps: [
      { name: 'Latihan Ujian', dur: '5 Menit' },
      { name: 'Tes Bahasa Inggris (30 Soal)', dur: '75 Menit' },
      { name: 'Survei Lingkungan Belajar', dur: '25 Menit' }
    ]
  },
  3: {
    title: 'Matematika Wajib & Numerasi',
    subtitle: 'Tes Penalaran Numerasi Matematika',
    chips: ['80 Menit', '25 Soal', 'Fokus Numerasi'],
    steps: [
      { name: 'Latihan Ujian', dur: '5 Menit' },
      { name: 'Tes Numerasi Matematika (25 Soal)', dur: '75 Menit' }
    ]
  },
  4: {
    title: 'Mapel Pilihan 1 & 2',
    subtitle: 'Matematika & B. Inggris Tingkat Lanjut',
    chips: ['125 Menit', '2x 25 Soal', 'Mapel Peminatan'],
    steps: [
      { name: 'Latihan Ujian', dur: '5 Menit' },
      { name: 'Pilihan 1: MTK Tingkat Lanjut (25 Soal)', dur: '60 Menit' },
      { name: 'Pilihan 2: B. Inggris Lanjut (25 Soal)', dur: '60 Menit' }
    ]
  }
};

export default function TKADashboard({ className = '' }: Props) {
  const { workspaceId } = useWorkspace();
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'jadwal' | 'tahapan' | 'rincian'>('jadwal');
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const isMazet = workspaceId === 'mazet';

  useEffect(() => {
    const targetDate = new Date(TKA_SCHEDULE_2026_META.targetDateStr).getTime();
    
    const updateCountdown = () => {
      const now = Date.now();
      const distance = targetDate - now;

      if (distance <= 0) {
        setTimeLeft(null);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleExpand = (hariKe: number) => {
    setExpandedDay((prev) => (prev === hariKe ? null : hariKe));
  };

  return (
    <div className={`space-y-4 mb-6 ${className}`}>
      {/* 1. HERO COUNTDOWN — Sleek, Minimalist, High-Tech Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 shadow-md text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-indigo-600/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-5 sm:p-6 gap-5">
          {/* Left Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <Flame size={12} className="text-amber-400" />
                {isMazet ? 'Event Terbesar 2026' : 'Target Ujian TKA SMA 2026'}
              </span>
              {!isMazet && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  Gelombang 1 • Sesi 1 (WIB)
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {isMazet ? 'BAZAR EDSA 2026' : 'Ujian TKA SMA 2026'}
            </h2>

            <div className="mt-1.5 flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-blue-400" />
                {isMazet ? '26 Oktober 2026' : 'Mulai: Senin, 26 Okt 2026'}
              </span>
              {!isMazet && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-emerald-400" />
                    07.00 WIB
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right Countdown Boxes */}
          <div className="flex gap-2 font-mono shrink-0">
            {timeLeft ? (
              [
                { label: 'Hari', val: timeLeft.days },
                { label: 'Jam', val: timeLeft.hours.toString().padStart(2, '0') },
                { label: 'Menit', val: timeLeft.minutes.toString().padStart(2, '0') },
                { label: 'Detik', val: timeLeft.seconds.toString().padStart(2, '0') },
              ].map((item) => (
                <div 
                  key={item.label} 
                  className="flex flex-col items-center justify-center bg-white/10 rounded-2xl p-2 sm:p-2.5 min-w-[56px] sm:min-w-[62px] border border-white/10"
                >
                  <div className="text-lg sm:text-xl font-black text-white tracking-tight">
                    {item.val}
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    {item.label}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-2.5 bg-emerald-500 rounded-2xl text-white font-bold text-xs animate-pulse">
                Sedang Berlangsung!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. JADWAL TKA SMA 2026 (Minimalist & Simpel, Tetap Informatif) */}
      {!isMazet && (
        <Card className="p-4 sm:p-5 border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] backdrop-blur-md shadow-xs space-y-4 rounded-3xl">
          {/* Header & Minimalist Segment Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--tf-border)] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <CalendarDays size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-[var(--tf-text-primary)]">
                  Jadwal Ujian TKA SMA 2026
                </h3>
                <p className="text-[11px] text-[var(--tf-text-muted)]">
                  Gelombang 1 • Sesi 1 (WIB) • 26 – 29 Okt 2026
                </p>
              </div>
            </div>

            {/* Segment Tab Pills */}
            <div className="inline-flex rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-1 text-xs font-semibold shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('jadwal')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'jadwal'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                    : 'text-[var(--tf-text-muted)] hover:text-[var(--tf-text-primary)]'
                }`}
              >
                Jadwal Ujian (4 Hari)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tahapan')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'tahapan'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                    : 'text-[var(--tf-text-muted)] hover:text-[var(--tf-text-primary)]'
                }`}
              >
                Tahapan Lain
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('rincian')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'rincian'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                    : 'text-[var(--tf-text-muted)] hover:text-[var(--tf-text-primary)]'
                }`}
              >
                Rincian Waktu
              </button>
            </div>
          </div>

          {/* TAB 1: JADWAL UJIAN (Minimalist Cards) */}
          {activeTab === 'jadwal' && (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                {EXAM_DAYS_2026.map((item) => {
                  const comp = DAY_COMPONENTS[item.hariKe];
                  const isExpanded = expandedDay === item.hariKe;

                  // Clean color badges
                  const badgeClasses = {
                    1: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25',
                    2: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25',
                    3: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
                    4: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25',
                  }[item.hariKe] || 'bg-slate-500/10 text-slate-600';

                  return (
                    <div
                      key={item.hariKe}
                      className="group rounded-2xl border border-[var(--tf-border)] bg-[var(--tf-bg-subtle)]/40 hover:bg-[var(--tf-bg-subtle)] hover:border-blue-500/30 p-4 transition-all duration-200"
                    >
                      {/* Top Row: Hari Badge + Date & Monospace Time */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${badgeClasses}`}>
                            Hari {item.hariKe}
                          </span>
                          <span className="text-xs font-bold text-[var(--tf-text-secondary)]">
                            {item.tanggalFormatted}
                          </span>
                        </div>

                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[var(--tf-text-primary)] px-2 py-0.5 rounded-lg bg-[var(--tf-bg-surface)] border border-[var(--tf-border)]">
                          <Clock size={11} className="text-blue-500" />
                          {item.mulaiWib} - {item.perkiraanSelesaiWib} WIB
                        </span>
                      </div>

                      {/* Subject Title */}
                      <h4 className="text-sm sm:text-base font-black text-[var(--tf-text-primary)] leading-snug">
                        {comp?.title || item.mapel}
                      </h4>
                      {comp?.subtitle && (
                        <p className="text-[11px] text-[var(--tf-text-muted)] mt-0.5">
                          {comp.subtitle}
                        </p>
                      )}

                      {/* Compact Chips: Durasi & Soal */}
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[var(--tf-bg-surface)] text-[var(--tf-text-primary)] border border-[var(--tf-border)]">
                          <Timer size={11} className="text-amber-500" />
                          {item.totalMenit} Menit
                        </span>
                        {comp?.chips.slice(1).map((chip, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[var(--tf-bg-surface)] text-[var(--tf-text-muted)] border border-[var(--tf-border)]"
                          >
                            {chip}
                          </span>
                        ))}

                        {/* Toggle Rincian Button */}
                        <button
                          type="button"
                          onClick={() => toggleExpand(item.hariKe)}
                          className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-0.5"
                        >
                          {isExpanded ? 'Tutup' : 'Rincian'}
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      </div>

                      {/* Expandable Step-by-Step Breakdown */}
                      {isExpanded && comp && (
                        <div className="mt-3 pt-3 border-t border-[var(--tf-border)] space-y-1.5 text-xs animate-in fade-in duration-200">
                          {comp.steps.map((st, i) => (
                            <div key={i} className="flex items-center justify-between text-[11px] py-1 px-2 rounded-lg bg-[var(--tf-bg-surface)]">
                              <span className="text-[var(--tf-text-secondary)] font-medium">
                                • {st.name}
                              </span>
                              <span className="font-mono font-bold text-[var(--tf-text-primary)]">
                                {st.dur}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Minimalist Note */}
              <div className="p-3 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-xs text-[var(--tf-text-muted)] flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <Info size={14} className="text-blue-500 shrink-0" />
                  <span>Jam pada kartu peserta yang berlaku. Total durasi mencakup latihan, tes utama, dan survei.</span>
                </span>
                <Link
                  to="/tka"
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0 text-xs"
                >
                  Latihan Soal <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )}

          {/* TAB 2: TAHAPAN LAIN (Minimalist Timeline) */}
          {activeTab === 'tahapan' && (
            <div className="space-y-2.5 py-1">
              {TKA_STAGES_2026.map((stg) => {
                const isCrucial = stg.status === 'crucial';
                const isCompleted = stg.status === 'completed';

                return (
                  <div
                    key={stg.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl border transition-colors ${
                      isCrucial
                        ? 'border-rose-500/30 bg-rose-500/5'
                        : isCompleted
                        ? 'border-emerald-500/20 bg-emerald-500/5'
                        : 'border-[var(--tf-border)] bg-[var(--tf-bg-subtle)]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isCrucial
                            ? 'bg-rose-500 animate-pulse'
                            : isCompleted
                            ? 'bg-emerald-500'
                            : 'bg-slate-400'
                        }`}
                      />
                      <span className="text-xs font-bold text-[var(--tf-text-primary)]">
                        {stg.nama}
                      </span>
                      {isCrucial && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 border border-rose-500/30">
                          Ujian Utama
                        </span>
                      )}
                    </div>

                    <span className="font-mono text-xs font-semibold text-[var(--tf-text-muted)] mt-1 sm:mt-0 ml-4 sm:ml-0">
                      {stg.rentangFormatted}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: RINCIAN WAKTU & SUBTES */}
          {activeTab === 'rincian' && (
            <div className="space-y-2">
              <div className="grid gap-2 sm:grid-cols-2">
                {EXAM_DAYS_2026.map((item) => (
                  <div key={item.hariKe} className="p-3 rounded-2xl border border-[var(--tf-border)] bg-[var(--tf-bg-subtle)]/40 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-black text-blue-600 dark:text-blue-400">
                        {item.hari}, {item.tanggalFormatted.split(',')[1]}
                      </span>
                      <span className="font-mono font-bold text-[var(--tf-text-primary)]">
                        {item.mulaiWib} - {item.perkiraanSelesaiWib} WIB ({item.totalMenit} mnt)
                      </span>
                    </div>
                    <div className="font-bold text-[var(--tf-text-primary)] mb-1">
                      {item.mapel}
                    </div>
                    <p className="text-[11px] text-[var(--tf-text-muted)] leading-relaxed">
                      {item.rincian}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
