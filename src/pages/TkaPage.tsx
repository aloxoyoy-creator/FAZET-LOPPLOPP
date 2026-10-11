import { useState, useEffect, useMemo } from 'react';
import { 
  Target, FileText, CheckCircle2, ChevronRight, Lock, Play, 
  BarChart3, Info, Clock, AlertCircle, BookmarkCheck, RotateCcw, 
  Eye, HelpCircle, X, Award, Sparkles, Filter 
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { tkaQuestions, type Question } from '../data/tkaQuestions';
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
    progress: 75, total: 30, completed: 22,
    description: 'Mengukur kemampuan berpikir logis, induktif, deduktif, serta penalaran analitik dan kuantitatif.',
    keyTopics: ['Silogisme & Modus Ponens/Tollens', 'Pola Barisan & Deret Bilangan', 'Analogi Hubungan Kata', 'Penarikan Simpulan Paragraf'],
    tips: 'Perhatikan kata kunci absolut seperti "semua", "sebagian", atau "tidak satupun". Jangan gunakan asumsi di luar teks.'
  },
  { 
    id: 'pk', 
    name: 'Pengetahuan Kuantitatif (PK)', 
    subjectFilter: 'Pengetahuan Kuantitatif (PK)',
    progress: 45, total: 40, completed: 18,
    description: 'Mengukur penguasaan dasar matematika, aljabar, kalkulus sederhana, dan geometri.',
    keyTopics: ['Persamaan Aljabar & Pemfaktoran', 'Geometri Segitiga & Lingkaran', 'Statistika & Peluang', 'Fungsi & Grafiknya'],
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
    progress: 80, total: 30, completed: 24,
    description: 'Mengukur kemampuan menyerap esensi teks ilmiah, opini, dan kalimat efektif bahasa Indonesia.',
    keyTopics: ['Ide Pokok & Kalimat Utama', 'Konjungsi & Kohesi Paragraf', 'Simpulan Teks Ilmiah', 'Kalimat Efektif & PUEBI'],
    tips: 'Ide pokok biasanya terletak pada kalimat pertama (deduktif) atau kalimat akhir (induktif).'
  },
  { 
    id: 'pm', 
    name: 'Penalaran Matematika (PM)', 
    subjectFilter: 'Penalaran Matematika',
    progress: 55, total: 20, completed: 11,
    description: 'Menguji kemampuan menggunakan konsep matematika dalam memecahkan masalah kontekstual kehidupan nyata.',
    keyTopics: ['Aritmetika Sosial & Diskon Bertingkat', 'Perbandingan Senilai & Berbalik Nilai', 'Peluang Kejadian Majemuk', 'Optimasi Sederhana'],
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
  const [activeTab, setActiveTab] = useState<'materi' | 'tryout'>('materi');
  const [selectedSubtest, setSelectedSubtest] = useState<SubtestInfo | null>(null);
  
  // Quiz State
  const [quizStarted, setQuizStarted] = useState(false);
  const [activeFilterSubject, setActiveFilterSubject] = useState<string>('Semua');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [doubtful, setDoubtful] = useState<Record<string, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

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
      { id: 'h_1', name: 'Simulasi Mandiri #1 (Bahasa Inggris)', date: '2024-10-20', score: 720, correct: 18, total: 25, durationMinutes: 28 },
      { id: 'h_2', name: 'Tryout Akbar Nasional #3', date: '2024-10-25', score: 680, correct: 17, total: 25, durationMinutes: 30 },
    ];
  });

  const activeQuestions: Question[] = useMemo(() => {
    if (activeFilterSubject === 'Semua') return tkaQuestions;
    return tkaQuestions.filter(q => q.subject.toLowerCase().includes(activeFilterSubject.toLowerCase()));
  }, [activeFilterSubject]);

  const currentQ = activeQuestions[currentQuestionIndex] || activeQuestions[0];

  // Active Timer Effect
  useEffect(() => {
    if (!quizStarted || isFinished) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quizStarted, isFinished]);

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
    setTimeLeft(subjectFilter === 'Semua' ? 1800 : 900); // 30m atau 15m
    setQuizStarted(true);
  };

  const handleFinishExam = () => {
    let correctCount = 0;
    activeQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswerId) correctCount += 1;
    });

    const finalScore = Math.round((correctCount / activeQuestions.length) * 1000);
    const timeSpentMinutes = Math.max(1, Math.round(((activeFilterSubject === 'Semua' ? 1800 : 900) - timeLeft) / 60));

    const newHistory: TryoutHistory = {
      id: `to_${Date.now()}`,
      name: activeFilterSubject === 'Semua' ? `TryOut Simulasi Lengkap (${activeQuestions.length} Soal)` : `Latihan Subtes ${activeFilterSubject}`,
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
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    } catch {}

    setIsFinished(true);
    setShowConfirmModal(false);
  };

  const toggleDoubtful = () => {
    if (!currentQ) return;
    setDoubtful(prev => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };

  // HASIL UJIAN
  if (isFinished) {
    let correctCount = 0;
    let wrongCount = 0;
    let emptyCount = 0;

    activeQuestions.forEach(q => {
      const ans = answers[q.id];
      if (!ans) {
        emptyCount += 1;
      } else if (ans === q.correctAnswerId) {
        correctCount += 1;
      } else {
        wrongCount += 1;
      }
    });

    const finalScore = Math.round((correctCount / activeQuestions.length) * 1000);
    const accuracy = Math.round((correctCount / activeQuestions.length) * 100);

    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-24 text-center mt-6">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Award size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Simulasi Ujian Selesai!</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Hasil evaluasi belajar kamu sudah dianalisis sesuai standar pembobotan IRT SNBT 2026.
        </p>

        {/* Skor Box */}
        <div className="grid sm:grid-cols-4 gap-3 max-w-2xl mx-auto my-6 text-center">
          <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 border-blue-200">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Skor IRT</div>
            <div className="text-4xl font-black text-blue-600 dark:text-blue-400 mt-1">{finalScore}</div>
            <div className="text-[10px] text-blue-500 font-bold mt-1">Skala 1000</div>
          </Card>
          <Card className="p-5 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jawaban Benar</div>
            <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{correctCount}</div>
            <div className="text-[10px] text-emerald-500 font-bold mt-1">Soal</div>
          </Card>
          <Card className="p-5 bg-rose-50 dark:bg-rose-950/30 border-rose-200">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jawaban Salah</div>
            <div className="text-4xl font-black text-rose-600 dark:text-rose-400 mt-1">{wrongCount}</div>
            <div className="text-[10px] text-rose-500 font-bold mt-1">Soal</div>
          </Card>
          <Card className="p-5 bg-slate-50 dark:bg-slate-900 border-slate-200">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Akurasi</div>
            <div className="text-4xl font-black text-slate-800 dark:text-slate-200 mt-1">{accuracy}%</div>
            <div className="text-[10px] text-slate-500 font-bold mt-1">{emptyCount} Kosong</div>
          </Card>
        </div>

        {/* Buttons Action */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={() => setReviewMode(!reviewMode)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 text-sm px-6"
            icon={<Eye size={16} />}
          >
            {reviewMode ? 'Sembunyikan Pembahasan' : 'Lihat Pembahasan Lengkap Semua Soal 📖'}
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
              <BookMarked size={20} className="text-indigo-600" /> Kunci Jawaban & Pembahasan Detail
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
                      {isCorrect ? '✓ Jawabanmu Benar' : isSkipped ? '⚪ Tidak Dijawab' : '✗ Jawabanmu Salah'}
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

                  <div className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                    {q.text}
                  </div>

                  <div className="space-y-2 mb-4">
                    {q.options.map(opt => {
                      const isOptionCorrect = opt.id === q.correctAnswerId;
                      const isOptionUser = opt.id === userAns;

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
                          <span>{opt.text}</span>
                          {isOptionCorrect && <span className="text-[10px] uppercase font-black text-emerald-600 pl-2">Kunci Jawaban</span>}
                          {isOptionUser && !isOptionCorrect && <span className="text-[10px] uppercase font-black text-rose-600 pl-2">Pilihan Kamu</span>}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-950 dark:text-indigo-200">
                      <strong>💡 Pembahasan:</strong> {q.explanation}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // QUIZ SCREEN
  if (quizStarted) {
    const isAnswered = !!answers[currentQ.id];
    const isFlagged = !!doubtful[currentQ.id];
    const isWarningTimer = timeLeft < 300;

    return (
      <div className="max-w-5xl mx-auto pb-24">
        {/* Header CBT */}
        <header className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 p-2.5 rounded-xl">
              <Target size={22} />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-800 dark:text-white text-base">
                CBT Pusmendik & SNBT
              </h1>
              <p className="text-xs text-slate-500 font-medium">Subtes: {currentQ.subject}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Soal {currentQuestionIndex + 1} / {activeQuestions.length}
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
                <Button size="sm" fullWidth className="bg-rose-500 hover:bg-rose-600 text-white" onClick={handleFinishExam}>
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

              <div className="text-base font-semibold mb-6 leading-relaxed">
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
                  Tandai Ragu-ragu
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
                Sebelumnya
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
                {currentQuestionIndex === activeQuestions.length - 1 ? 'Selesai & Kumpulkan' : 'Selanjutnya'}
              </button>
            </div>
          </div>

          {/* Grid Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-5 sticky top-24 border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-xs uppercase tracking-wider mb-3 text-slate-500">
                Navigasi Soal CBT
              </h3>
              <div className="grid grid-cols-5 gap-2">
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

  // DEFAULT VIEW (Materi & TryOut Tabs)
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      <header className="mb-6">
        <Badge variant="warning" className="mb-2 inline-flex shadow-sm">
          FAZET ACADEMY PRO
        </Badge>
        <h1 className="text-3xl font-extrabold flex items-center gap-3 text-slate-900 dark:text-white">
          <Target className="text-rose-500" size={32} />
          Preparation Center TKA & SNBT
        </h1>
        <p className="mt-1 text-slate-500 font-medium text-sm">
          Pusat komando pembelajaran intensif, silabus modul, dan simulasi CBT UTBK berbasis IRT 2026.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl w-full sm:w-fit mb-6 text-xs font-bold">
        <button 
          onClick={() => setActiveTab('materi')} 
          className={`flex-1 sm:px-8 py-2.5 rounded-lg transition-all ${activeTab === 'materi' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Materi & Silabus Subtes
        </button>
        <button 
          onClick={() => setActiveTab('tryout')} 
          className={`flex-1 sm:px-8 py-2.5 rounded-lg transition-all ${activeTab === 'tryout' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Simulasi TryOut Real CBT
        </button>
      </div>

      {/* TAB MATERI & SILABUS */}
      {activeTab === 'materi' && (
        <div className="space-y-6 fade-up">
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <Card className="p-5 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30">
              <div className="text-emerald-600 mb-2"><BookMarked size={22} /></div>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">112</div>
              <div className="text-xs font-bold text-emerald-600/80">Modul & Bank Soal Aktif</div>
            </Card>
            <Card className="p-5 bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30">
              <div className="text-blue-600 mb-2"><CheckCircle2 size={22} /></div>
              <div className="text-2xl font-black text-blue-700 dark:text-blue-400">68%</div>
              <div className="text-xs font-bold text-blue-600/80">Rata-rata Penguasaan Materi</div>
            </Card>
            <Card className="p-5 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30">
              <div className="text-amber-600 mb-2"><Play size={22} /></div>
              <div className="text-2xl font-black text-amber-700 dark:text-amber-400">5 Subtes</div>
              <div className="text-xs font-bold text-amber-600/80">Standar Pusmendik SNBT</div>
            </Card>
          </div>

          <h3 className="text-lg font-bold">Silabus Subtes & Kisi-Kisi UTBK</h3>
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
                      Klik untuk Detail & Tips
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
                  <strong>💡 Tips & Trik Pengerjaan:</strong> {selectedSubtest.tips}
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
                    Latihan Subtes Ini Sekarang 🚀
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
              Simulasi Akbar Nasional UTBK SNBT 2026
            </h3>
            <p className="text-slate-500 text-xs max-w-md mx-auto mb-6 leading-relaxed">
              Paket simulasi komprehensif mencakup Bahasa Inggris, Penalaran Umum, Pengetahuan Kuantitatif, Literasi Indonesia, dan Penalaran Matematika. Dilengkapi timer otomatis, fitur ragu-ragu, dan pembahasan lengkap!
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                onClick={() => handleStartExam('Semua')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-600/25 transition-all hover:scale-102"
              >
                Mulai TryOut Lengkap Sekarang (30 Menit) 🚀
              </Button>
            </div>
          </Card>

          {/* Subtest Quick Quizzes */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Filter size={14} /> Latihan Cepat per Subtes:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { name: 'Bahasa Inggris', count: 25 },
                { name: 'Penalaran Umum (PU)', count: 3 },
                { name: 'Pengetahuan Kuantitatif (PK)', count: 2 },
                { name: 'Literasi Indonesia', count: 1 },
              ].map(sub => (
                <button
                  key={sub.name}
                  onClick={() => handleStartExam(sub.name)}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-blue-400 text-left transition-all group"
                >
                  <div className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">
                    {sub.name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
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
    </div>
  );
}
