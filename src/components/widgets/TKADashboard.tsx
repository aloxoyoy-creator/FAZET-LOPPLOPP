import { useState, useEffect } from 'react';
import { 
  Calendar, Flame, Clock, CheckCircle2, AlertCircle, Info, 
  ChevronDown, ChevronUp, Sparkles, Timer,
  CalendarDays, ArrowRight, BellRing, RefreshCw, Target
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../ui/Toast';
import { 
  EXAM_DAYS_2026, 
  TKA_STAGES_2026, 
  getActiveOrNextExamDay,
  isTkaFeatureActive
} from '../../data/tkaSchedule2026';
import {
  syncTkaToNotifications,
  getSavedTkaSyncStatus,
  type TkaSyncStatus
} from '../../services/tkaNotificationService';

interface Props {
  className?: string;
}

export default function TKADashboard({ className = '' }: Props) {
  const { user } = useAuth();
  const { workspaceId } = useWorkspace();
  const { push } = useToast();

  const [now, setNow] = useState(() => new Date());
  const [activeTab, setActiveTab] = useState<'jadwal' | 'tahapan' | 'rincian'>('jadwal');
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [syncStatus, setSyncStatus] = useState<TkaSyncStatus | null>(() => getSavedTkaSyncStatus());
  const [syncing, setSyncing] = useState(false);
  const [syncingDay, setSyncingDay] = useState<number | null>(null);

  const isMazet = workspaceId === 'mazet';
  const tkaActive = isTkaFeatureActive(now);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onSynced = (e: Event) => {
      const custom = e as CustomEvent<TkaSyncStatus>;
      if (custom.detail) setSyncStatus(custom.detail);
    };
    window.addEventListener('fazet:tka-synced', onSynced);
    return () => window.removeEventListener('fazet:tka-synced', onSynced);
  }, []);

  if (!isMazet && !tkaActive) {
    return null;
  }

  const activeExamState = getActiveOrNextExamDay(now);
  const mazetTargetTs = new Date('2026-10-26T07:00:00+07:00').getTime();
  const targetTs = isMazet ? mazetTargetTs : activeExamState.targetTimestamp;
  const distance = Math.max(0, targetTs - now.getTime());

  const timeLeft = distance > 0 ? {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000)
  } : null;

  const todayWibStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  const toggleExpand = (hariKe: number) => {
    setExpandedDay((prev) => (prev === hariKe ? null : hariKe));
  };

  const handleSyncAllToNotif = async () => {
    setSyncing(true);
    try {
      const res = await syncTkaToNotifications({
        userId: user?.id,
        workspaceId,
        triggerImmediateConfirmation: true,
      });
      setSyncStatus(res);
      push({
        tone: 'success',
        title: 'Jadwal TKA Tersinkronisasi ke Notifikasi!',
        description: `Seluruh 4 hari ujian TKA & ${res.scheduledCount} alarm otomatis (H-1, 05:30, 06:30, 06:50, 07:00 WIB) telah aktif.`
      });
    } catch {
      push({
        tone: 'danger',
        title: 'Gagal menyinkronkan notifikasi',
        description: 'Pastikan izin notifikasi browser/HP sudah diaktifkan.'
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncSingleDay = async (hariKe: number, shortTitle: string) => {
    setSyncingDay(hariKe);
    try {
      const res = await syncTkaToNotifications({
        userId: user?.id,
        workspaceId,
        triggerImmediateConfirmation: true,
        specificDay: hariKe,
      });
      setSyncStatus(res);
      push({
        tone: 'success',
        title: `Alarm Hari Ke-${hariKe} Diaktifkan!`,
        description: `Pengingat otomatis untuk ${shortTitle} telah dijadwalkan ke sistem & Pusat Notifikasi.`
      });
    } catch {
      push({
        tone: 'danger',
        title: 'Gagal mengaktifkan alarm'
      });
    } finally {
      setSyncingDay(null);
    }
  };

  return (
    <div className={`space-y-4 mb-6 ${className}`}>
      {/* 1. HERO COUNTDOWN — Quiet Luxury Editorial Command Banner */}
      <div className="relative overflow-hidden rounded-[var(--tf-radius-card)] bg-[#141311] border border-[var(--tf-border)] shadow-[0_18px_42px_rgba(12,11,10,0.2)] text-[#F5F3EE]">
        <div className="absolute right-[-80px] top-[-80px] h-64 w-64 rounded-full bg-[#C8A96E]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-5 sm:p-6 gap-5">
          {/* Left Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.18em] bg-[#C8A96E]/15 text-[#E5CFA0] border border-[#C8A96E]/30">
                <Flame size={12} className="text-[#C8A96E]" />
                {isMazet
                  ? 'Agenda Utama 2026'
                  : activeExamState.state === 'in_session'
                  ? `LIVE • Sedang Berlangsung (Hari Ke-${activeExamState.exam.hariKe})`
                  : `Target Ujian TKA SMA 2026 • Hari Ke-${activeExamState.exam.hariKe}`}
              </span>
              {!isMazet && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-[#A39E95] border border-white/10">
                  Gelombang 1 • Sesi 1 (WIB)
                </span>
              )}
              {!isMazet && syncStatus && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                  <CheckCircle2 size={11} /> Notifikasi Aktif
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#F5F3EE]" style={{ fontFamily: 'var(--tf-font-display)' }}>
              {isMazet
                ? 'BAZAR EDSA 2026'
                : activeExamState.state === 'completed_all'
                ? 'Rangkaian Ujian TKA SMA 2026 Selesai'
                : `TKA Hari Ke-${activeExamState.exam.hariKe}: ${activeExamState.exam.shortTitle}`}
            </h2>

            <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-[#A39E95]">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-[#C8A96E]" />
                {isMazet
                  ? '26 Oktober 2026'
                  : `${activeExamState.exam.tanggalFormatted}`}
              </span>
              {!isMazet && (
                <>
                  <span className="text-white/20">/</span>
                  <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#E5CFA0]">
                    <Clock size={13} className="text-[#C8A96E]" />
                    {activeExamState.exam.mulaiWib} – {activeExamState.exam.perkiraanSelesaiWib} WIB ({activeExamState.exam.totalMenit} Menit)
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right Countdown Boxes & Sync Button */}
          <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
            <div className="flex gap-2 font-mono">
              {timeLeft ? (
                [
                  { label: 'Hari', val: timeLeft.days },
                  { label: 'Jam', val: timeLeft.hours.toString().padStart(2, '0') },
                  { label: 'Menit', val: timeLeft.minutes.toString().padStart(2, '0') },
                  { label: 'Detik', val: timeLeft.seconds.toString().padStart(2, '0') },
                ].map((item) => (
                  <div 
                    key={item.label} 
                    className="flex flex-col items-center justify-center bg-white/[0.04] rounded-xl p-2.5 min-w-[56px] sm:min-w-[62px] border border-white/10"
                  >
                    <div className="text-lg sm:text-xl font-semibold text-[#F5F3EE] tracking-tight">
                      {item.val}
                    </div>
                    <div className="text-[9px] font-medium text-[#A39E95] uppercase tracking-[0.16em]">
                      {item.label}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-5 py-2.5 bg-[#C8A96E] rounded-xl text-[#141311] font-semibold text-xs">
                  Sedang Berlangsung
                </div>
              )}
            </div>

            {!isMazet && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleSyncAllToNotif()}
                  disabled={syncing}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-semibold bg-[#C8A96E] hover:bg-[#D6B980] text-[#141311] transition-all cursor-pointer disabled:opacity-60"
                >
                  {syncing ? (
                    <RefreshCw size={12} className="animate-spin" />
                  ) : (
                    <BellRing size={12} />
                  )}
                  <span>{syncStatus ? 'Sinkronkan Ulang' : 'Sinkronkan Alarm'}</span>
                </button>
                <Link
                  to="/tka"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-medium bg-white/5 hover:bg-white/10 text-[#F5F3EE] border border-white/10 transition-all"
                >
                  <Target size={12} className="text-[#C8A96E]" />
                  <span>Hub TKA</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. JADWAL TKA SMA 2026 */}
      {!isMazet && (
        <Card className="p-4 sm:p-6 border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] space-y-4">
          {/* Header & Minimalist Segment Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--tf-border)] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[var(--tf-primary-subtle)] text-[var(--tf-primary)]">
                <CalendarDays size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base sm:text-lg text-[var(--tf-text-primary)]" style={{ fontFamily: 'var(--tf-font-display)' }}>
                    Jadwal Ujian TKA SMA 2026
                  </h3>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-[var(--tf-primary-subtle)] text-[var(--tf-primary)] border border-[var(--tf-border)]">
                    <CheckCircle2 size={11} /> Auto-Notif Terhubung
                  </span>
                </div>
                <p className="text-[11px] text-[var(--tf-text-muted)]">
                  Gelombang 1 • Sesi 1 (WIB) • 26 – 29 Okt 2026 • Klik ikon lonceng untuk setel alarm per hari
                </p>
              </div>
            </div>

            {/* Segment Tab Pills */}
            <div className="inline-flex rounded-xl bg-[var(--tf-bg-subtle)] p-1 text-xs font-medium shrink-0 border border-[var(--tf-border)]">
              <button
                type="button"
                onClick={() => setActiveTab('jadwal')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'jadwal'
                    ? 'bg-[var(--tf-bg-surface)] text-[var(--tf-primary)] font-semibold shadow-xs'
                    : 'text-[var(--tf-text-muted)] hover:text-[var(--tf-text-primary)]'
                }`}
              >
                Jadwal Ujian (4 Hari)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tahapan')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'tahapan'
                    ? 'bg-[var(--tf-bg-surface)] text-[var(--tf-primary)] font-semibold shadow-xs'
                    : 'text-[var(--tf-text-muted)] hover:text-[var(--tf-text-primary)]'
                }`}
              >
                Tahapan Resmi
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('rincian')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'rincian'
                    ? 'bg-[var(--tf-bg-surface)] text-[var(--tf-primary)] font-semibold shadow-xs'
                    : 'text-[var(--tf-text-muted)] hover:text-[var(--tf-text-primary)]'
                }`}
              >
                Rincian & Tips
              </button>
            </div>
          </div>

          {/* TAB 1: JADWAL UJIAN (Interactive Cards + Per-Day Alarm Sync) */}
          {activeTab === 'jadwal' && (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                {EXAM_DAYS_2026.map((item) => {
                  const isExpanded = expandedDay === item.hariKe;
                  const isTodayExam = todayWibStr === item.tanggal;
                  const isNextTarget = activeExamState.exam.hariKe === item.hariKe && activeExamState.state !== 'completed_all';

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
                      className={`group rounded-2xl border p-4 transition-all duration-200 ${
                        isTodayExam
                          ? 'border-rose-500/50 bg-rose-500/5 shadow-sm'
                          : isNextTarget
                          ? 'border-blue-500/40 bg-blue-500/5 shadow-xs'
                          : 'border-[var(--tf-border)] bg-[var(--tf-bg-subtle)]/40 hover:bg-[var(--tf-bg-subtle)] hover:border-blue-500/30'
                      }`}
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
                          {isTodayExam && (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-rose-500 text-white animate-pulse">
                              HARI INI
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[var(--tf-text-primary)] px-2 py-0.5 rounded-lg bg-[var(--tf-bg-surface)] border border-[var(--tf-border)]">
                            <Clock size={11} className="text-blue-500" />
                            {item.mulaiWib} - {item.perkiraanSelesaiWib} WIB
                          </span>
                          <button
                            type="button"
                            onClick={() => void handleSyncSingleDay(item.hariKe, item.shortTitle)}
                            disabled={syncingDay === item.hariKe}
                            title={`Aktifkan & Tes Notifikasi Hari Ke-${item.hariKe}`}
                            className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                          >
                            <BellRing size={12} className={syncingDay === item.hariKe ? 'animate-spin' : ''} />
                          </button>
                        </div>
                      </div>

                      {/* Subject Title */}
                      <h4 className="text-sm sm:text-base font-black text-[var(--tf-text-primary)] leading-snug">
                        {item.shortTitle}
                      </h4>
                      <p className="text-[11px] text-[var(--tf-text-muted)] mt-0.5">
                        {item.subtitle}
                      </p>

                      {/* Compact Chips: Durasi & Soal */}
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[var(--tf-bg-surface)] text-[var(--tf-text-primary)] border border-[var(--tf-border)]">
                          <Timer size={11} className="text-amber-500" />
                          {item.totalMenit} Menit
                        </span>
                        {item.chips.slice(1).map((chip, idx) => (
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
                          className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-0.5 cursor-pointer"
                        >
                          {isExpanded ? 'Tutup' : 'Rincian'}
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      </div>

                      {/* Expandable Step-by-Step Breakdown */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-[var(--tf-border)] space-y-1.5 text-xs animate-in fade-in duration-200">
                          {item.steps.map((st, i) => (
                            <div key={i} className="flex items-center justify-between text-[11px] py-1 px-2.5 rounded-lg bg-[var(--tf-bg-surface)] border border-[var(--tf-border)]/50">
                              <span className="text-[var(--tf-text-secondary)] font-medium">
                                {i + 1}. {st.name}
                              </span>
                              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                                {st.dur}
                              </span>
                            </div>
                          ))}
                          <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-200 leading-relaxed">
                            <strong>Tips Hari Ke-{item.hariKe}:</strong> {item.persiapanTips}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Minimalist Note + Quick Links */}
              <div className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-xs text-[var(--tf-text-muted)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="flex items-center gap-2">
                  <Info size={14} className="text-blue-500 shrink-0" />
                  <span>
                    Alarm otomatis berbunyi pada <strong>H-1 (19:00)</strong>, <strong>Pagi (05:30)</strong>, <strong>H-30m (06:30)</strong>, <strong>H-10m (06:50)</strong>, dan <strong>Mulai (07:00 WIB)</strong>.
                  </span>
                </span>
                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    to="/notifications"
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-xs"
                  >
                    Cek Kotak Masuk Notif
                  </Link>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <Link
                    to="/tka"
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-xs"
                  >
                    Simulasi CBT <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TAHAPAN RESMI (Minimalist Timeline) */}
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
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[var(--tf-text-primary)]">
                            {stg.nama}
                          </span>
                          {isCrucial && (
                            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 border border-rose-500/30">
                              Ujian Utama
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600">
                              Selesai
                            </span>
                          )}
                        </div>
                        {stg.catatan && (
                          <p className="text-[10px] text-[var(--tf-text-muted)] mt-0.5">{stg.catatan}</p>
                        )}
                      </div>
                    </div>

                    <span className="font-mono text-xs font-semibold text-[var(--tf-text-muted)] mt-1 sm:mt-0 ml-4 sm:ml-0">
                      {stg.rentangFormatted}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: RINCIAN WAKTU & TIPS PERSIAPAN */}
          {activeTab === 'rincian' && (
            <div className="space-y-2.5">
              <div className="grid gap-3 sm:grid-cols-2">
                {EXAM_DAYS_2026.map((item) => (
                  <div key={item.hariKe} className="p-3.5 rounded-2xl border border-[var(--tf-border)] bg-[var(--tf-bg-subtle)]/40 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-blue-600 dark:text-blue-400">
                        Hari Ke-{item.hariKe} • {item.tanggalFormatted}
                      </span>
                      <span className="font-mono font-bold text-[var(--tf-text-primary)] bg-[var(--tf-bg-surface)] px-2 py-0.5 rounded-md border border-[var(--tf-border)]">
                        {item.mulaiWib} - {item.perkiraanSelesaiWib} WIB ({item.totalMenit} mnt)
                      </span>
                    </div>
                    <div className="font-bold text-[var(--tf-text-primary)]">
                      {item.mapel}
                    </div>
                    <p className="text-[11px] text-[var(--tf-text-muted)] leading-relaxed">
                      {item.rincian}
                    </p>
                    <div className="pt-1.5 border-t border-[var(--tf-border)]/60 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                      Strategi: {item.persiapanTips}
                    </div>
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
