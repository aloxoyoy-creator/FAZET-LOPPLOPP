import { useState, useEffect } from 'react';
import { 
  Calendar, Flame, Clock, CheckCircle2, AlertCircle, Info, 
  BookOpen, ChevronRight, Layers, Sparkles, Timer, ShieldCheck,
  CalendarDays, Hourglass, HelpCircle
} from 'lucide-react';
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

export default function TKADashboard({ className = '' }: Props) {
  const { workspaceId } = useWorkspace();
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'jadwal' | 'tahapan' | 'rincian'>('jadwal');
  const [selectedDay, setSelectedDay] = useState<number>(1);

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

  return (
    <div className={`space-y-5 mb-8 ${className}`}>
      {/* 1. HERO COUNTDOWN (Sisakan Countdown Saja) */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl group text-white">
        {/* Glow Accents */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/25 via-blue-600/15 to-purple-600/10 mix-blend-screen pointer-events-none" />
        <div className="absolute -top-[40%] -left-[10%] w-[55%] h-[140%] bg-blue-500/15 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute -bottom-[30%] -right-[10%] w-[45%] h-[120%] bg-violet-600/15 blur-[90px] pointer-events-none rounded-full" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-6 sm:p-8 gap-6">
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
              <Badge variant="warning" className="inline-flex shadow-[0_0_15px_rgba(251,146,60,0.35)]">
                <Flame size={14} className="mr-1.5" /> 
                {isMazet ? 'Event Terbesar Tahun Ini' : 'Jadwal TKA SMA 2026'}
              </Badge>
              {!isMazet && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Gelombang 1 • Sesi 1 (WIB)
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 mb-2 leading-tight">
              {isMazet ? 'BAZAR EDSA 2026' : 'Jadwal Ujian TKA SMA 2026'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-xl line-clamp-2 md:line-clamp-none">
              {isMazet
                ? 'Persiapan dan countdown menuju kemeriahan Bazar EDSA.'
                : TKA_SCHEDULE_2026_META.subjudul}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-blue-400" />
                {isMazet ? '26 Oktober 2026' : 'Mulai: Senin, 26 Okt 2026'}
              </span>
              {!isMazet && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-emerald-400" />
                    Pukul 07.00 WIB
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-violet-400" />
                    Zona Waktu: WIB
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Countdown Boxes */}
          <div className="flex gap-2.5 sm:gap-3.5 font-mono w-full md:w-auto justify-center shrink-0">
            {timeLeft ? (
              [
                { label: 'Hari', val: timeLeft.days },
                { label: 'Jam', val: timeLeft.hours.toString().padStart(2, '0') },
                { label: 'Menit', val: timeLeft.minutes.toString().padStart(2, '0') },
                { label: 'Detik', val: timeLeft.seconds.toString().padStart(2, '0') },
              ].map((item) => (
                <div 
                  key={item.label} 
                  className="flex flex-col items-center justify-center bg-white/10 hover:bg-white/15 transition-all backdrop-blur-md rounded-2xl p-2.5 sm:p-3 min-w-[65px] sm:min-w-[76px] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                >
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-0.5 tracking-tight">
                    {item.val}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    {item.label}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-4 bg-emerald-500 rounded-2xl text-white font-bold animate-pulse text-sm">
                Sedang Berlangsung!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. JADWAL TKA GANTIANNYA (Hanya untuk Workspace/Profil Fathur) */}
      {!isMazet && (
        <Card className="p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
          {/* Header & Navigation Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                  <CalendarDays size={20} />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Rangkaian Jadwal Ujian TKA SMA 2026
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Data resmi dirangkum dari media pendidikan untuk Gelombang 1, Sesi 1 (WIB).
              </p>
            </div>

            {/* Tab Buttons */}
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 text-xs font-bold shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('jadwal')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'jadwal'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Calendar size={13} /> Jadwal Ujian (4 Hari)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tahapan')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'tahapan'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Layers size={13} /> Tahapan Lain
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('rincian')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'rincian'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Hourglass size={13} /> Rincian Waktu
              </button>
            </div>
          </div>

          {/* TAB 1: JADWAL UJIAN 4 HARI */}
          {activeTab === 'jadwal' && (
            <div className="space-y-4">
              <div className="grid gap-3.5 sm:grid-cols-2">
                {EXAM_DAYS_2026.map((item) => {
                  const isSelected = selectedDay === item.hariKe;
                  return (
                    <div
                      key={item.hariKe}
                      onClick={() => setSelectedDay(item.hariKe)}
                      className={`cursor-pointer group relative overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all duration-300 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 shadow-md shadow-blue-500/5 ring-1 ring-blue-500'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black text-white bg-gradient-to-r ${item.colorTone} shadow-xs`}>
                            {item.badgeLabel}
                          </span>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {item.tanggalFormatted}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 font-mono text-xs font-black text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                          <Clock size={12} className="text-blue-500" />
                          {item.mulaiWib} - {item.perkiraanSelesaiWib} WIB
                        </div>
                      </div>

                      <h4 className="text-base font-extrabold text-slate-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                        {item.mapel}
                      </h4>

                      <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-medium flex items-center gap-1.5">
                          <Timer size={13} className="text-amber-500" /> Total durasi: <strong className="text-slate-700 dark:text-slate-300 font-bold">{item.totalMenit} Menit</strong>
                        </span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                          Rincian <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>

                      {/* Rincian Expandable Preview */}
                      <div className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800/90 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 font-medium">
                        {item.rincian}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Catatan Durasi */}
              <div className="rounded-2xl border border-blue-200/80 bg-blue-50/70 p-3.5 dark:border-blue-900/50 dark:bg-blue-950/20 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
                <Info size={16} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
                <p className="leading-relaxed">
                  <strong>Catatan Durasi:</strong> {TKA_SCHEDULE_2026_META.catatanDurasi}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: TAHAPAN LAIN */}
          {activeTab === 'tahapan' && (
            <div className="space-y-4">
              <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3.5 space-y-6 py-2">
                {TKA_STAGES_2026.map((stg) => {
                  const isCrucial = stg.status === 'crucial';
                  const isCompleted = stg.status === 'completed';
                  const isOngoing = stg.status === 'ongoing';

                  return (
                    <div key={stg.id} className="relative pl-6 group">
                      {/* Node Bullet */}
                      <span
                        className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 transition-all ${
                          isCrucial
                            ? 'border-rose-500 bg-rose-500 ring-4 ring-rose-500/20 animate-pulse'
                            : isOngoing
                            ? 'border-blue-500 bg-blue-500 ring-4 ring-blue-500/20'
                            : isCompleted
                            ? 'border-emerald-500 bg-emerald-500'
                            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                        }`}
                      />

                      <div className={`p-4 rounded-2xl border transition-all ${
                        isCrucial
                          ? 'border-rose-300 bg-rose-50/40 dark:border-rose-900/60 dark:bg-rose-950/20 shadow-xs'
                          : isOngoing
                          ? 'border-blue-300 bg-blue-50/30 dark:border-blue-900/50 dark:bg-blue-950/10'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30'
                      }`}>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                            {stg.nama}
                            {isCrucial && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white uppercase tracking-wider">
                                Fokus Utama
                              </span>
                            )}
                            {isOngoing && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500 text-white uppercase tracking-wider">
                                Sesi Berjalan
                              </span>
                            )}
                            {isCompleted && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                                Selesai
                              </span>
                            )}
                          </h4>
                          <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                            {stg.rentangFormatted}
                          </span>
                        </div>

                        {stg.catatan && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                            *{stg.catatan}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: RINCIAN WAKTU & SUBTES */}
          {activeTab === 'rincian' && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {EXAM_DAYS_2026.map((item) => (
                  <div key={item.hariKe} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                        {item.hari}, {item.tanggalFormatted.split(',')[1]}
                      </span>
                      <span className="text-xs font-bold text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                        {item.totalMenit} Menit
                      </span>
                    </div>
                    <div className="text-sm font-black text-slate-900 dark:text-white mb-2">
                      {item.mapel}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700/80">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Waktu Pelaksanaan:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{item.mulaiWib} - {item.perkiraanSelesaiWib} WIB</span>
                      </div>
                      <div className="pt-1.5 border-t border-slate-100 dark:border-slate-700/60 leading-relaxed font-medium">
                        {item.rincian}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer & Catatan Sumber */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-start gap-2">
              <AlertCircle size={15} className="mt-0.5 shrink-0 text-slate-400" />
              <p className="leading-relaxed">
                {TKA_SCHEDULE_2026_META.catatanSumber}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
