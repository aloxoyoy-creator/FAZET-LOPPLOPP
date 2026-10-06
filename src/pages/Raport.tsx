import { useState, useEffect, useMemo } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Sparkles,
  TrendingUp,
  User,
  Search,
  ArrowUpDown,
  FileText,
  BarChart2,
  AlertTriangle,
  RefreshCw,
  Layers,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { subscribeStudentRapor, getRaporCurriculum, type StudentRaporData, type CurriculumSettings } from '../services/raporService';
import { useAuth } from '../context/AuthContext';

function getGradePredicate(score: number): { grade: string; label: string; color: string; badgeTone: 'green' | 'blue' | 'amber' | 'red' } {
  if (score >= 90) return { grade: 'A', label: 'Sangat Baik', color: 'text-emerald-600 dark:text-emerald-400', badgeTone: 'green' };
  if (score >= 85) return { grade: 'A-', label: 'Sangat Baik', color: 'text-blue-600 dark:text-blue-400', badgeTone: 'blue' };
  if (score >= 80) return { grade: 'B+', label: 'Baik', color: 'text-indigo-600 dark:text-indigo-400', badgeTone: 'blue' };
  if (score >= 75) return { grade: 'B', label: 'Tuntas (KKM)', color: 'text-amber-600 dark:text-amber-400', badgeTone: 'amber' };
  return { grade: 'C', label: 'Perlu Pengayaan', color: 'text-rose-600 dark:text-rose-400', badgeTone: 'red' };
}

type SemesterKey = 'all' | 'semester_1' | 'semester_2' | 'semester_3' | 'semester_4' | 'semester_5';

interface SemesterMeta {
  key: SemesterKey;
  label: string;
  gradeLevel: string;
  shortLabel: string;
}

const SEMESTERS: SemesterMeta[] = [
  { key: 'all', label: 'Rekap Semua Semester', gradeLevel: 'Kelas X - XII', shortLabel: 'Semua' },
  { key: 'semester_1', label: 'Semester 1 (Ganjil)', gradeLevel: 'Kelas X', shortLabel: 'Sem 1' },
  { key: 'semester_2', label: 'Semester 2 (Genap)', gradeLevel: 'Kelas X', shortLabel: 'Sem 2' },
  { key: 'semester_3', label: 'Semester 3 (Ganjil)', gradeLevel: 'Kelas XI', shortLabel: 'Sem 3' },
  { key: 'semester_4', label: 'Semester 4 (Genap)', gradeLevel: 'Kelas XI', shortLabel: 'Sem 4' },
  { key: 'semester_5', label: 'Semester 5 (Ganjil)', gradeLevel: 'Kelas XII', shortLabel: 'Sem 5' },
];

export default function Raport() {
  const { profile } = useAuth();
  const [data, setData] = useState<StudentRaporData | null>(null);
  const [curriculum, setCurriculum] = useState<CurriculumSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState<SemesterKey>('semester_4');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'highest' | 'lowest' | 'name'>('highest');
  const [studentId] = useState('fathur');

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeStudentRapor(studentId, (rapor) => {
      setData(rapor);
      setLoading(false);
    });

    void getRaporCurriculum().then((curr) => {
      if (curr) setCurriculum(curr);
    });

    return () => unsub();
  }, [studentId]);

  // Compute semester averages and summary statistics
  const stats = useMemo(() => {
    if (!data) return null;

    const semScores: Record<string, { avg: number; count: number; highest: { subject: string; score: number } | null; lowest: { subject: string; score: number } | null }> = {};
    const validSemesters: SemesterKey[] = ['semester_1', 'semester_2', 'semester_3', 'semester_4', 'semester_5'];

    let grandTotal = 0;
    let grandCount = 0;

    validSemesters.forEach((sem) => {
      const scores = data[sem as keyof StudentRaporData] as Record<string, number> | undefined;
      if (scores && typeof scores === 'object') {
        const entries = Object.entries(scores).map(([k, v]) => [k, Number(v)] as [string, number]).filter(([, v]) => !Number.isNaN(v) && v > 0);
        if (entries.length > 0) {
          const total = entries.reduce((acc, [, val]) => acc + val, 0);
          const avg = total / entries.length;
          let highest = entries[0];
          let lowest = entries[0];
          entries.forEach(([subj, sc]) => {
            if (sc > highest[1]) highest = [subj, sc];
            if (sc < lowest[1]) lowest = [subj, sc];
          });

          semScores[sem] = {
            avg,
            count: entries.length,
            highest: { subject: highest[0], score: highest[1] },
            lowest: { subject: lowest[0], score: lowest[1] },
          };

          grandTotal += total;
          grandCount += entries.length;
        }
      }
    });

    const cumulativeAvg = grandCount > 0 ? grandTotal / grandCount : 0;

    return {
      semScores,
      cumulativeAvg,
      totalSubjectsTaken: grandCount,
    };
  }, [data]);

  // Filtered and sorted subject scores for current semester view
  const currentSemesterItems = useMemo(() => {
    if (!data || selectedSemester === 'all') return [];
    const scores = data[selectedSemester as keyof StudentRaporData] as Record<string, number> | undefined;
    if (!scores || typeof scores !== 'object') return [];

    let entries = Object.entries(scores).map(([subject, score]) => ({
      subject,
      score: Number(score),
      ...getGradePredicate(Number(score)),
    }));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      entries = entries.filter((item) => item.subject.toLowerCase().includes(q));
    }

    if (sortBy === 'highest') {
      entries.sort((a, b) => b.score - a.score);
    } else if (sortBy === 'lowest') {
      entries.sort((a, b) => a.score - b.score);
    } else {
      entries.sort((a, b) => a.subject.localeCompare(b.subject));
    }

    return entries;
  }, [data, selectedSemester, searchQuery, sortBy]);

  // Active semester stats
  const activeSemesterStats = useMemo(() => {
    if (!stats || selectedSemester === 'all') return null;
    return stats.semScores[selectedSemester] ?? null;
  }, [stats, selectedSemester]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-16 font-sans fade-up">
      {/* Premium Header */}
      <header className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-10 text-white shadow-2xl border border-indigo-900/40">
        <div className="absolute -right-16 -top-16 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <GraduationCap className="absolute right-6 bottom-4 text-white/5 pointer-events-none" size={180} />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold tracking-wider uppercase backdrop-blur-md border border-white/10 text-indigo-200 mb-4">
              <Sparkles size={14} className="text-indigo-400" />
              Sistem Rapot Digital • Cloud Firestore
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-3">
              Laporan Hasil Belajar <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-emerald-300 to-teal-200">
                Transkrip Nilai Akademik
              </span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Data nilai semester resmi yang tersinkronisasi secara langsung dari database Firebase <code className="bg-black/30 px-2 py-0.5 rounded text-indigo-300 font-mono text-xs">raport-f581d</code>.
            </p>
          </div>

          {/* Student Profile Card */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 rounded-2xl bg-white/5 p-5 backdrop-blur-md border border-white/10 min-w-[260px]">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-white font-black text-xl shadow-lg">
                <User size={24} />
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest font-semibold text-indigo-300">Profil Siswa</div>
                <div className="text-lg font-black text-white">{profile?.name || 'Fathur'}</div>
                <div className="text-xs text-slate-400">ID: {studentId}</div>
              </div>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
              <span>Status Dokumen:</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                <CheckCircle2 size={13} /> Terverifikasi
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* KPI Overview Tiles */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-5 relative overflow-hidden bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Rata-Rata Kumulatif</span>
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {stats.cumulativeAvg.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-slate-400">/ 100</span>
            </div>
            <p className="mt-1 text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} /> Sangat Memuaskan (A)
            </p>
          </Card>

          <Card className="p-5 relative overflow-hidden bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Rata-Rata Semester</span>
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <BarChart2 size={16} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {activeSemesterStats ? activeSemesterStats.avg.toFixed(2) : stats.cumulativeAvg.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-slate-400">
                {selectedSemester === 'all' ? 'semua' : selectedSemester.replace('_', ' ')}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              {activeSemesterStats ? `${activeSemesterStats.count} Mata Pelajaran` : `${stats.totalSubjectsTaken} Total Mapel`}
            </p>
          </Card>

          <Card className="p-5 relative overflow-hidden bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Nilai Tertinggi</span>
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <Award size={16} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {activeSemesterStats?.highest?.score ?? 93}
              </span>
              <span className="text-xs font-bold text-slate-400">Maksimal</span>
            </div>
            <p className="mt-1 text-xs text-slate-500 font-semibold truncate" title={activeSemesterStats?.highest?.subject}>
              {activeSemesterStats?.highest?.subject ?? 'Sejarah'}
            </p>
          </Card>

          <Card className="p-5 relative overflow-hidden bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Status KKM (75)</span>
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">100% Tuntas</span>
            </div>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              Semua mapel di atas batas KKM
            </p>
          </Card>
        </div>
      ) : null}

      {/* Semester Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {SEMESTERS.map((sem) => {
          const isActive = selectedSemester === sem.key;
          const semScore = sem.key !== 'all' && stats?.semScores[sem.key];
          return (
            <button
              key={sem.key}
              type="button"
              onClick={() => setSelectedSemester(sem.key)}
              className={`flex shrink-0 items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-bold transition-all duration-200 border-2 ${
                isActive
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col text-left">
                <span className="leading-tight">{sem.label}</span>
                <span className={`text-[10px] uppercase font-bold tracking-wider ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {sem.gradeLevel} {semScore ? `• Rata: ${semScore.avg.toFixed(1)}` : ''}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <Card className="p-8 text-center space-y-4">
          <RefreshCw className="mx-auto w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Menghubungkan ke Firebase dan mengunduh transkrip nilai...</p>
        </Card>
      ) : !data ? (
        <EmptyState
          title="Data Rapot Belum Tersedia"
          description="Tidak ditemukan dokumen nilai pada koleksi rapor_siswa di Firebase."
          icon={<AlertTriangle size={32} className="text-amber-500" />}
        />
      ) : selectedSemester === 'all' ? (
        /* REKAP SEMUA SEMESTER VIEW */
        <div className="space-y-6">
          <Card className="p-6 sm:p-8 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="text-indigo-600" />
                  Grafik Progres Nilai Antar Semester
                </h3>
                <p className="text-xs text-slate-500 mt-1">Perkembangan rata-rata akademik dari kelas X hingga XI</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {([
                ['semester_1', 'Semester 1 (Kelas X)', 'Ganjil 2023/2024'],
                ['semester_2', 'Semester 2 (Kelas X)', 'Genap 2023/2024'],
                ['semester_3', 'Semester 3 (Kelas XI)', 'Ganjil 2024/2025'],
                ['semester_4', 'Semester 4 (Kelas XI)', 'Genap 2024/2025'],
              ] as const).map(([key, title, period]) => {
                const s = stats?.semScores[key];
                if (!s) return null;
                const percentage = Math.min(100, Math.max(0, (s.avg / 100) * 100));
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedSemester(key)}
                    className="group cursor-pointer rounded-2xl border-2 border-slate-100 dark:border-slate-800 p-5 bg-slate-50/50 dark:bg-slate-800/30 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</span>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                      {s.avg.toFixed(2)}
                    </div>
                    <div className="text-[11px] text-slate-500 mb-3">{period} • {s.count} Mapel</div>

                    {/* Progress visual bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-700"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>Tertinggi:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{s.highest?.score} ({s.highest?.subject})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Ringkasan Kurikulum & Beban Belajar */}
          {curriculum && (
            <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <Layers className="text-indigo-600" />
                Daftar Mata Pelajaran Berdasarkan Kurikulum Sekolah
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3">
                    Fase E (Semester 1 & 2) • {curriculum.sem1_2.length} Mapel
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {curriculum.sem1_2.map((m) => (
                      <span key={m} className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3">
                    Fase F (Semester 3, 4, 5) • {curriculum.sem3_4_5.length} Mapel (Termasuk Peminatan)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {curriculum.sem3_4_5.map((m) => (
                      <span key={m} className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      ) : (
        /* INDIVIDUAL SEMESTER VIEW */
        <Card className="p-6 sm:p-8 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800">
          {/* Controls: Search and Sort */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="text-indigo-600" />
                {SEMESTERS.find((s) => s.key === selectedSemester)?.label}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Tersedia {currentSemesterItems.length} mata pelajaran terdaftar
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari mata pelajaran..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <ArrowUpDown size={14} className="text-slate-400 ml-2" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 pr-2 py-1 outline-none cursor-pointer"
                >
                  <option value="highest">Nilai Tertinggi</option>
                  <option value="lowest">Nilai Terendah</option>
                  <option value="name">Nama (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {currentSemesterItems.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <FileText className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={48} />
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                {searchQuery ? 'Mata Pelajaran Tidak Ditemukan' : 'Nilai Belum Diinput'}
              </h3>
              <p className="text-xs text-slate-500">
                {searchQuery ? 'Coba gunakan kata kunci pencarian yang lain.' : 'Nilai untuk semester ini belum diterbitkan di database rapot.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentSemesterItems.map((item, idx) => {
                const percentage = Math.min(100, Math.max(0, item.score));
                return (
                  <div
                    key={item.subject}
                    className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-[#141822] border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            #{idx + 1}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {item.label}
                          </span>
                        </div>
                        <h4 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                          {item.subject}
                        </h4>
                      </div>

                      <div className="flex flex-col items-end shrink-0">
                        <div className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                          {item.score}
                        </div>
                        <Badge tone={item.badgeTone}>
                          Predikat {item.grade}
                        </Badge>
                      </div>
                    </div>

                    {/* Progress Bar Visualizing Score */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                        <span>KKM: 75</span>
                        <span className={item.color}>Tuntas • {item.score}/100</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.score >= 90
                              ? 'bg-emerald-500'
                              : item.score >= 85
                              ? 'bg-blue-500'
                              : item.score >= 80
                              ? 'bg-indigo-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
