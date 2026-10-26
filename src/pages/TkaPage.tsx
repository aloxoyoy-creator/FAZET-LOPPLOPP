import { useState, useEffect, useMemo } from 'react';
import { 
  Target, CheckCircle2, ChevronRight, Lock, Play, 
  Clock, AlertCircle, RotateCcw, 
  Eye, X, Award, Filter, BookMarked, BellRing, RefreshCw, CalendarDays, Timer, Info,
  Sparkles, BarChart3, Keyboard, Brain, Loader2
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { tkaQuestions, type Question } from '../data/tkaQuestions';
import { EXAM_DAYS_2026, TKA_STAGES_2026 } from '../data/tkaSchedule2026';
import {
  syncTkaToNotifications,
  notifyTkaTryoutCompleted,
  getSavedTkaSyncStatus,
  type TkaSyncStatus
} from '../services/tkaNotificationService';
import { askAiAssistant } from '../services/aiAssistantService';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { useToast } from '../components/ui/Toast';
import confetti from 'canvas-confetti';

interface SubtestInfo {
  id: string;
  name: string;
  subjectFilter: string;
  progress: number;
  total: number;
  completed: number;
  description: string;
  keyTopics: string[];
  tips: string;
}

const SUBTESTS: SubtestInfo[] = [
  { 
    id: 'pu', 
    name: 'Penalaran Umum (PU)', 
    subjectFilter: 'Penalaran Umum (PU)',
    progress: 78, total: 30, completed: 23,
    description: 'Mengukur kemampuan berpikir logis, induktif, deduktif, serta penalaran analitik dan kuantitatif.',
    keyTopics: ['Silogisme & Modus Ponens/Tollens', 'Pola Barisan & Deret Bilangan', 'Analogi Hubungan Kata', 'Penarikan Simpulan & Argumen'],
    tips: 'Perhatikan kata kunci absolut seperti "semua", "sebagian", atau "tidak satupun". Jangan gunakan asumsi di luar teks.'
  },
  { 
    id: 'pk', 
    name: 'Pengetahuan Kuantitatif (PK)', 
    subjectFilter: 'Pengetahuan Kuantitatif (PK)',
    progress: 60, total: 40, completed: 24,
    description: 'Mengukur penguasaan dasar matematika, aljabar, fungsi komposisi, statistika, peluang, dan geometri.',
    keyTopics: ['Persamaan Aljabar & Eksponen', 'Geometri Segitiga & Lingkaran', 'Statistika & Peluang Kombinatorika', 'Fungsi Komposisi & Invers'],
    tips: 'Kuasai rumus identitas aljabar cepat seperti (a+b)², selisih kuadrat, dan triple Pythagoras.'
  },
  { 
    id: 'lit_en', 
    name: 'Literasi Bahasa Inggris', 
    subjectFilter: 'Bahasa Inggris',
    progress: 85, total: 30, completed: 25,
    description: 'Mengukur kompetensi memahami teks narasi, eksposisi, pesan moral, dan simpulan bacaan bahasa Inggris.',
    keyTopics: ['Main Idea & Paragraph Summary', 'Author Purpose & Tone', 'Vocabulary in Context', 'Detail & Negative Fact Questions'],
    tips: 'Skim pertanyaan terlebih dahulu sebelum membaca teks lengkap untuk menemukan kata kunci efisien.'
  },
  { 
    id: 'lit_id', 
    name: 'Literasi Bahasa Indonesia', 
    subjectFilter: 'Literasi Bahasa Indonesia',
    progress: 82, total: 30, completed: 25,
    description: 'Mengukur kemampuan menyerap esensi teks ilmiah, opini, dan kalimat efektif bahasa Indonesia (EYD V).',
    keyTopics: ['Ide Pokok & Kalimat Utama', 'Sikap & Keberpihakan Penulis', 'Verifikasi Pernyataan Sesuai Teks', 'Kalimat Efektif & EYD V'],
    tips: 'Ide pokok biasanya terletak pada kalimat pertama (deduktif) atau kalimat akhir (induktif).'
  },
  { 
    id: 'pm', 
    name: 'Penalaran Matematika (PM)', 
    subjectFilter: 'Penalaran Matematika',
    progress: 65, total: 20, completed: 13,
    description: 'Menguji kemampuan menggunakan konsep matematika dalam memecahkan masalah kontekstual kehidupan nyata.',
    keyTopics: ['Aritmetika Sosial & Diskon Bertingkat', 'Debit & Laju Aliran Bersih', 'Perbandingan Berbalik Nilai (Proyek)', 'Sistem Persamaan Linear Kontekstual'],
    tips: 'Terjemahkan narasi soal ke dalam model persamaan matematika sebelum menghitung angka akhir.'
  },
];

interface TryoutHistory {
  id: string;
  name: string;
  date: string;
  score: number;
  correct: number;
  total: number;
  durationMinutes: number;
}

const STORAGE_HISTORY = 'fazet_tka_history';

export default function TkaPage() {
  const { user } = useAuth();
  const { workspaceId } = useWorkspace();
  const { push } = useToast();

  const [activeTab, setActiveTab] = useState<'materi' | 'tryout' | 'jadwal'>('materi');
  const [selectedSubtest, setSelectedSubtest] = useState<SubtestInfo | null>(null);
  const [syncStatus, setSyncStatus] = useState<TkaSyncStatus | null>(() => getSavedTkaSyncStatus());
  const [syncing, setSyncing] = useState(false);
  const [syncingDay, setSyncingDay] = useState<number | null>(null);
  
  // Quiz State
  const [quizStarted, setQuizStarted] = useState(false);
  const [activeFilterSubject, setActiveFilterSubject] = useState<string>('Semua');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [doubtful, setDoubtful] = useState<Record<string, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  // AI Tutor Deep Explanation State in Review Mode
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});
  const [aiLoadingId, setAiLoadingId] = useState<string | null>(null);

  // Timer State (30 Menit default)
  const [timeLeft, setTimeLeft] = useState<number>(1800);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // History State
  const [history, setHistory] = useState<TryoutHistory[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_HISTORY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      { id: 'h_1', name: 'Simulasi Mandiri #1 (Bahasa Inggris)', date: '2026-10-20', score: 720, correct: 18, total: 25, durationMinutes: 28 },
      { id: 'h_2', name: 'Tryout Akbar Nasional #3', date: '2026-10-24', score: 760, correct: 19, total: 25, durationMinutes: 30 },
    ];
  });

  useEffect(() => {
    const onSynced = (e: Event) => {
      const custom = e as CustomEvent<TkaSyncStatus>;
      if (custom.detail) setSyncStatus(custom.detail);
    };
    window.addEventListener('fazet:tka-synced', onSynced);
    return () => window.removeEventListener('fazet:tka-synced', onSynced);
  }, []);

  const activeQuestions: Question[] = useMemo(() => {
    if (activeFilterSubject === 'Semua') return tkaQuestions;
    const filtered = tkaQuestions.filter(q => q.subject.toLowerCase().includes(activeFilterSubject.toLowerCase()));
    return filtered.length > 0 ? filtered : tkaQuestions;
  }, [activeFilterSubject]);

  const currentQ = activeQuestions[currentQuestionIndex] || activeQuestions[0];

  const subtestCounts = useMemo(() => {
    const countFor = (sub: string) => tkaQuestions.filter(q => q.subject.toLowerCase().includes(sub.toLowerCase())).length;
    return [
      { name: 'Bahasa Inggris', count: countFor('Bahasa Inggris') },
      { name: 'Penalaran Umum (PU)', count: countFor('Penalaran Umum') },
      { name: 'Pengetahuan Kuantitatif (PK)', count: countFor('Pengetahuan Kuantitatif') },
      { name: 'Literasi Bahasa Indonesia', count: countFor('Literasi Bahasa Indonesia') },
      { name: 'Penalaran Matematika', count: countFor('Penalaran Matematika') },
    ];
  }, []);

  // Active Timer Effect
  useEffect(() => {
    if (!quizStarted || isFinished) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          void handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizStarted, isFinished]);

  // Pro CBT Keyboard Shortcuts (A-E to select option, Left/Right arrows to navigate, R to toggle doubtful)
  useEffect(() => {
    if (!quizStarted || isFinished || showConfirmModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();

      if (['a', 'b', 'c', 'd', 'e'].includes(key)) {
        const idx = key.charCodeAt(0) - 97;
        const opt = currentQ?.options[idx];
        if (opt) {
          e.preventDefault();
          setAnswers(prev => ({ ...prev, [currentQ.id]: opt.id }));
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentQuestionIndex(prev => Math.min(activeQuestions.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
      } else if (key === 'r') {
        e.preventDefault();
        if (currentQ) {
          setDoubtful(prev => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quizStarted, isFinished, showConfirmModal, currentQ, activeQuestions.length]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleStartExam = (subjectFilter = 'Semua') => {
    setActiveFilterSubject(subjectFilter);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setDoubtful({});
    setIsFinished(false);
    setReviewMode(false);
    setTimeLeft(subjectFilter === 'Semua' ? 2700 : 900); // 45m untuk paket lengkap (47 soal) atau 15m untuk subtes
    setQuizStarted(true);
  };

  const handleFinishExam = async () => {
    let correctCount = 0;
    activeQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswerId) correctCount += 1;
    });

    const finalScore = Math.round((correctCount / activeQuestions.length) * 1000);
    const accuracy = Math.round((correctCount / activeQuestions.length) * 100);
    const initialDuration = activeFilterSubject === 'Semua' ? 2700 : 900;
    const timeSpentMinutes = Math.max(1, Math.round((initialDuration - timeLeft) / 60));
    const tryoutName = activeFilterSubject === 'Semua'
      ? `TryOut Simulasi Lengkap (${activeQuestions.length} Soal)`
      : `Latihan Subtes ${activeFilterSubject}`;

    const newHistory: TryoutHistory = {
      id: `to_${Date.now()}`,
      name: tryoutName,
      date: new Date().toISOString().split('T')[0],
      score: finalScore,
      correct: correctCount,
      total: activeQuestions.length,
      durationMinutes: timeSpentMinutes,
    };

    const updated = [newHistory, ...history];
    setHistory(updated);
    try {
      localStorage.setItem(STORAGE_HISTORY, JSON.stringify(updated));
      confetti({ particleCount: 90, spread: 85, origin: { y: 0.6 } });
    } catch {}

    setIsFinished(true);
    setShowConfirmModal(false);

    // Sync TryOut result to Notification Center & OS Notification
    await notifyTkaTryoutCompleted({
      userId: user?.id,
      tryoutName,
      score: finalScore,
      correct: correctCount,
      total: activeQuestions.length,
      accuracy,
      durationMinutes: timeSpentMinutes,
    });
  };

  const handleAskAiTutor = async (q: Question, userAnsId?: string) => {
    if (aiLoadingId) return;
    setAiLoadingId(q.id);
    try {
      const correctOpt = q.options.find(o => o.id === q.correctAnswerId)?.text || q.correctAnswerId;
      const userOpt = userAnsId ? (q.options.find(o => o.id === userAnsId)?.text || userAnsId) : 'Tidak dijawab';
      const prompt = `Kamu adalah Tutor Ahli TKA & UTBK SNBT 2026. Jelaskan secara ringkas, langkah demi langkah, dan mudah dipahami mengapa jawaban yang benar untuk soal subtes ${q.subject} berikut adalah "${correctOpt}".
Soal: ${q.text}
Jawaban siswa: "${userOpt}"
Berikan juga 1 trik cepat menjawab tipe soal ini saat ujian.`;

      const reply = await askAiAssistant({ prompt, workspace: workspaceId });
      setAiExplanations(prev => ({ ...prev, [q.id]: reply }));
    } catch {
      setAiExplanations(prev => ({
        ...prev,
        [q.id]: q.explanation || 'Fokus pada kata kunci soal dan eliminasi opsi yang bertentangan dengan premis utama.'
      }));
    } finally {
      setAiLoadingId(null);
    }
  };

  const handleSyncAllAlarms = async () => {
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
        title: 'TKA 2026 Tersinkronisasi ke Notifikasi!',
        description: `Seluruh 4 hari jadwal ujian & ${res.scheduledCount} alarm otomatis telah aktif di sistem dan Kotak Masuk Notifikasi.`
      });
    } catch {
      push({
        tone: 'danger',
        title: 'Gagal menyinkronkan notifikasi TKA'
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncDay = async (hariKe: number, shortTitle: string) => {
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
        title: `Alarm Hari Ke-${hariKe} Aktif!`,
        description: `Pengingat untuk ${shortTitle} telah dikirim ke perangkat dan Pusat Notifikasi.`
      });
    } catch {
      push({
        tone: 'danger',
        title: 'Gagal menyetel alarm'
      });
    } finally {
      setSyncingDay(null);
    }
  };

  const toggleDoubtful = () => {
    if (!currentQ) return;
    setDoubtful(prev => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };

  // HASIL UJIAN + DIAGNOSTIK PER SUBTES
  if (isFinished) {
    let correctCount = 0;
    let wrongCount = 0;
    let emptyCount = 0;

    const subjectBreakdown: Record<string, { total: number; correct: number }> = {};

    activeQuestions.forEach(q => {
      if (!subjectBreakdown[q.subject]) {
        subjectBreakdown[q.subject] = { total: 0, correct: 0 };
      }
      subjectBreakdown[q.subject].total += 1;

      const ans = answers[q.id];
      if (!ans) {
        emptyCount += 1;
      } else if (ans === q.correctAnswerId) {
        correctCount += 1;
        subjectBreakdown[q.subject].correct += 1;
      } else {
        wrongCount += 1;
      }
    });

    const finalScore = Math.round((correctCount / activeQuestions.length) * 1000);
    const accuracy = Math.round((correctCount / activeQuestions.length) * 100);
    const gradeInfo =
      finalScore >= 800
        ? { grade: 'A+ (Sangat Unggul)', desc: 'Peluang lolos PTN Top 3 / Kedokteran / Teknik sangat tinggi!', tone: 'text-emerald-600 dark:text-emerald-400' }
        : finalScore >= 680
          ? { grade: 'A (Kompetitif)', desc: 'Skor aman untuk mayoritas prodi favorit klaster Saintek/Soshum.', tone: 'text-blue-600 dark:text-blue-400' }
          : finalScore >= 550
            ? { grade: 'B (Menengah)', desc: 'Perkuat kembali subtes dengan akurasi di bawah 65%.', tone: 'text-amber-600 dark:text-amber-400' }
            : { grade: 'C (Perlu Intensif)', desc: 'Pelajari pembahasan tiap soal di bawah ini dan ulangi latihan subtes.', tone: 'text-rose-600 dark:text-rose-400' };

    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-24 text-center mt-4 fade-up">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-sm">
          <Award size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Evaluasi TryOut TKA & SNBT Selesai!</h2>
        <p className="text-slate-500 text-sm max-w-lg mx-auto">
          Hasil ujian telah dianalisis dengan pembobotan IRT Skala 1000 dan disinkronisasikan otomatis ke Pusat Notifikasi.
        </p>

        {/* Skor Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto my-6 text-center">
          <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 border-blue-200">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Skor IRT</div>
            <div className="text-4xl font-black text-blue-600 dark:text-blue-400 mt-1">{finalScore}</div>
            <div className="text-[10px] text-blue-500 font-bold mt-1">Skala 1000</div>
          </Card>
          <Card className="p-5 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jawaban Benar</div>
            <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{correctCount}</div>
            <div className="text-[10px] text-emerald-500 font-bold mt-1">Dari {activeQuestions.length} Soal</div>
          </Card>
          <Card className="p-5 bg-rose-50 dark:bg-rose-950/30 border-rose-200">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jawaban Salah</div>
            <div className="text-4xl font-black text-rose-600 dark:text-rose-400 mt-1">{wrongCount}</div>
            <div className="text-[10px] text-rose-500 font-bold mt-1">{emptyCount} Kosong</div>
          </Card>
          <Card className="p-5 bg-slate-50 dark:bg-slate-900 border-slate-200">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Akurasi</div>
            <div className="text-4xl font-black text-slate-800 dark:text-slate-200 mt-1">{accuracy}%</div>
            <div className={`text-[10px] font-bold mt-1 ${gradeInfo.tone}`}>{gradeInfo.grade}</div>
          </Card>
        </div>

        {/* Diagnostik Per Subtes */}
        <Card className="p-5 sm:p-6 max-w-3xl mx-auto text-left border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                Analisis Diagnostik Penguasaan Per Subtes
              </h3>
            </div>
            <span className={`text-xs font-extrabold ${gradeInfo.tone}`}>{gradeInfo.desc}</span>
          </div>

          <div className="space-y-3">
            {Object.entries(subjectBreakdown).map(([subj, stat]) => {
              const pct = Math.round((stat.correct / stat.total) * 100);
              return (
                <div key={subj} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-200">{subj}</span>
                    <span className="font-mono text-slate-600 dark:text-slate-300">
                      {stat.correct}/{stat.total} Benar ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Buttons Action */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => setReviewMode(!reviewMode)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 text-sm px-6"
            icon={<Eye size={16} />}
          >
            {reviewMode ? 'Sembunyikan Pembahasan' : 'Lihat Pembahasan Lengkap & AI Tutor '}
          </Button>

          <button
            onClick={() => {
              setIsFinished(false);
              setQuizStarted(false);
            }}
            className="px-6 py-2.5 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-sm transition-all"
          >
            Kembali ke Hub TKA
          </button>
        </div>

        {/* REVIEW MODE LIST */}
        {reviewMode && (
          <div className="mt-10 text-left space-y-6 max-w-4xl mx-auto">
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BookMarked size={20} className="text-indigo-600" /> Kunci Jawaban, Pembahasan & Analisis AI Tutor
            </h3>

            {activeQuestions.map((q, idx) => {
              const userAns = answers[q.id];
              const isCorrect = userAns === q.correctAnswerId;
              const isSkipped = !userAns;

              return (
                <Card key={q.id} className={`p-6 border-2 ${isCorrect ? 'border-emerald-200 bg-emerald-50/10' : isSkipped ? 'border-amber-200 bg-amber-50/10' : 'border-rose-200 bg-rose-50/10'}`}>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      Soal No. {idx + 1} ({q.subject})
                    </span>
                    <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${isCorrect ? 'bg-emerald-100 text-emerald-700' : isSkipped ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                      {isCorrect ? 'Jawaban Benar' : isSkipped ? 'Tidak Dijawab' : 'Jawaban Salah'}
                    </span>
                  </div>

                  {q.imageUrl && (
                    <div className="my-4 flex justify-center">
                      <img src={q.imageUrl} alt="Ilustrasi" className="max-w-full max-h-[260px] object-contain rounded-xl border border-slate-200" />
                    </div>
                  )}

                  {q.passage && (
                    <div className="mb-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 text-xs leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                      {q.passage}
                    </div>
                  )}

                  <div className="text-sm font-bold text-slate-900 dark:text-white mb-4 whitespace-pre-line">
                    {q.text}
                  </div>

                  <div className="space-y-2 mb-4">
                    {q.options.map((opt, optIdx) => {
                      const isOptionCorrect = opt.id === q.correctAnswerId;
                      const isOptionUser = opt.id === userAns;
                      const letter = String.fromCharCode(65 + optIdx);

                      return (
                        <div
                          key={opt.id}
                          className={`p-3 rounded-xl text-xs font-medium border flex items-center justify-between ${
                            isOptionCorrect
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 font-bold'
                              : isOptionUser
                              ? 'border-rose-400 bg-rose-50 text-rose-900 dark:bg-rose-950/40'
                              : 'border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span><strong>{letter}.</strong> {opt.text}</span>
                          {isOptionCorrect && <span className="text-[10px] uppercase font-black text-emerald-600 pl-2 shrink-0">Kunci Jawaban</span>}
                          {isOptionUser && !isOptionCorrect && <span className="text-[10px] uppercase font-black text-rose-600 pl-2 shrink-0">Pilihan Kamu</span>}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-950 dark:text-indigo-200 whitespace-pre-line leading-relaxed">
                      <strong>Pembahasan Resmi:</strong> {q.explanation}
                    </div>
                  )}

                  {/* AI Tutor Deep Dive */}
                  <div className="mt-3">
                    {aiExplanations[q.id] ? (
                      <div className="p-4 rounded-xl bg-fuchsia-50/70 dark:bg-fuchsia-950/25 border border-fuchsia-200 dark:border-fuchsia-900/40 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                        <div className="font-black text-fuchsia-700 dark:text-fuchsia-300 flex items-center gap-1.5 mb-1">
                          <Brain size={14} /> Analisis Mendalam FAZET AI Tutor:
                        </div>
                        {aiExplanations[q.id]}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void handleAskAiTutor(q, userAns)}
                        disabled={aiLoadingId === q.id}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-fuchsia-600 dark:text-fuchsia-400 hover:underline pt-1"
                      >
                        {aiLoadingId === q.id ? (
                          <>
                            <Loader2 size={13} className="animate-spin" /> AI Tutor sedang menganalisis soal ini...
                          </>
                        ) : (
                          <>
                            <Sparkles size={13} /> Bedah Lebih Dalam dengan FAZET AI Tutor
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // QUIZ SCREEN (PRO CBT INTERFACE)
  if (quizStarted) {
    const isAnswered = !!answers[currentQ.id];
    const isFlagged = !!doubtful[currentQ.id];
    const isWarningTimer = timeLeft < 300;
    const answeredCount = Object.keys(answers).length;
    const progressPct = Math.round((answeredCount / activeQuestions.length) * 100);

    return (
      <div className="max-w-5xl mx-auto pb-24">
        {/* Header CBT */}
        <header className="mb-6 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 p-2.5 rounded-xl">
                <Target size={22} />
              </div>
              <div>
                <h1 className="font-extrabold text-slate-800 dark:text-white text-base">
                  CBT Pusmendik & SNBT 2026
                </h1>
                <p className="text-xs text-slate-500 font-medium">Subtes: {currentQ.subject}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Soal {currentQuestionIndex + 1} / {activeQuestions.length} ({answeredCount} Terjawab)
                </div>
                <div className={`text-sm font-mono font-black flex items-center gap-1 justify-end ${isWarningTimer ? 'text-rose-600 animate-pulse' : 'text-slate-600 dark:text-slate-300'}`}>
                  <Clock size={13} /> Sisa: {formatTimer(timeLeft)}
                </div>
              </div>

              <button
                onClick={() => setShowConfirmModal(true)}
                className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-colors"
              >
                Akhiri Ujian
              </button>
            </div>
          </div>

          {/* Real-time Progress Bar + Keyboard Shortcut Hint */}
          <div className="space-y-1.5 pt-1">
            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="hidden sm:flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Keyboard size={12} /> Pintasan Keyboard: Tekan <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-600 dark:text-slate-300">A</kbd>-<kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-600 dark:text-slate-300">E</kbd> pilih jawaban, <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-600 dark:text-slate-300">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-600 dark:text-slate-300">→</kbd> pindah soal, <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-600 dark:text-slate-300">R</kbd> ragu-ragu
              </span>
              <span className="font-mono font-bold">{progressPct}% Selesai</span>
            </div>
          </div>
        </header>

        {/* Modal Konfirmasi Selesai */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
              <AlertCircle size={40} className="mx-auto text-amber-500" />
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Yakin ingin mengakhiri ujian?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Kamu telah menjawab <strong>{Object.keys(answers).length}</strong> dari <strong>{activeQuestions.length}</strong> soal.
                {Object.keys(doubtful).filter(k => doubtful[k]).length > 0 && ` Masih ada ${Object.keys(doubtful).filter(k => doubtful[k]).length} soal yang bertanda ragu-ragu.`}
              </p>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" fullWidth onClick={() => setShowConfirmModal(false)}>
                  Lanjut Mengerjakan
                </Button>
                <Button size="sm" fullWidth className="bg-rose-500 hover:bg-rose-600 text-white" onClick={() => void handleFinishExam()}>
                  Ya, Kumpulkan
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question Card */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="p-6 md:p-8 border-slate-200 dark:border-slate-800 shadow-sm text-slate-800 dark:text-slate-100">
              {currentQ.imageUrl && (
                <div className="mb-6 flex justify-center">
                  <img src={currentQ.imageUrl} alt="Ilustrasi Soal" className="max-w-full max-h-[300px] object-contain rounded-xl border border-slate-100 shadow-sm" />
                </div>
              )}
              {currentQ.passage && (
                <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Bacaan Soal</div>
                  <div className="prose prose-slate dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed max-h-64 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
                    {currentQ.passage}
                  </div>
                </div>
              )}

              <div className="text-base font-semibold mb-6 leading-relaxed whitespace-pre-line">
                {currentQuestionIndex + 1}. {currentQ.text}
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt, i) => {
                  const isSelected = answers[currentQ.id] === opt.id;
                  const letter = String.fromCharCode(65 + i);
                  return (
                    <label
                      key={opt.id}
                      className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 font-semibold'
                          : 'border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 bg-slate-50/30 dark:bg-slate-900/40'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name={`q-${currentQ.id}`} 
                        value={opt.id}
                        checked={isSelected}
                        onChange={() => setAnswers(prev => ({ ...prev, [currentQ.id]: opt.id }))}
                        className="mt-0.5 w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1 text-sm leading-relaxed">
                        <span className="font-bold mr-2 text-slate-500">{letter}.</span>
                        <span>{opt.text}</span>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Ragu-ragu Checkbox */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-amber-600 dark:text-amber-400">
                  <input
                    type="checkbox"
                    checked={isFlagged}
                    onChange={toggleDoubtful}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  Tandai Ragu-ragu (Pintasan: R)
                </label>

                {isAnswered && (
                  <button
                    onClick={() => {
                      const nextAnswers = { ...answers };
                      delete nextAnswers[currentQ.id];
                      setAnswers(nextAnswers);
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
                  >
                    <RotateCcw size={12} /> Hapus Jawaban
                  </button>
                )}
              </div>
            </Card>

            {/* Bottom Navigation */}
            <div className="flex justify-between items-center">
              <button 
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-2.5 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 disabled:opacity-50"
              >
                ← Sebelumnya
              </button>

              <button 
                onClick={() => {
                  if (currentQuestionIndex === activeQuestions.length - 1) {
                    setShowConfirmModal(true);
                  } else {
                    setCurrentQuestionIndex(prev => Math.min(activeQuestions.length - 1, prev + 1));
                  }
                }}
                className="px-7 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20"
              >
                {currentQuestionIndex === activeQuestions.length - 1 ? 'Selesai & Kumpulkan' : 'Selanjutnya →'}
              </button>
            </div>
          </div>

          {/* Grid Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-5 sticky top-24 border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-xs uppercase tracking-wider mb-3 text-slate-500">
                Navigasi Soal CBT
              </h3>
              <div className="grid grid-cols-5 gap-2 max-h-[340px] overflow-y-auto pr-1">
                {activeQuestions.map((q, idx) => {
                  const answered = !!answers[q.id];
                  const flagged = !!doubtful[q.id];
                  const isActive = idx === currentQuestionIndex;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-9 rounded-lg text-xs font-bold border transition-all ${
                        isActive 
                          ? 'border-blue-600 bg-blue-600 text-white shadow-xs' 
                          : flagged
                            ? 'border-amber-400 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200'
                            : answered 
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' 
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:border-blue-300'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-[11px] text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-600" /> Sedang Dikerjakan
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-400" /> Sudah Dijawab
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-amber-200 border border-amber-400" /> Ragu-ragu
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-white border border-slate-300" /> Belum Dijawab
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT VIEW (Materi, TryOut, & Jadwal/Notifikasi Tabs)
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="warning" className="inline-flex shadow-sm">
              FAZET ACADEMY PRO
            </Badge>
            {syncStatus && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 size={12} /> Alarm TKA Terhubung
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3 text-slate-900 dark:text-white">
            <Target className="text-rose-500" size={32} />
            Preparation Center TKA & SNBT
          </h1>
          <p className="mt-1 text-slate-500 font-medium text-sm">
            Pusat komando pembelajaran intensif, silabus modul, jadwal TKA 2026, dan simulasi CBT berbasis IRT.
          </p>
        </div>

        <Button
          onClick={() => void handleSyncAllAlarms()}
          disabled={syncing}
          icon={syncing ? <RefreshCw size={15} className="animate-spin" /> : <BellRing size={15} />}
          className="bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white rounded-2xl shadow-md shrink-0"
        >
          {syncStatus ? 'Sinkronkan Ulang ke Notif' : 'Sinkronkan Jadwal ke Notif'}
        </Button>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl w-full sm:w-fit mb-6 text-xs font-bold gap-1">
        <button 
          onClick={() => setActiveTab('materi')} 
          className={`flex-1 sm:px-6 py-2.5 rounded-lg transition-all ${activeTab === 'materi' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Materi & Silabus Subtes
        </button>
        <button 
          onClick={() => setActiveTab('tryout')} 
          className={`flex-1 sm:px-6 py-2.5 rounded-lg transition-all ${activeTab === 'tryout' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Simulasi TryOut Real CBT ({tkaQuestions.length} Soal)
        </button>
        <button 
          onClick={() => setActiveTab('jadwal')} 
          className={`flex-1 sm:px-6 py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'jadwal' ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <BellRing size={13} /> Jadwal & Alarm Notifikasi
        </button>
      </div>

      {/* TAB MATERI & SILABUS */}
      {activeTab === 'materi' && (
        <div className="space-y-6 fade-up">
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <Card className="p-5 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30">
              <div className="text-emerald-600 mb-2"><BookMarked size={22} /></div>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{tkaQuestions.length} Soal</div>
              <div className="text-xs font-bold text-emerald-600/80">Bank Soal HOTS + Pembahasan Lengkap</div>
            </Card>
            <Card className="p-5 bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30">
              <div className="text-blue-600 mb-2"><CheckCircle2 size={22} /></div>
              <div className="text-2xl font-black text-blue-700 dark:text-blue-400">74%</div>
              <div className="text-xs font-bold text-blue-600/80">Rata-rata Penguasaan Materi</div>
            </Card>
            <Card className="p-5 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30">
              <div className="text-amber-600 mb-2"><Play size={22} /></div>
              <div className="text-2xl font-black text-amber-700 dark:text-amber-400">5 Subtes</div>
              <div className="text-xs font-bold text-amber-600/80">Standar Pusmendik Kemendikdasmen</div>
            </Card>
          </div>

          <h3 className="text-lg font-bold">Silabus Subtes & Kisi-Kisi TKA / UTBK</h3>
          <div className="grid gap-3">
            {SUBTESTS.map((sub) => (
              <Card 
                key={sub.id} 
                onClick={() => setSelectedSubtest(sub)}
                className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{sub.name}</h4>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">
                      Klik untuk Detail & Latihan
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mb-3">{sub.completed} dari {sub.total} sub-materi dikuasai</div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        sub.progress >= 80 ? 'bg-emerald-500' : sub.progress >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`} 
                      style={{ width: `${sub.progress}%` }} 
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-lg font-black">{sub.progress}%</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Penguasaan</div>
                  </div>
                  <div className="h-9 w-9 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Subtest Detail Drawer/Modal */}
          {selectedSubtest && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <Target size={20} className="text-rose-500" /> {selectedSubtest.name}
                  </h3>
                  <button onClick={() => setSelectedSubtest(null)} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                    <X size={18} />
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedSubtest.description}
                </p>

                <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider mb-2">
                    Topik Materi Pokok:
                  </h4>
                  <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                    {selectedSubtest.keyTopics.map(t => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-xs text-amber-950 dark:text-amber-200">
                  <strong>Tips & Trik Pengerjaan:</strong> {selectedSubtest.tips}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedSubtest(null)}>
                    Tutup
                  </Button>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      const filterName = selectedSubtest.subjectFilter;
                      setSelectedSubtest(null);
                      handleStartExam(filterName);
                    }}
                  >
                    Latihan Subtes Ini Sekarang 
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB TRYOUT SIMULASI */}
      {activeTab === 'tryout' && (
        <div className="space-y-6 fade-up">
          <Card className="p-8 text-center border-2 border-dashed border-blue-200 dark:border-blue-900/40 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-slate-900 dark:to-blue-950/20 shadow-sm">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Lock size={30} />
            </div>
            <h3 className="text-2xl font-black mb-2 text-slate-900 dark:text-white">
              Simulasi Akbar Nasional UTBK SNBT & TKA 2026
            </h3>
            <p className="text-slate-500 text-xs max-w-md mx-auto mb-6 leading-relaxed">
              Paket simulasi komprehensif ({tkaQuestions.length} Soal HOTS) mencakup Bahasa Inggris, Penalaran Umum, Pengetahuan Kuantitatif, Literasi Bahasa Indonesia, dan Penalaran Matematika. Dilengkapi pintasan keyboard (A-E), analisis diagnostik per subtes, AI Tutor, serta pengiriman skor ke Pusat Notifikasi!
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                onClick={() => handleStartExam('Semua')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-600/25 transition-all hover:scale-102"
              >
                Mulai TryOut Lengkap Sekarang ({tkaQuestions.length} Soal • 45 Menit) 
              </Button>
            </div>
          </Card>

          {/* Subtest Quick Quizzes */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Filter size={14} /> Latihan Fokus per Subtes:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {subtestCounts.map(sub => (
                <button
                  key={sub.name}
                  onClick={() => handleStartExam(sub.name)}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-blue-400 text-left transition-all group"
                >
                  <div className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">
                    {sub.name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono font-semibold">
                    {sub.count} Soal • 15 Menit
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* History */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
              <span>Riwayat Ujian & Evaluasi</span>
              {history.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Hapus seluruh riwayat ujian?')) {
                      setHistory([]);
                      localStorage.removeItem(STORAGE_HISTORY);
                    }
                  }}
                  className="text-[11px] text-rose-500 hover:underline font-semibold"
                >
                  Bersihkan Riwayat
                </button>
              )}
            </h3>

            <div className="space-y-2.5">
              {history.length === 0 ? (
                <div className="p-8 text-center text-slate-400 border rounded-2xl">
                  Belum ada riwayat tryout. Mulai ujian pertamamu sekarang!
                </div>
              ) : (
                history.map((h, i) => (
                  <Card key={h.id || i} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 rounded-xl flex items-center justify-center font-black text-sm">
                        #{history.length - i}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">{h.name}</h4>
                        <div className="text-[10px] text-slate-400">
                          {h.date} • {h.correct}/{h.total} Benar • {h.durationMinutes} menit
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-blue-600 dark:text-blue-400">{h.score}</div>
                      <div className="text-[9px] uppercase font-bold text-slate-400">Skor Akhir</div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB JADWAL & ALARM NOTIFIKASI TKA 2026 */}
      {activeTab === 'jadwal' && (
        <div className="space-y-6 fade-up">
          <Card className="p-5 sm:p-6 border border-rose-200 dark:border-rose-900/40 bg-gradient-to-br from-rose-50/50 via-white to-indigo-50/40 dark:from-slate-900 dark:to-rose-950/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <CalendarDays size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Sinkronisasi Alarm Jadwal TKA SMA 2026
                  </h3>
                  <p className="text-xs text-slate-500">
                    Gelombang 1 • Sesi 1 (WIB) • Senin 26 Okt s.d. Kamis 29 Okt 2026
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => void handleSyncAllAlarms()}
                disabled={syncing}
                icon={<BellRing size={14} />}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
              >
                Aktifkan Semua Alarm (4 Hari)
              </Button>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
              <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>5 Titik Alarm Otomatis per Hari Ujian:</strong> Sistem akan membunyikan pengingat pada{' '}
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">H-1 (19:00 WIB)</span>,{' '}
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">Pagi Hari-H (05:30 WIB)</span>,{' '}
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">H-30 Menit (06:30 WIB)</span>,{' '}
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">H-10 Menit (06:50 WIB)</span>, dan{' '}
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">Kickoff Ujian (07:00 WIB)</span>.
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {EXAM_DAYS_2026.map((day) => (
                <Card key={day.hariKe} className="p-4 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      Hari Ke-{day.hariKe} • {day.tanggalFormatted}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                      <Clock size={12} className="text-rose-500" />
                      {day.mulaiWib} - {day.perkiraanSelesaiWib} WIB
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">{day.shortTitle}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{day.rincian}</p>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {day.steps.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
                        <span>• {s.name}</span>
                        <span className="font-mono font-bold">{s.dur}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400">
                      <Timer size={12} /> Total {day.totalMenit} Menit
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleSyncDay(day.hariKe, day.shortTitle)}
                      disabled={syncingDay === day.hariKe}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                    >
                      <BellRing size={12} className={syncingDay === day.hariKe ? 'animate-spin' : ''} />
                      <span>Tes & Aktifkan Alarm Hari {day.hariKe}</span>
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">
              Timeline Lengkap Tahapan TKA Nasional 2026
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {TKA_STAGES_2026.map((stg) => (
                <div
                  key={stg.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                    stg.status === 'crucial'
                      ? 'border-rose-500/40 bg-rose-500/5 font-bold'
                      : stg.status === 'completed'
                      ? 'border-emerald-500/20 bg-emerald-500/5 opacity-80'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{stg.nama}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{stg.rentangFormatted}</div>
                  </div>
                  <Badge
                    variant={stg.status === 'crucial' ? 'danger' : stg.status === 'completed' ? 'success' : 'neutral'}
                    size="sm"
                  >
                    {stg.status === 'crucial' ? 'Utama' : stg.status === 'completed' ? 'Selesai' : 'Mendatang'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
