import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Target, CheckCircle2, ChevronRight, Play,
  Clock, AlertCircle, RotateCcw,
  Eye, X, Award, Filter, BookMarked, BellRing, RefreshCw, CalendarDays, Timer, Info,
  Sparkles, BarChart3, Keyboard, Brain, Loader2, ZoomIn, Type, FileText, Image as ImageIcon,
  ShieldCheck, Lock, Maximize2, Minimize2, Pin, PinOff, ShieldAlert, Columns2
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import {
  tkaQuestions,
  TKA_SUBTEST_CONFIGS,
  type Question,
  type SubjectType
} from '../data/tkaQuestions';
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
  subjectFilter: SubjectType;
  durationMinutes: number;
  category: 'Wajib' | 'Pilihan';
  progress: number;
  total: number;
  completed: number;
  description: string;
  keyTopics: string[];
  tips: string;
}

const SUBTESTS: SubtestInfo[] = [
  {
    id: 'lit_id',
    name: 'Bahasa Indonesia Wajib (Literasi Membaca)',
    subjectFilter: 'Bahasa Indonesia',
    durationMinutes: 75,
    category: 'Wajib',
    progress: 86,
    total: 30,
    completed: 26,
    description: 'Mengukur kemampuan memahami, menginterpretasi, dan mengevaluasi teks informasi maupun sastra serta kaidah EYD Edisi V sesuai standar Pusmendik Kemendikdasmen.',
    keyTopics: [
      'Wacana Sosial Budaya (Tradisi Buwuhan, Tari Hudoq, Tradisi Belis)',
      'Apresiasi Sastra & Konflik Batin (Layur Teruslah Berlayar, Roh Meratus)',
      'Sains, Ekologi & Ekonomi Global (Riset LIPI/KLHK, Prospek IMF)',
      'Ketepatan Ejaan, Tanda Baca & Kalimat Efektif (EYD Edisi V)'
    ],
    tips: 'Pada sistem CBT ini, wacana lengkap dan gambar selalu disematkan di panel kiri pada setiap nomor soal—kamu tidak perlu bolak-balik ke nomor sebelumnya.'
  },
  {
    id: 'pm',
    name: 'Matematika Wajib (Penalaran Numerasi)',
    subjectFilter: 'Penalaran Matematika',
    durationMinutes: 75,
    category: 'Wajib',
    progress: 78,
    total: 25,
    completed: 20,
    description: 'Menguji kemampuan pemodelan matematika kontekstual, fungsi komposisi, SPLTV, barisan aritmetika/geometri, dimensi tiga, dan peluang bersyarat.',
    keyTopics: [
      'Fungsi Komposisi Diskon Kursus & Tabel Rapor Siswa',
      'SPLTV Kontekstual (Buket Bunga) & Pertidaksamaan Linear Grafik',
      'Geometri Ruang (Kubus Kamar Tidur & Selimut Kap Lampu Tabung)',
      'Permutasi Stan Bazar Sekolah & Peluang Bersyarat Kotak Undian'
    ],
    tips: 'Perhatikan detail angka pada tabel dan gambar ilustrasi Pusmendik. Gunakan fitur Sematkan Layar / Split-Pin agar gambar tetap diam saat kamu menggeser pilihan jawaban.'
  },
  {
    id: 'lit_en',
    name: 'Bahasa Inggris Wajib & Tingkat Lanjut',
    subjectFilter: 'Bahasa Inggris',
    durationMinutes: 75,
    category: 'Wajib',
    progress: 88,
    total: 25,
    completed: 22,
    description: 'Mengukur kompetensi membaca komprehensif teks naratif, eksposisi ilmiah, argumentatif finansial, serta analisis infografik berstandar CEFR B1–B2.',
    keyTopics: [
      'Narrative & Fable Analysis (The Lion and the Mouse, The False Lion King)',
      'Visual Infographic Interpretation (Effective Study Techniques)',
      'Ecological Expository Reading (The Great Barrier Reef & Bleaching)',
      'Argumentative Financial Literacy (Why Teenagers Should Manage Money)'
    ],
    tips: 'Seluruh teks bacaan (passage) dan multi-panel infografik tersemat penuh di setiap nomor soal agar kamu dapat langsung memverifikasi bukti kalimat.'
  },
  {
    id: 'pk',
    name: 'Matematika Tingkat Lanjut (Mapel Pilihan)',
    subjectFilter: 'Pengetahuan Kuantitatif',
    durationMinutes: 60,
    category: 'Pilihan',
    progress: 72,
    total: 20,
    completed: 14,
    description: 'Mengukur penguasaan matematika tingkat lanjut meliputi matriks terapan, pemodelan fungsi eksponensial, persamaan lingkaran, geometri tembereng, dan kalkulus.',
    keyTopics: [
      'Pemodelan Matriks Pakan Ternak & Kapasitas Kamar Hotel',
      'Grafik Eksponensial Pertumbuhan Eceng Gondok & Kinematika Kereta',
      'Persamaan Lingkaran Cartesius & Geometri Ornamen Kaca Patri',
      'Limit Aljabar, Garis Singgung Turunan, Integral Luas & Polinomial'
    ],
    tips: 'Gunakan sifat determinan matriks det(A·B) = det(A)·det(B) dan rumus cepat luas persegi di dalam lingkaran L = 2r² untuk menghemat waktu.'
  },
  {
    id: 'pu',
    name: 'Penalaran Umum & Analitik (PU)',
    subjectFilter: 'Penalaran Umum',
    durationMinutes: 60,
    category: 'Pilihan',
    progress: 80,
    total: 15,
    completed: 12,
    description: 'Mengukur kemampuan berpikir logis formal (silogisme, kontraposisi, kuantor), evaluasi argumen kritis, serta penalaran analitik penjadwalan dan posisi.',
    keyTopics: [
      'Silogisme Hipotetis, Modus Tollens & Kontraposisi De Morgan',
      'Penalaran Analitik Penjadwalan & Tempat Duduk Meja Bundar',
      'Evaluasi Argumen Kritis (Memperlemah / Memperkuat Klaim)',
      'Pola Barisan Bilangan & Efisiensi Energi Kuantitatif'
    ],
    tips: 'Ingat bahwa kontraposisi dari P -> (Q ∧ R) adalah (~Q ∨ ~R) -> ~P. Jangan terjebak memilih konvers atau invers.'
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

interface SavedCbtSession {
  activeFilterSubject: SubjectType | 'Semua';
  currentQuestionIndex: number;
  answers: Record<string, number>;
  doubtful: Record<string, boolean>;
  timeLeft: number;
  initialDuration: number;
  violationCount?: number;
  updatedAt: number;
}

const STORAGE_HISTORY = 'fazet_tka_history_v2';
const STORAGE_ACTIVE_CBT = 'fazet_tka_active_cbt_session_v2';

export default function TkaPage() {
  const { user } = useAuth();
  const { workspaceId } = useWorkspace();
  const { push } = useToast();

  const cbtContainerRef = useRef<HTMLDivElement | null>(null);

  const [activeTab, setActiveTab] = useState<'tryout' | 'materi' | 'jadwal'>('tryout');
  const [selectedSubtest, setSelectedSubtest] = useState<SubtestInfo | null>(null);
  const [syncStatus, setSyncStatus] = useState<TkaSyncStatus | null>(() => getSavedTkaSyncStatus());
  const [syncing, setSyncing] = useState(false);
  const [syncingDay, setSyncingDay] = useState<number | null>(null);

  // CBT Exam State
  const [quizStarted, setQuizStarted] = useState(false);
  const [activeFilterSubject, setActiveFilterSubject] = useState<SubjectType | 'Semua'>('Semua');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [doubtful, setDoubtful] = useState<Record<string, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  // Real Pusmendik Timer State (in seconds)
  const [timeLeft, setTimeLeft] = useState<number>(7200);
  const [initialDuration, setInitialDuration] = useState<number>(7200);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // SISTEM SEMATKAN LAYAR (CBT KIOSK / SCREEN PINNING & STIMULUS PINNING)
  const [isScreenPinned, setIsScreenPinned] = useState(true); // Kiosk Fixed Full-Viewport Lock
  const [isFullscreenActive, setIsFullscreenActive] = useState(false);
  const [isStimulusPinned, setIsStimulusPinned] = useState(true); // Sematkan Wacana & Gambar
  const [violationCount, setViolationCount] = useState(0);
  const [showViolationBanner, setShowViolationBanner] = useState(false);
  const [showExitPinModal, setShowExitPinModal] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlockError, setUnlockError] = useState('');

  // CBT Comfort Features: Font Size & Image Lightbox
  const [fontScale, setFontScale] = useState<'sm' | 'md' | 'lg'>('md');
  const [lightboxImage, setLightboxImage] = useState<{ url: string; caption?: string } | null>(null);

  // AI Tutor Deep Explanation State in Review Mode
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});
  const [aiLoadingId, setAiLoadingId] = useState<string | null>(null);

  // Saved Session Recovery State
  const [savedSession, setSavedSession] = useState<SavedCbtSession | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_ACTIVE_CBT);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedCbtSession;
        if (parsed && parsed.timeLeft > 0) return parsed;
      }
    } catch {}
    return null;
  });

  // History State
  const [history, setHistory] = useState<TryoutHistory[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_HISTORY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      { id: 'h_1', name: 'TKA Bahasa Indonesia Wajib (Real CBT Pusmendik)', date: '2026-10-22', score: 833, correct: 25, total: 30, durationMinutes: 64 },
      { id: 'h_2', name: 'TKA Matematika Wajib & Numerasi (Real CBT Pusmendik)', date: '2026-10-24', score: 850, correct: 17, total: 20, durationMinutes: 68 },
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

  // Track native Fullscreen API changes & WakeLock when CBT is active
  useEffect(() => {
    const handleFsChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreenActive(active);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Screen WakeLock + Anti-Tab-Switch Detection (Exambrowser Proctoring) during active CBT
  useEffect(() => {
    if (!quizStarted || isFinished) return;

    let wakeLockSentinel: WakeLockSentinel | null = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockSentinel = await navigator.wakeLock.request('screen');
        }
      } catch {}
    };
    void requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.hidden && isScreenPinned) {
        setViolationCount(prev => prev + 1);
        setShowViolationBanner(true);
        push({
          tone: 'warning',
          title: 'Peringatan Sistem Sematkan Layar CBT',
          description: 'Terdeteksi perpindahan tab/jendela di luar layar ujian TKA. Tetap berada di layar CBT.'
        });
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Ujian CBT sedang berlangsung dan layar sedang disematkan.';
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch(() => {});
      }
    };
  }, [quizStarted, isFinished, isScreenPinned, push]);

  const enterBrowserFullscreen = useCallback(async () => {
    try {
      const el = cbtContainerRef.current || document.documentElement;
      if (!document.fullscreenElement && el.requestFullscreen) {
        await el.requestFullscreen();
      }
      setIsScreenPinned(true);
    } catch {
      setIsScreenPinned(true);
    }
  }, []);

  const exitBrowserFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch {}
  }, []);

  const toggleScreenPinning = async () => {
    if (!isScreenPinned || !isFullscreenActive) {
      await enterBrowserFullscreen();
      push({
        tone: 'success',
        title: 'Layar CBT Disematkan (Mode Kiosk Aktif)',
        description: 'Layar ujian dikunci penuh (Full-Screen Exambrowser) dengan pelindung perpindahan tab.'
      });
    } else {
      setUnlockPassword('');
      setUnlockError('');
      setShowExitPinModal(true);
    }
  };

  const handleUnlockWithPassword = async () => {
    const trimmed = unlockPassword.trim();
    if (trimmed === 'admin2026') {
      await exitBrowserFullscreen();
      setIsScreenPinned(false);
      setShowExitPinModal(false);
      setUnlockPassword('');
      setUnlockError('');
      push({
        tone: 'neutral',
        title: 'Layar Berhasil Dibuka',
        description: 'Otorisasi pengawas (admin2026) terverifikasi. Layar kembali ke mode biasa.'
      });
    } else {
      setUnlockError('Password otorisasi salah! Masukkan password pengawas yang valid.');
    }
  };

  // Filter questions by selected subtest
  const activeQuestions: Question[] = useMemo(() => {
    if (activeFilterSubject === 'Semua') return tkaQuestions;
    const filtered = tkaQuestions.filter(q => q.subject === activeFilterSubject);
    return filtered.length > 0 ? filtered : tkaQuestions;
  }, [activeFilterSubject]);

  const currentQ = activeQuestions[currentQuestionIndex] || activeQuestions[0];

  // Safety passage & image resolver: Guarantees that even if a question shares a passageGroupId,
  // the full passage and images are ALWAYS resolved and displayed directly on the current question!
  const resolvedStimulus = useMemo(() => {
    if (!currentQ) return { passage: undefined, passageTitle: undefined, images: [] as string[], imageCaption: undefined };

    let passage = currentQ.passage;
    let passageTitle = currentQ.passageTitle;
    let imageCaption = currentQ.imageCaption;
    const imageSet = new Set<string>();

    if (currentQ.imageUrl) imageSet.add(currentQ.imageUrl);
    if (currentQ.images) currentQ.images.forEach(img => imageSet.add(img));

    if (currentQ.passageGroupId) {
      const groupMembers = tkaQuestions.filter(q => q.passageGroupId === currentQ.passageGroupId);
      for (const member of groupMembers) {
        if ((!passage || passage.includes('See previous passage')) && member.passage && !member.passage.includes('See previous passage')) {
          passage = member.passage;
        }
        if (!passageTitle && member.passageTitle) {
          passageTitle = member.passageTitle;
        }
        if (!imageCaption && member.imageCaption) {
          imageCaption = member.imageCaption;
        }
        if (imageSet.size === 0) {
          if (member.imageUrl) imageSet.add(member.imageUrl);
          if (member.images) member.images.forEach(img => imageSet.add(img));
        }
      }
    }

    return {
      passage,
      passageTitle,
      images: Array.from(imageSet),
      imageCaption,
    };
  }, [currentQ]);

  const subtestCards = useMemo(() => {
    const subjects: SubjectType[] = [
      'Bahasa Indonesia',
      'Penalaran Matematika',
      'Bahasa Inggris',
      'Pengetahuan Kuantitatif',
      'Penalaran Umum',
    ];
    return subjects.map(sub => {
      const cfg = TKA_SUBTEST_CONFIGS[sub];
      const count = tkaQuestions.filter(q => q.subject === sub).length;
      const withImageCount = tkaQuestions.filter(q => q.subject === sub && (q.imageUrl || (q.images && q.images.length > 0))).length;
      return {
        ...cfg,
        actualCount: count,
        withImageCount,
      };
    });
  }, []);

  // Persist active CBT session to localStorage every second / answer change
  useEffect(() => {
    if (!quizStarted || isFinished) return;
    const sessionData: SavedCbtSession = {
      activeFilterSubject,
      currentQuestionIndex,
      answers,
      doubtful,
      timeLeft,
      initialDuration,
      violationCount,
      updatedAt: Date.now(),
    };
    try {
      localStorage.setItem(STORAGE_ACTIVE_CBT, JSON.stringify(sessionData));
      setSavedSession(sessionData);
    } catch {}
  }, [quizStarted, isFinished, activeFilterSubject, currentQuestionIndex, answers, doubtful, timeLeft, initialDuration, violationCount]);

  // Active Real-Time Countdown Timer Effect
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

  // Pro CBT Keyboard Shortcuts (A-E to select option, Left/Right arrows to navigate, R to toggle doubtful, F to pin screen)
  useEffect(() => {
    if (!quizStarted || isFinished) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Escape') {
        if (lightboxImage) {
          setLightboxImage(null);
          return;
        }
        if (showConfirmModal) {
          setShowConfirmModal(false);
          return;
        }
        if (showExitPinModal) {
          setShowExitPinModal(false);
          return;
        }
      }

      if (showConfirmModal || lightboxImage || showExitPinModal) return;

      const key = e.key.toLowerCase();
      if (['a', 'b', 'c', 'd', 'e'].includes(key)) {
        const idx = key.charCodeAt(0) - 97;
        if (currentQ && idx >= 0 && idx < currentQ.options.length) {
          e.preventDefault();
          setAnswers(prev => ({ ...prev, [currentQ.id]: idx }));
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
      } else if (key === 'f') {
        e.preventDefault();
        void enterBrowserFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quizStarted, isFinished, showConfirmModal, lightboxImage, showExitPinModal, currentQ, activeQuestions.length, enterBrowserFullscreen]);

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    if (h > 0) {
      return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }
    return `00:${pad(m)}:${pad(s)}`;
  };

  const handleStartExam = (subjectFilter: SubjectType | 'Semua' = 'Semua', customSeconds?: number, autoPinScreen = true) => {
    const config = TKA_SUBTEST_CONFIGS[subjectFilter] || TKA_SUBTEST_CONFIGS['Semua'];
    const durationSec = customSeconds ?? config.durationSeconds;

    setActiveFilterSubject(subjectFilter);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setDoubtful({});
    setIsFinished(false);
    setReviewMode(false);
    setInitialDuration(durationSec);
    setTimeLeft(durationSec);
    setViolationCount(0);
    setShowViolationBanner(false);
    setIsScreenPinned(true);
    setIsStimulusPinned(true);
    setQuizStarted(true);

    if (autoPinScreen) {
      setTimeout(() => {
        void enterBrowserFullscreen();
      }, 80);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResumeSavedSession = () => {
    if (!savedSession) return;
    setActiveFilterSubject(savedSession.activeFilterSubject);
    setCurrentQuestionIndex(savedSession.currentQuestionIndex);
    setAnswers(savedSession.answers);
    setDoubtful(savedSession.doubtful);
    setInitialDuration(savedSession.initialDuration);
    setTimeLeft(savedSession.timeLeft);
    setViolationCount(savedSession.violationCount || 0);
    setIsFinished(false);
    setReviewMode(false);
    setIsScreenPinned(true);
    setQuizStarted(true);
    setTimeout(() => {
      void enterBrowserFullscreen();
    }, 80);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDiscardSavedSession = () => {
    localStorage.removeItem(STORAGE_ACTIVE_CBT);
    setSavedSession(null);
  };

  const handleFinishExam = async () => {
    await exitBrowserFullscreen();
    setIsScreenPinned(false);

    let correctCount = 0;
    activeQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correctCount += 1;
    });

    const finalScore = Math.round((correctCount / activeQuestions.length) * 1000);
    const accuracy = Math.round((correctCount / activeQuestions.length) * 100);
    const timeSpentMinutes = Math.max(1, Math.round((initialDuration - timeLeft) / 60));
    const currentConfig = TKA_SUBTEST_CONFIGS[activeFilterSubject] || TKA_SUBTEST_CONFIGS['Semua'];
    const tryoutName = `${currentConfig.officialName} (${activeQuestions.length} Soal)`;

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
      localStorage.removeItem(STORAGE_ACTIVE_CBT);
      setSavedSession(null);
      confetti({ particleCount: 90, spread: 85, origin: { y: 0.6 } });
    } catch {}

    setIsFinished(true);
    setShowConfirmModal(false);
    setShowExitPinModal(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

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

  const handleAskAiTutor = async (q: Question, userAnsIdx?: number) => {
    if (aiLoadingId) return;
    setAiLoadingId(q.id);
    try {
      const correctOpt = q.options[q.correctAnswer] || '';
      const userOpt = userAnsIdx !== undefined ? (q.options[userAnsIdx] || 'Tidak dijawab') : 'Tidak dijawab';
      const prompt = `Kamu adalah Tutor Ahli Resmi TKA Pusmendik Kemendikdasmen & SNBT 2026. Jelaskan secara terstruktur, langkah demi langkah, dan mudah dipahami mengapa jawaban yang tepat untuk soal subtes ${q.subject} (${q.topic}) berikut adalah "${correctOpt}".
${q.passage ? `Wacana Ringkas: ${q.passage.slice(0, 500)}...\n` : ''}Soal: ${q.questionText}
Jawaban siswa: "${userOpt}"
Berikan juga 1 strategi cepat menjawab tipe soal ini saat ujian CBT sesungguhnya.`;

      const reply = await askAiAssistant({ prompt, workspace: workspaceId });
      setAiExplanations(prev => ({ ...prev, [q.id]: reply }));
    } catch {
      setAiExplanations(prev => ({
        ...prev,
        [q.id]: q.explanation || 'Fokus pada kata kunci soal dan eliminasi opsi yang bertentangan dengan informasi tersurat pada wacana.'
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
        title: 'Jadwal TKA 2026 Tersinkronisasi',
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
        title: `Alarm Hari Ke-${hariKe} Aktif`,
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

  const fontSizeClass =
    fontScale === 'sm'
      ? 'text-xs leading-relaxed'
      : fontScale === 'lg'
        ? 'text-base sm:text-lg leading-relaxed'
        : 'text-sm sm:text-[15px] leading-relaxed';

  // =========================================================================
  // 1. LAYAR EVALUASI HASIL UJIAN + PEMBAHASAN LENGKAP & WACANA UTUH
  // =========================================================================
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
      if (ans === undefined) {
        emptyCount += 1;
      } else if (ans === q.correctAnswer) {
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
        ? { grade: 'Sangat Unggul (Istimewa)', desc: 'Penguasaan kompetensi TKA Pusmendik sangat matang untuk seleksi PTN utama.', tone: 'text-emerald-600 dark:text-emerald-400' }
        : finalScore >= 680
          ? { grade: 'Baik (Kompetitif)', desc: 'Skor melampaui ambang batas rata-rata nasional. Pertahankan konsistensi.', tone: 'text-sky-600 dark:text-sky-400' }
          : finalScore >= 550
            ? { grade: 'Memadai (Menengah)', desc: 'Perkuat kembali subtes dengan akurasi di bawah 70%.', tone: 'text-amber-600 dark:text-amber-400' }
            : { grade: 'Kurang (Perlu Intensif)', desc: 'Pelajari pembahasan tiap soal beserta wacananya di bawah ini.', tone: 'text-rose-600 dark:text-rose-400' };

    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-24 mt-2 fade-up">
        <Card className="p-6 sm:p-8 text-center border border-[var(--tf-border)] bg-[var(--tf-bg-surface)]">
          <div className="w-16 h-16 bg-[#C8A96E]/15 text-[#C8A96E] border border-[#C8A96E]/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Award size={32} />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.2em] bg-[var(--tf-bg-elevated)] text-[var(--tf-text-secondary)] border border-[var(--tf-border)] mb-2">
            Laporan Hasil Resmi Simulasi CBT Pusmendik
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--tf-text-primary)] mb-1" style={{ fontFamily: 'var(--tf-font-display)' }}>
            Evaluasi Ujian TKA Selesai
          </h2>
          <p className="text-[var(--tf-text-secondary)] text-xs sm:text-sm max-w-xl mx-auto">
            Skor dihitung menggunakan pembobotan standar Pusmendik Kemendikdasmen (Skala 1000) dan otomatis tersimpan pada riwayat akademikmu.
          </p>

          {/* Skor Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto my-6 text-center">
            <div className="p-4 rounded-2xl bg-[#141311] text-[#F5F3EE] border border-[#C8A96E]/30">
              <div className="text-[10px] font-semibold text-[#A39E95] uppercase tracking-[0.16em]">Skor IRT TKA</div>
              <div className="text-3xl sm:text-4xl font-bold text-[#E5CFA0] mt-1 font-mono">{finalScore}</div>
              <div className="text-[10px] text-[#C8A96E] font-medium mt-1">Skala 1000</div>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--tf-bg-elevated)] border border-[var(--tf-border)]">
              <div className="text-[10px] font-semibold text-[var(--tf-text-muted)] uppercase tracking-[0.16em]">Jawaban Benar</div>
              <div className="text-3xl sm:text-4xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">{correctCount}</div>
              <div className="text-[10px] text-[var(--tf-text-secondary)] font-medium mt-1">Dari {activeQuestions.length} Soal</div>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--tf-bg-elevated)] border border-[var(--tf-border)]">
              <div className="text-[10px] font-semibold text-[var(--tf-text-muted)] uppercase tracking-[0.16em]">Salah / Kosong</div>
              <div className="text-3xl sm:text-4xl font-bold text-rose-600 dark:text-rose-400 mt-1 font-mono">{wrongCount}</div>
              <div className="text-[10px] text-[var(--tf-text-secondary)] font-medium mt-1">{emptyCount} Tidak Dijawab</div>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--tf-bg-elevated)] border border-[var(--tf-border)]">
              <div className="text-[10px] font-semibold text-[var(--tf-text-muted)] uppercase tracking-[0.16em]">Akurasi</div>
              <div className="text-3xl sm:text-4xl font-bold text-[var(--tf-text-primary)] mt-1 font-mono">{accuracy}%</div>
              <div className={`text-[10px] font-semibold mt-1 ${gradeInfo.tone}`}>{gradeInfo.grade}</div>
            </div>
          </div>

          {/* Diagnostik Per Subtes */}
          <div className="p-5 rounded-2xl bg-[var(--tf-bg-elevated)] border border-[var(--tf-border)] max-w-3xl mx-auto text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-[var(--tf-border)]">
              <div className="flex items-center gap-2">
                <BarChart3 size={17} className="text-[#C8A96E]" />
                <h3 className="font-semibold text-sm text-[var(--tf-text-primary)]">
                  Rincian Capaian Kompetensi Per Subtes
                </h3>
              </div>
              <span className={`text-xs font-semibold ${gradeInfo.tone}`}>{gradeInfo.desc}</span>
            </div>

            <div className="space-y-3">
              {Object.entries(subjectBreakdown).map(([subj, stat]) => {
                const pct = Math.round((stat.correct / stat.total) * 100);
                return (
                  <div key={subj} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-[var(--tf-text-primary)]">{subj}</span>
                      <span className="font-mono text-[var(--tf-text-secondary)]">
                        {stat.correct}/{stat.total} Benar ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-[#C8A96E]' : 'bg-rose-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
            <Button
              onClick={() => setReviewMode(!reviewMode)}
              icon={<Eye size={16} />}
            >
              {reviewMode ? 'Sembunyikan Kunci & Pembahasan' : 'Buka Pembahasan Lengkap + Wacana & Gambar'}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setIsFinished(false);
                setQuizStarted(false);
              }}
            >
              Kembali ke Lobi CBT TKA
            </Button>
          </div>
        </Card>

        {/* REVIEW MODE LIST */}
        {reviewMode && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--tf-text-primary)] flex items-center gap-2">
                <BookMarked size={19} className="text-[#C8A96E]" />
                Kunci Jawaban, Wacana Utuh & Pembahasan Resmi ({activeQuestions.length} Soal)
              </h3>
            </div>

            {activeQuestions.map((q, idx) => {
              const userAns = answers[q.id];
              const isCorrect = userAns === q.correctAnswer;
              const isSkipped = userAns === undefined;
              const allImgs = Array.from(new Set([...(q.imageUrl ? [q.imageUrl] : []), ...(q.images || [])]));

              return (
                <Card key={q.id} className="p-5 sm:p-6 border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--tf-border)]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-[var(--tf-bg-elevated)] text-[var(--tf-text-primary)] border border-[var(--tf-border)]">
                        Nomor {idx + 1}
                      </span>
                      <span className="text-xs font-medium text-[var(--tf-text-secondary)]">
                        {q.subject} • {q.topic}
                      </span>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      isCorrect
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : isSkipped
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                    }`}>
                      {isCorrect ? 'Jawaban Benar' : isSkipped ? 'Tidak Dijawab' : 'Jawaban Kurang Tepat'}
                    </span>
                  </div>

                  {/* Gambar di Pembahasan */}
                  {allImgs.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {allImgs.map((imgUrl, i) => (
                        <div key={imgUrl + i} className="rounded-xl border border-[var(--tf-border)] bg-white p-2 flex flex-col items-center">
                          <img
                            src={imgUrl}
                            alt={q.imageCaption || `Gambar Soal ${idx + 1}`}
                            className="max-h-[260px] w-auto object-contain rounded-lg cursor-zoom-in"
                            onClick={() => setLightboxImage({ url: imgUrl, caption: q.imageCaption })}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Wacana di Pembahasan */}
                  {q.passage && (
                    <div className="p-4 rounded-xl bg-[var(--tf-bg-elevated)] border border-[var(--tf-border)] text-xs leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap text-[var(--tf-text-secondary)]">
                      {q.passageTitle && (
                        <div className="font-bold text-[var(--tf-text-primary)] mb-1.5 uppercase tracking-wider">
                          {q.passageTitle}
                        </div>
                      )}
                      {q.passage}
                    </div>
                  )}

                  <div className="text-sm sm:text-base font-medium text-[var(--tf-text-primary)] whitespace-pre-line leading-relaxed">
                    {q.questionText}
                  </div>

                  <div className="space-y-2">
                    {q.options.map((optText, optIdx) => {
                      const isOptionCorrect = optIdx === q.correctAnswer;
                      const isOptionUser = optIdx === userAns;
                      const letter = String.fromCharCode(65 + optIdx);

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-xl text-xs sm:text-sm border flex items-center justify-between gap-3 ${
                            isOptionCorrect
                              ? 'border-emerald-500/50 bg-emerald-500/10 text-[var(--tf-text-primary)] font-semibold'
                              : isOptionUser
                                ? 'border-rose-500/50 bg-rose-500/10 text-[var(--tf-text-primary)]'
                                : 'border-[var(--tf-border)] bg-[var(--tf-bg-elevated)]/50 text-[var(--tf-text-secondary)]'
                          }`}
                        >
                          <span>
                            <strong className="font-mono mr-2">{letter}.</strong>
                            {optText}
                          </span>
                          {isOptionCorrect && (
                            <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 shrink-0">
                              Kunci Jawaban
                            </span>
                          )}
                          {isOptionUser && !isOptionCorrect && (
                            <span className="text-[10px] uppercase font-semibold tracking-wider text-rose-600 dark:text-rose-400 shrink-0">
                              Pilihanmu
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="p-4 rounded-xl bg-[#C8A96E]/10 border border-[#C8A96E]/30 text-xs sm:text-sm text-[var(--tf-text-primary)] whitespace-pre-line leading-relaxed">
                      <div className="font-semibold text-[#C8A96E] uppercase tracking-wider text-[11px] mb-1">
                        Pembahasan Resmi Pusmendik:
                      </div>
                      {q.explanation}
                    </div>
                  )}

                  {/* AI Tutor Deep Dive */}
                  <div>
                    {aiExplanations[q.id] ? (
                      <div className="p-4 rounded-xl bg-[var(--tf-bg-elevated)] border border-[var(--tf-border)] text-xs sm:text-sm text-[var(--tf-text-primary)] whitespace-pre-line leading-relaxed">
                        <div className="font-semibold text-[#C8A96E] flex items-center gap-1.5 mb-1.5">
                          <Brain size={14} /> Analisis Langkah demi Langkah AI Tutor:
                        </div>
                        {aiExplanations[q.id]}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void handleAskAiTutor(q, userAns)}
                        disabled={aiLoadingId === q.id}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C8A96E] hover:underline pt-1 cursor-pointer"
                      >
                        {aiLoadingId === q.id ? (
                          <>
                            <Loader2 size={13} className="animate-spin" /> Menganalisis soal dengan AI Tutor...
                          </>
                        ) : (
                          <>
                            <Sparkles size={13} /> Minta Penjelasan Tambahan AI Tutor
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

  // =========================================================================
  // 2. LAYAR UJIAN REAL CBT PUSMENDIK + SISTEM SEMATKAN LAYAR (SCREEN PINNING)
  // =========================================================================
  if (quizStarted && currentQ) {
    const isAnswered = answers[currentQ.id] !== undefined;
    const isFlagged = !!doubtful[currentQ.id];
    const isWarningTimer = timeLeft < 300; // < 5 menit
    const answeredCount = Object.keys(answers).length;
    const doubtfulCount = Object.keys(doubtful).filter(k => doubtful[k]).length;
    const progressPct = Math.round((answeredCount / activeQuestions.length) * 100);
    const currentConfig = TKA_SUBTEST_CONFIGS[activeFilterSubject] || TKA_SUBTEST_CONFIGS['Semua'];
    const hasStimulusLeftPane = Boolean(resolvedStimulus.passage || resolvedStimulus.images.length > 0);

    return (
      <div
        ref={cbtContainerRef}
        className={
          isScreenPinned
            ? 'fixed inset-0 z-[100] bg-[var(--tf-bg-primary)] overflow-y-auto px-3 sm:px-6 py-3 sm:py-4 select-none'
            : 'max-w-[1440px] mx-auto pb-20 space-y-4 select-none'
        }
        onContextMenu={(e) => {
          if (isScreenPinned) e.preventDefault();
        }}
      >
        <div className="max-w-[1480px] mx-auto space-y-3.5 pb-12">
          {/* Lightbox Zoom Gambar */}
          {lightboxImage && (
            <div
              className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
              onClick={() => setLightboxImage(null)}
            >
              <div
                className="relative max-w-5xl w-full bg-[#141311] border border-white/15 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col items-center"
                onClick={e => e.stopPropagation()}
              >
                <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                  <span className="text-xs font-medium text-[#E5CFA0]">
                    {lightboxImage.caption || 'Detail Gambar Stimulus Resmi TKA Pusmendik'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setLightboxImage(null)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="bg-white rounded-xl p-3 max-h-[78vh] overflow-auto w-full flex justify-center">
                  <img
                    src={lightboxImage.url}
                    alt={lightboxImage.caption || 'Stimulus TKA'}
                    className="max-w-full h-auto object-contain"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modal Konfirmasi Lepas Sematan Layar (Buka Layar dengan Password admin2026 jika belum selesai) */}
          {showExitPinModal && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
              <div className="bg-[var(--tf-bg-surface)] rounded-2xl p-6 max-w-md w-full border border-[var(--tf-border)] shadow-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#C8A96E]/15 text-[#C8A96E] border border-[#C8A96E]/30 shrink-0">
                    <Lock size={22} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-[var(--tf-text-primary)]">
                      Layar CBT Sedang Terkunci
                    </h3>
                    <p className="text-xs text-[var(--tf-text-secondary)]">
                      Sistem Sematkan Layar Pusmendik (Exambrowser Guard)
                    </p>
                  </div>
                </div>

                {answeredCount >= activeQuestions.length ? (
                  // Kasus 1: Seluruh soal sudah selesai dijawab
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                      <strong>Seluruh soal telah selesai dijawab ({answeredCount}/{activeQuestions.length}).</strong> Kamu dapat melepas sematan layar atau langsung mengumpulkan ujian.
                    </div>
                    <div className="flex gap-2.5 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        onClick={async () => {
                          await exitBrowserFullscreen();
                          setIsScreenPinned(false);
                          setShowExitPinModal(false);
                        }}
                      >
                        Buka Sematan Layar
                      </Button>
                      <Button
                        size="sm"
                        fullWidth
                        onClick={() => {
                          setShowExitPinModal(false);
                          setShowConfirmModal(true);
                        }}
                      >
                        Kumpulkan Ujian
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Kasus 2: Soal belum selesai -> Harus dengan password admin2026
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                      Soal belum selesai ({answeredCount} dari {activeQuestions.length} terjawab). Sesuai prosedur CBT, layar hanya dapat dibuka setelah ujian selesai atau dengan <strong>Password Pengawas / Proktor</strong>.
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[var(--tf-text-primary)] block">
                        Password Pengawas (Proctor Authorization):
                      </label>
                      <input
                        type="password"
                        value={unlockPassword}
                        onChange={(e) => {
                          setUnlockPassword(e.target.value);
                          if (unlockError) setUnlockError('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            void handleUnlockWithPassword();
                          }
                        }}
                        placeholder="Masukkan password pengawas..."
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--tf-bg-elevated)] border border-[var(--tf-border)] text-[var(--tf-text-primary)] focus:outline-none focus:border-[#C8A96E] font-mono tracking-wider"
                        autoFocus
                      />
                      {unlockError ? (
                        <div className="text-[11px] text-rose-500 font-medium pt-0.5">
                          {unlockError}
                        </div>
                      ) : (
                        <div className="text-[11px] text-[var(--tf-text-muted)] pt-0.5">
                          Gunakan password resmi pengawas: <code className="font-mono font-semibold text-[#C8A96E]">admin2026</code>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2.5 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        onClick={() => {
                          setShowExitPinModal(false);
                          setUnlockPassword('');
                          setUnlockError('');
                        }}
                      >
                        Batal (Tetap Terkunci)
                      </Button>
                      <Button
                        size="sm"
                        fullWidth
                        onClick={() => void handleUnlockWithPassword()}
                        disabled={!unlockPassword.trim()}
                      >
                        Buka Kunci Layar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modal Konfirmasi Kumpulkan Ujian */}
          {showConfirmModal && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
              <div className="bg-[var(--tf-bg-surface)] rounded-2xl p-6 max-w-md w-full border border-[var(--tf-border)] shadow-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-[var(--tf-text-primary)]">
                      Konfirmasi Pengumpulan Jawaban CBT
                    </h3>
                    <p className="text-xs text-[var(--tf-text-secondary)]">
                      Pastikan seluruh nomor soal telah diperiksa kembali.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--tf-bg-elevated)] border border-[var(--tf-border)] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--tf-text-secondary)]">Total Soal Subtes:</span>
                    <span className="font-mono font-semibold text-[var(--tf-text-primary)]">{activeQuestions.length} Soal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--tf-text-secondary)]">Sudah Dijawab:</span>
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{answeredCount} Soal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--tf-text-secondary)]">Belum Dijawab:</span>
                    <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">{activeQuestions.length - answeredCount} Soal</span>
                  </div>
                  {doubtfulCount > 0 && (
                    <div className="flex justify-between pt-1 border-t border-[var(--tf-border)]">
                      <span className="text-amber-600 dark:text-amber-400 font-medium">Status Ragu-ragu:</span>
                      <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">{doubtfulCount} Soal</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2.5 pt-2">
                  <Button variant="outline" size="sm" fullWidth onClick={() => setShowConfirmModal(false)}>
                    Kembali ke Soal
                  </Button>
                  <Button size="sm" fullWidth onClick={() => void handleFinishExam()}>
                    Selesai & Kumpulkan
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Banner Peringatan Pelanggaran Fokus / Pindah Jendela */}
          {showViolationBanner && (
            <div className="rounded-xl bg-amber-500/15 border border-amber-500/40 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-700 dark:text-amber-300">
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="shrink-0" />
                <span>
                  <strong>Sistem Sematkan Layar (Exambrowser Guard):</strong> Terdeteksi {violationCount}x perpindahan fokus keluar dari jendela ujian. Pada TKA sesungguhnya, berpindah aplikasi dapat mengunci sesi ujian.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowViolationBanner(false);
                    void enterBrowserFullscreen();
                  }}
                  className="px-3 py-1 rounded-lg font-semibold bg-amber-500 text-black hover:bg-amber-400 transition-colors cursor-pointer"
                >
                  Kunci & Sematkan Kembali
                </button>
              </div>
            </div>
          )}

          {/* TOP BAR RESMI PUSMENDIK CBT + KONTROL SEMATKAN LAYAR */}
          <header className="rounded-2xl bg-[#141311] text-[#F5F3EE] border border-[var(--tf-border)] p-3.5 sm:px-5 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Identitas Aplikasi & Status Sematkan Layar */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#C8A96E]/15 border border-[#C8A96E]/35 flex items-center justify-center text-[#E5CFA0] shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#C8A96E]">
                      PUSMENDIK CBT EXAMBROWSER
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      isScreenPinned
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/35'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/35'
                    }`}>
                      <Lock size={10} />
                      {isScreenPinned
                        ? (isFullscreenActive ? 'LAYAR DISEMATKAN (FULLSCREEN LOCK)' : 'LAYAR DISEMATKAN (KIOSK LOCK)')
                        : 'MODE JENDELA BIASA'}
                    </span>
                  </div>
                  <h1 className="font-semibold text-sm sm:text-base text-[#F5F3EE] tracking-tight">
                    {currentConfig.officialName}
                  </h1>
                </div>
              </div>

              {/* Kontrol Sematkan Layar, Ukuran Font, & Countdown Waktu Real */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 ml-auto">
                {/* Tombol Utama: SEMATKAN LAYAR (Fullscreen Kiosk Pin) */}
                <button
                  type="button"
                  onClick={() => void toggleScreenPinning()}
                  title="Sematkan Layar Penuh (Pintasan: F)"
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isScreenPinned && isFullscreenActive
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                      : 'bg-[#C8A96E]/20 border-[#C8A96E]/50 text-[#E5CFA0] hover:bg-[#C8A96E] hover:text-[#141311]'
                  }`}
                >
                  {isScreenPinned && isFullscreenActive ? (
                    <>
                      <Minimize2 size={14} />
                      <span>Layar Tersemat</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 size={14} />
                      <span>Sematkan Layar Penuh</span>
                    </>
                  )}
                </button>

                {/* Tombol Sematkan Panel Bacaan/Gambar (Split-Screen Pin) */}
                {hasStimulusLeftPane && (
                  <button
                    type="button"
                    onClick={() => setIsStimulusPinned(prev => !prev)}
                    className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isStimulusPinned
                        ? 'bg-white/10 border-[#C8A96E]/40 text-[#E5CFA0]'
                        : 'bg-white/5 border-white/10 text-[#A39E95] hover:text-white'
                    }`}
                  >
                    {isStimulusPinned ? <Pin size={13} className="text-[#C8A96E]" /> : <PinOff size={13} />}
                    <span>{isStimulusPinned ? 'Wacana Disematkan' : 'Sematkan Wacana'}</span>
                  </button>
                )}

                {/* Ukuran Huruf A- A A+ */}
                <div className="hidden lg:flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                  <span className="px-2 text-[10px] text-[#A39E95] flex items-center gap-1">
                    <Type size={11} />
                  </span>
                  {(['sm', 'md', 'lg'] as const).map((sz, idx) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setFontScale(sz)}
                      className={`px-2 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                        fontScale === sz
                          ? 'bg-[#C8A96E] text-[#141311]'
                          : 'text-[#A39E95] hover:text-white'
                      }`}
                    >
                      {idx === 0 ? 'A-' : idx === 1 ? 'A' : 'A+'}
                    </button>
                  ))}
                </div>

                {/* Box Countdown Timer Real */}
                <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono ${
                  isWarningTimer
                    ? 'bg-rose-950/80 border-rose-500/50 text-rose-200 animate-pulse'
                    : 'bg-white/[0.06] border-white/15 text-[#F5F3EE]'
                }`}>
                  <Clock size={15} className={isWarningTimer ? 'text-rose-400' : 'text-[#C8A96E]'} />
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.14em] text-[#A39E95] leading-none">
                      Waktu Real
                    </div>
                    <div className="text-sm sm:text-base font-bold tracking-wider leading-tight mt-0.5">
                      {formatTimer(timeLeft)}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer shrink-0"
                >
                  Selesai Ujian
                </button>
              </div>
            </div>

            {/* Sub-bar Progress & Info Soal */}
            <div className="mt-2.5 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-[#A39E95]">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 font-mono text-[#F5F3EE] font-semibold">
                  SOAL NO. {currentQuestionIndex + 1} / {activeQuestions.length}
                </span>
                <span className="text-white/20">|</span>
                <span>Topik: <strong className="text-[#E5CFA0] font-medium">{currentQ.topic}</strong></span>
                <span className="text-white/20 hidden sm:inline">|</span>
                <span className="hidden sm:inline">Tingkat: <strong className="text-[#F5F3EE]">{currentQ.difficulty}</strong></span>
              </div>

              <div className="flex items-center gap-4">
                <span className="hidden xl:flex items-center gap-1.5 text-[11px]">
                  <Keyboard size={12} className="text-[#C8A96E]" />
                  Pintasan: <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">A-E</kbd> Jawab,{' '}
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">←/→</kbd> Navigasi,{' '}
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">R</kbd> Ragu,{' '}
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">F</kbd> Sematkan Layar
                </span>
                <span className="font-mono text-[11px] text-[#E5CFA0]">
                  {answeredCount}/{activeQuestions.length} Terjawab ({progressPct}%)
                </span>
              </div>
            </div>
          </header>

          {/* WORKSPACE UTAMA CBT: SPLIT SCREEN DENGAN FITUR SEMATKAN WACANA & GAMBAR */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
            {/* AREA SOAL (9 KOLOM DI DESKTOP XL) */}
            <div className="xl:col-span-9">
              <div className={`grid grid-cols-1 ${hasStimulusLeftPane ? 'lg:grid-cols-12' : ''} gap-4 items-start`}>
                {/* PANEL KIRI: WACANA BACAAN LENGKAP & GAMBAR ASLI PUSMENDIK (TERSEMAT / PINNED DI SETIAP NOMOR!) */}
                {hasStimulusLeftPane && (
                  <Card
                    className={`lg:col-span-6 p-4 sm:p-5 border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] flex flex-col ${
                      isStimulusPinned
                        ? 'sticky top-2 z-20 max-h-[42vh] lg:max-h-[calc(100vh-145px)] overflow-y-auto shadow-md ring-1 ring-[#C8A96E]/25'
                        : 'max-h-[75vh] overflow-y-auto'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 pb-2.5 mb-3.5 border-b border-[var(--tf-border)] sticky top-0 bg-[var(--tf-bg-surface)] z-10">
                      <div className="flex items-center gap-2">
                        <FileText size={15} className="text-[#C8A96E]" />
                        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--tf-text-primary)]">
                          Wacana & Gambar Soal No. {currentQuestionIndex + 1}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setIsStimulusPinned(prev => !prev)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors cursor-pointer ${
                            isStimulusPinned
                              ? 'bg-[#C8A96E]/15 text-[#C8A96E] border-[#C8A96E]/40'
                              : 'bg-[var(--tf-bg-elevated)] text-[var(--tf-text-secondary)] border-[var(--tf-border)]'
                          }`}
                        >
                          {isStimulusPinned ? <Pin size={11} /> : <PinOff size={11} />}
                          <span>{isStimulusPinned ? 'Layar Bacaan Tersemat' : 'Sematkan Bacaan'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Gambar Stimulus Pusmendik (dengan fitur Klik untuk Zoom) */}
                    {resolvedStimulus.images.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {resolvedStimulus.images.map((imgUrl, idx) => (
                          <div
                            key={imgUrl + idx}
                            className="group relative rounded-xl border border-[var(--tf-border)] bg-white p-2.5 flex flex-col items-center shadow-xs"
                          >
                            <img
                              src={imgUrl}
                              alt={resolvedStimulus.imageCaption || `Stimulus Visual Nomor ${currentQuestionIndex + 1}`}
                              className="max-h-[300px] w-auto object-contain rounded-lg cursor-zoom-in transition-transform duration-200 group-hover:scale-[1.01]"
                              onClick={() => setLightboxImage({ url: imgUrl, caption: resolvedStimulus.imageCaption })}
                            />
                            <div className="mt-2 w-full flex items-center justify-between text-[11px] text-neutral-600 px-1 pt-1.5 border-t border-neutral-100">
                              <span className="flex items-center gap-1 font-medium line-clamp-1">
                                <ImageIcon size={12} className="text-neutral-500 shrink-0" />
                                {resolvedStimulus.imageCaption || `Ilustrasi Resmi Pusmendik (${idx + 1}/${resolvedStimulus.images.length})`}
                              </span>
                              <button
                                type="button"
                                onClick={() => setLightboxImage({ url: imgUrl, caption: resolvedStimulus.imageCaption })}
                                className="inline-flex items-center gap-1 font-semibold text-neutral-900 hover:underline cursor-pointer shrink-0 ml-2"
                              >
                                <ZoomIn size={12} /> Perbesar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Teks Bacaan Utuh */}
                    {resolvedStimulus.passage && (
                      <div className="space-y-2">
                        {resolvedStimulus.passageTitle && (
                          <h2
                            className="text-base sm:text-lg font-semibold text-[var(--tf-text-primary)] leading-snug"
                            style={{ fontFamily: 'var(--tf-font-display)' }}
                          >
                            {resolvedStimulus.passageTitle}
                          </h2>
                        )}
                        <div className={`${fontSizeClass} text-[var(--tf-text-primary)] whitespace-pre-wrap font-normal selection:bg-[#C8A96E]/30`}>
                          {resolvedStimulus.passage}
                        </div>
                      </div>
                    )}
                  </Card>
                )}

                {/* PANEL KANAN: BUTIR PERTANYAAN & OPSI JAWABAN A-E */}
                <Card className={`${hasStimulusLeftPane ? 'lg:col-span-6' : 'col-span-1'} p-4 sm:p-6 border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] flex flex-col justify-between`}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2.5 border-b border-[var(--tf-border)]">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--tf-text-secondary)]">
                        Pertanyaan Nomor {currentQuestionIndex + 1}
                      </span>
                      <span className="text-[11px] font-mono text-[var(--tf-text-muted)]">
                        Pilihan Ganda (A–E)
                      </span>
                    </div>

                    {/* Teks Pertanyaan */}
                    <div className={`${fontSizeClass} font-medium text-[var(--tf-text-primary)] whitespace-pre-line`}>
                      {currentQ.questionText}
                    </div>

                    {/* Daftar Opsi A - E */}
                    <div className="space-y-2.5 pt-1">
                      {currentQ.options.map((optText, i) => {
                        const isSelected = answers[currentQ.id] === i;
                        const letter = String.fromCharCode(65 + i);
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: i }))}
                            className={`w-full text-left flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#C8A96E] bg-[#C8A96E]/12 text-[var(--tf-text-primary)] shadow-xs'
                                : 'border-[var(--tf-border)] bg-[var(--tf-bg-elevated)]/50 hover:border-[#C8A96E]/50 hover:bg-[var(--tf-bg-elevated)] text-[var(--tf-text-primary)]'
                            }`}
                          >
                            <span
                              className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                isSelected
                                  ? 'bg-[#C8A96E] text-[#141311]'
                                  : 'bg-[var(--tf-bg-surface)] text-[var(--tf-text-secondary)] border border-[var(--tf-border)]'
                              }`}
                            >
                              {letter}
                            </span>
                            <span className={`${fontSizeClass} flex-1`}>
                              {optText}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer Kontrol Soal: Ragu-ragu, Hapus Jawaban, Sebelumnya / Selanjutnya */}
                  <div className="mt-6 pt-4 border-t border-[var(--tf-border)] space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 cursor-pointer select-none text-xs font-semibold text-amber-600 dark:text-amber-400">
                        <input
                          type="checkbox"
                          checked={isFlagged}
                          onChange={toggleDoubtful}
                          className="w-4 h-4 accent-amber-500 rounded"
                        />
                        <span>Ragu-ragu (Tombol R)</span>
                      </label>

                      {isAnswered && (
                        <button
                          type="button"
                          onClick={() => {
                            const nextAnswers = { ...answers };
                            delete nextAnswers[currentQ.id];
                            setAnswers(nextAnswers);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[var(--tf-text-secondary)] hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          <RotateCcw size={13} /> Batalkan Pilihan
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="px-5 py-2.5 rounded-xl font-semibold text-xs text-[var(--tf-text-primary)] bg-[var(--tf-bg-elevated)] border border-[var(--tf-border)] hover:border-[#C8A96E]/50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-all"
                      >
                        ← Soal Sebelumnya
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (currentQuestionIndex === activeQuestions.length - 1) {
                            setShowConfirmModal(true);
                          } else {
                            setCurrentQuestionIndex(prev => Math.min(activeQuestions.length - 1, prev + 1));
                          }
                        }}
                        className="px-6 py-2.5 rounded-xl font-semibold text-xs bg-[#141311] dark:bg-[#C8A96E] text-[#F5F3EE] dark:text-[#141311] hover:opacity-90 transition-all cursor-pointer"
                      >
                        {currentQuestionIndex === activeQuestions.length - 1 ? 'Selesai & Kumpulkan →' : 'Soal Selanjutnya →'}
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* PANEL NAVIGASI NOMOR SOAL CBT (3 KOLOM DI DESKTOP XL) */}
            <div className="xl:col-span-3">
              <Card className="p-4 sm:p-5 sticky top-2 border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] space-y-4">
                <div className="flex items-center justify-between pb-2.5 border-b border-[var(--tf-border)]">
                  <h3 className="font-semibold text-xs uppercase tracking-[0.15em] text-[var(--tf-text-secondary)]">
                    Daftar Nomor Soal
                  </h3>
                  <span className="text-[11px] font-mono font-semibold text-[var(--tf-text-primary)]">
                    {answeredCount}/{activeQuestions.length}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2 max-h-[340px] overflow-y-auto pr-1">
                  {activeQuestions.map((q, idx) => {
                    const ansIdx = answers[q.id];
                    const answered = ansIdx !== undefined;
                    const flagged = !!doubtful[q.id];
                    const isActive = idx === currentQuestionIndex;
                    const letter = answered ? String.fromCharCode(65 + ansIdx) : '';

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`relative h-10 rounded-xl font-mono text-xs font-bold border transition-all flex flex-col items-center justify-center cursor-pointer ${
                          isActive
                            ? 'border-[#C8A96E] bg-[#141311] text-[#E5CFA0] ring-2 ring-[#C8A96E]/40'
                            : flagged
                              ? 'border-amber-500 bg-amber-500/20 text-amber-700 dark:text-amber-300'
                              : answered
                                ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                : 'border-[var(--tf-border)] bg-[var(--tf-bg-elevated)] text-[var(--tf-text-secondary)] hover:border-[#C8A96E]/40'
                        }`}
                      >
                        <span className="leading-none">{idx + 1}</span>
                        {answered && (
                          <span className="text-[9px] leading-none mt-0.5 opacity-85">
                            [{letter}]
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Keterangan Warna Status CBT */}
                <div className="pt-3 border-t border-[var(--tf-border)] grid grid-cols-2 gap-2 text-[11px] text-[var(--tf-text-secondary)]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-[#141311] border border-[#C8A96E]" />
                    <span>Soal Aktif</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-emerald-500/25 border border-emerald-500" />
                    <span>Sudah Dijawab</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500" />
                    <span>Ragu-ragu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-[var(--tf-bg-elevated)] border border-[var(--tf-border)]" />
                    <span>Belum Dijawab</span>
                  </div>
                </div>

                {/* Info Sistem Sematkan Layar di Sidebar */}
                <div className="p-3 rounded-xl bg-[var(--tf-bg-elevated)] border border-[var(--tf-border)] space-y-2 text-[11px]">
                  <div className="flex items-center justify-between font-semibold text-[var(--tf-text-primary)]">
                    <span className="flex items-center gap-1.5">
                      <Columns2 size={13} className="text-[#C8A96E]" />
                      Sistem Sematkan Layar
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">AKTIF</span>
                  </div>
                  <p className="text-[var(--tf-text-secondary)] leading-relaxed">
                    Layar ujian dikunci penuh (Kiosk Pin) dan panel wacana/gambar disematkan otomatis di setiap nomor soal.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. LOBI UTAMA PUSAT SIMULASI REAL CBT TKA PUSMENDIK 2026
  // =========================================================================
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="warning" className="inline-flex">
              PUSMENDIK KEMENDIKDASMEN • REAL CBT 2026
            </Badge>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#C8A96E]/15 text-[#C8A96E] border border-[#C8A96E]/30">
              <Lock size={11} /> Sistem Sematkan Layar (Exambrowser Lock)
            </span>
            {syncStatus && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 size={12} /> Alarm Jadwal TKA Aktif
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--tf-text-primary)] tracking-tight" style={{ fontFamily: 'var(--tf-font-display)' }}>
            Simulasi TKA Nasional Berbasis Komputer (CBT)
          </h1>
          <p className="mt-1 text-[var(--tf-text-secondary)] text-xs sm:text-sm">
            Dilengkapi Sistem Sematkan Layar (Kiosk Exambrowser Lock), wacana & gambar tersemat di setiap nomor soal, dan waktu ujian real Pusmendik.
          </p>
        </div>

        <Button
          onClick={() => void handleSyncAllAlarms()}
          disabled={syncing}
          icon={syncing ? <RefreshCw size={15} className="animate-spin" /> : <BellRing size={15} />}
          className="shrink-0"
        >
          {syncStatus ? 'Sinkronkan Ulang Alarm' : 'Aktifkan Alarm Jadwal TKA'}
        </Button>
      </header>

      {/* Banner Lanjutkan Sesi Ujian Jika Ada */}
      {savedSession && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#141311] text-[#F5F3EE] border border-[#C8A96E]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C8A96E]">
              Sesi CBT Tersimpan Otomatis
            </div>
            <h3 className="text-sm sm:text-base font-semibold">
              Lanjutkan {TKA_SUBTEST_CONFIGS[savedSession.activeFilterSubject]?.officialName || 'Simulasi TKA'}
            </h3>
            <p className="text-xs text-[#A39E95]">
              Terjawab {Object.keys(savedSession.answers).length} soal • Sisa Waktu Real:{' '}
              <span className="font-mono font-semibold text-[#E5CFA0]">{formatTimer(savedSession.timeLeft)}</span>
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleDiscardSavedSession}
              className="px-3.5 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-[#A39E95] border border-white/10 cursor-pointer"
            >
              Reset Sesi
            </button>
            <button
              type="button"
              onClick={handleResumeSavedSession}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#C8A96E] hover:bg-[#D6B980] text-[#141311] cursor-pointer"
            >
              Sematkan Layar & Lanjutkan →
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap bg-[var(--tf-bg-elevated)] p-1 rounded-xl border border-[var(--tf-border)] w-full sm:w-fit text-xs font-semibold gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('tryout')}
          className={`flex-1 sm:px-5 py-2.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'tryout'
              ? 'bg-[var(--tf-bg-surface)] text-[var(--tf-text-primary)] shadow-xs border border-[var(--tf-border)]'
              : 'text-[var(--tf-text-secondary)] hover:text-[var(--tf-text-primary)]'
          }`}
        >
          Simulasi Real CBT ({tkaQuestions.length} Soal Pusmendik)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('materi')}
          className={`flex-1 sm:px-5 py-2.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'materi'
              ? 'bg-[var(--tf-bg-surface)] text-[var(--tf-text-primary)] shadow-xs border border-[var(--tf-border)]'
              : 'text-[var(--tf-text-secondary)] hover:text-[var(--tf-text-primary)]'
          }`}
        >
          Kisi-Kisi & Silabus Resmi
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('jadwal')}
          className={`flex-1 sm:px-5 py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'jadwal'
              ? 'bg-[var(--tf-bg-surface)] text-[var(--tf-text-primary)] shadow-xs border border-[var(--tf-border)]'
              : 'text-[var(--tf-text-secondary)] hover:text-[var(--tf-text-primary)]'
          }`}
        >
          <BellRing size={13} /> Jadwal & Alarm TKA 2026
        </button>
      </div>

      {/* TAB 1: SIMULASI REAL CBT PUSMENDIK */}
      {activeTab === 'tryout' && (
        <div className="space-y-6 fade-up">
          {/* Hero Paket Simulasi Utuh */}
          <div className="relative overflow-hidden rounded-2xl bg-[#141311] text-[#F5F3EE] border border-[var(--tf-border)] p-6 sm:p-8 shadow-lg">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-[0.18em] bg-[#C8A96E]/20 text-[#E5CFA0] border border-[#C8A96E]/35">
                    STANDAR RESMI PUSMENDIK KEMENDIKDASMEN
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Pin size={11} /> Sistem Sematkan Layar & Wacana Aktif
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ fontFamily: 'var(--tf-font-display)' }}>
                  Paket Simulasi Utuh TKA SMA/MA 2026 ({tkaQuestions.length} Soal Real)
                </h2>
                <p className="text-xs sm:text-sm text-[#A39E95] leading-relaxed">
                  Saat ujian dimulai, sistem otomatis mengaktifkan <strong className="text-[#F5F3EE]">Sematkan Layar Penuh (Exambrowser Lock)</strong> serta <strong className="text-[#F5F3EE]">menyematkan teks bacaan & gambar di panel kiri</strong> sehingga tetap diam saat kamu menggeser soal di kanan atau di HP.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-mono text-[#E5CFA0]">
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-[#C8A96E]" /> Durasi Real: 120 Menit (02:00:00)
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Maximize2 size={14} className="text-[#C8A96E]" /> Auto Screen-Pinning (Kiosk)
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-[#C8A96E]" /> Gambar & Wacana Tersemat
                  </span>
                </div>
              </div>

              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => handleStartExam('Semua', TKA_SUBTEST_CONFIGS['Semua'].durationSeconds, true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl font-semibold text-sm bg-[#C8A96E] hover:bg-[#D6B980] text-[#141311] shadow-md transition-all cursor-pointer"
                >
                  <Lock size={16} />
                  <span>Sematkan Layar & Mulai Full CBT (120 Menit)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Pilihan Subtes Resmi dengan Waktu Real Pusmendik (75 Menit Wajib / 60 Menit Pilihan) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--tf-text-secondary)] flex items-center gap-2">
                <Filter size={14} className="text-[#C8A96E]" />
                Pilih Subtes Resmi TKA (Otomatis Sematkan Layar & Waktu Real)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subtestCards.map(sub => (
                <Card
                  key={sub.id}
                  className="p-5 border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] hover:border-[#C8A96E]/60 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                        sub.category === 'Wajib'
                          ? 'bg-[#C8A96E]/15 text-[#C8A96E] border border-[#C8A96E]/30'
                          : 'bg-[var(--tf-bg-elevated)] text-[var(--tf-text-secondary)] border border-[var(--tf-border)]'
                      }`}>
                        Mapel {sub.category}
                      </span>
                      <span className="font-mono text-xs font-bold text-[var(--tf-text-primary)] flex items-center gap-1">
                        <Clock size={13} className="text-[#C8A96E]" />
                        {sub.durationMinutes} Menit Real
                      </span>
                    </div>

                    <h4 className="font-semibold text-base text-[var(--tf-text-primary)]">
                      {sub.label}
                    </h4>

                    <p className="text-xs text-[var(--tf-text-secondary)] leading-relaxed">
                      {sub.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[var(--tf-border)] space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[var(--tf-text-secondary)]">
                      <span>{sub.actualCount} Butir Soal</span>
                      <span>{sub.withImageCount} Soal Bergambar/Grafik</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStartExam(sub.id as SubjectType, sub.durationSeconds, true)}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[var(--tf-bg-elevated)] hover:bg-[#141311] hover:text-[#F5F3EE] dark:hover:bg-[#C8A96E] dark:hover:text-[#141311] text-[var(--tf-text-primary)] border border-[var(--tf-border)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play size={13} />
                      <span>Mulai & Sematkan Layar ({sub.durationMinutes} Menit)</span>
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Riwayat Ujian & Evaluasi */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--tf-text-secondary)]">
                Riwayat Hasil Simulasi CBT
              </h3>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Bersihkan seluruh riwayat hasil simulasi?')) {
                      setHistory([]);
                      localStorage.removeItem(STORAGE_HISTORY);
                    }
                  }}
                  className="text-xs text-rose-500 hover:underline font-medium cursor-pointer"
                >
                  Hapus Riwayat
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {history.length === 0 ? (
                <Card className="p-8 text-center text-[var(--tf-text-secondary)] border border-[var(--tf-border)]">
                  Belum ada riwayat simulasi CBT. Pilih salah satu subtes di atas untuk memulai ujian pertamamu.
                </Card>
              ) : (
                history.map((h, i) => (
                  <Card key={h.id || i} className="p-4 flex items-center justify-between border border-[var(--tf-border)] bg-[var(--tf-bg-surface)]">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 bg-[var(--tf-bg-elevated)] text-[#C8A96E] border border-[var(--tf-border)] rounded-xl flex items-center justify-center font-mono font-bold text-xs">
                        #{history.length - i}
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs sm:text-sm text-[var(--tf-text-primary)]">{h.name}</h4>
                        <div className="text-[11px] text-[var(--tf-text-secondary)] font-mono mt-0.5">
                          {h.date} • {h.correct}/{h.total} Benar • Durasi {h.durationMinutes} menit
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-mono font-bold text-[#C8A96E]">{h.score}</div>
                      <div className="text-[9px] uppercase tracking-wider font-semibold text-[var(--tf-text-muted)]">Skor IRT</div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KISI-KISI & SILABUS RESMI */}
      {activeTab === 'materi' && (
        <div className="space-y-6 fade-up">
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="p-5 border border-[var(--tf-border)] bg-[var(--tf-bg-surface)]">
              <div className="text-[#C8A96E] mb-2"><BookMarked size={20} /></div>
              <div className="text-2xl font-bold font-mono text-[var(--tf-text-primary)]">{tkaQuestions.length} Soal Real</div>
              <div className="text-xs text-[var(--tf-text-secondary)] mt-0.5">Wacana Utuh & Gambar Asli Pusmendik</div>
            </Card>
            <Card className="p-5 border border-[var(--tf-border)] bg-[var(--tf-bg-surface)]">
              <div className="text-emerald-500 mb-2"><Clock size={20} /></div>
              <div className="text-2xl font-bold font-mono text-[var(--tf-text-primary)]">75 & 60 Menit</div>
              <div className="text-xs text-[var(--tf-text-secondary)] mt-0.5">Durasi Real Mapel Wajib & Pilihan</div>
            </Card>
            <Card className="p-5 border border-[var(--tf-border)] bg-[var(--tf-bg-surface)]">
              <div className="text-sky-500 mb-2"><Lock size={20} /></div>
              <div className="text-2xl font-bold font-mono text-[var(--tf-text-primary)]">Screen Pinning</div>
              <div className="text-xs text-[var(--tf-text-secondary)] mt-0.5">Sistem Sematkan Layar & Wacana</div>
            </Card>
          </div>

          <div className="grid gap-3">
            {SUBTESTS.map((sub) => (
              <Card
                key={sub.id}
                onClick={() => setSelectedSubtest(sub)}
                className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] hover:border-[#C8A96E]/60 transition-all cursor-pointer"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="font-semibold text-[var(--tf-text-primary)] text-sm sm:text-base">{sub.name}</h4>
                    <span className="text-[10px] font-mono font-semibold text-[#C8A96E] bg-[#C8A96E]/10 px-2.5 py-0.5 rounded-full border border-[#C8A96E]/30">
                      {sub.durationMinutes} Menit • Mapel {sub.category}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--tf-text-secondary)] mb-3">{sub.description}</p>
                  <div className="h-1.5 w-full bg-[var(--tf-bg-elevated)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#C8A96E] transition-all duration-700"
                      style={{ width: `${sub.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-lg font-mono font-bold text-[var(--tf-text-primary)]">{sub.progress}%</div>
                    <div className="text-[10px] uppercase font-semibold text-[var(--tf-text-muted)]">Kesiapan</div>
                  </div>
                  <div className="h-9 w-9 bg-[var(--tf-bg-elevated)] rounded-full flex items-center justify-center text-[var(--tf-text-secondary)]">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Modal Detail Silabus Subtes */}
          {selectedSubtest && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
              <div className="bg-[var(--tf-bg-surface)] rounded-2xl p-6 max-w-lg w-full border border-[var(--tf-border)] shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-base sm:text-lg text-[var(--tf-text-primary)] flex items-center gap-2">
                    <Target size={18} className="text-[#C8A96E]" /> {selectedSubtest.name}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedSubtest(null)}
                    className="p-1.5 rounded-lg hover:bg-[var(--tf-bg-elevated)] text-[var(--tf-text-secondary)] cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <p className="text-xs text-[var(--tf-text-secondary)] leading-relaxed">
                  {selectedSubtest.description}
                </p>

                <div className="p-4 rounded-xl bg-[var(--tf-bg-elevated)] border border-[var(--tf-border)]">
                  <h4 className="text-xs font-semibold text-[var(--tf-text-primary)] uppercase tracking-wider mb-2">
                    Kisi-Kisi Wacana & Materi Soal:
                  </h4>
                  <ul className="text-xs text-[var(--tf-text-secondary)] space-y-1.5 list-disc list-inside">
                    {selectedSubtest.keyTopics.map(t => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[#C8A96E]/10 border border-[#C8A96E]/30 text-xs text-[var(--tf-text-primary)] leading-relaxed">
                  <strong>Panduan Sistem CBT:</strong> {selectedSubtest.tips}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedSubtest(null)}>
                    Tutup
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      const filterName = selectedSubtest.subjectFilter;
                      const durSec = selectedSubtest.durationMinutes * 60;
                      setSelectedSubtest(null);
                      handleStartExam(filterName, durSec, true);
                    }}
                  >
                    Sematkan Layar & Mulai ({selectedSubtest.durationMinutes} Menit)
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: JADWAL & ALARM NOTIFIKASI TKA 2026 */}
      {activeTab === 'jadwal' && (
        <div className="space-y-6 fade-up">
          <Card className="p-5 sm:p-6 border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-[#C8A96E]/15 text-[#C8A96E] border border-[#C8A96E]/30">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[var(--tf-text-primary)]">
                    Jadwal Resmi & Sinkronisasi Alarm TKA SMA 2026
                  </h3>
                  <p className="text-xs text-[var(--tf-text-secondary)]">
                    Gelombang 1 • Sesi 1 (WIB) • Senin 26 Oktober s.d. Kamis 29 Oktober 2026
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => void handleSyncAllAlarms()}
                disabled={syncing}
                icon={<BellRing size={14} />}
              >
                Aktifkan Semua Alarm (4 Hari)
              </Button>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--tf-bg-elevated)] border border-[var(--tf-border)] text-xs text-[var(--tf-text-secondary)] flex items-start gap-2.5">
              <Info size={16} className="text-[#C8A96E] shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>5 Titik Pengingat Otomatis per Hari Ujian:</strong> Sistem akan mengirim notifikasi pada{' '}
                <span className="font-mono font-semibold text-[var(--tf-text-primary)]">H-1 (19:00 WIB)</span>,{' '}
                <span className="font-mono font-semibold text-[var(--tf-text-primary)]">Pagi Hari-H (05:30 WIB)</span>,{' '}
                <span className="font-mono font-semibold text-[var(--tf-text-primary)]">H-30 Menit (06:30 WIB)</span>,{' '}
                <span className="font-mono font-semibold text-[var(--tf-text-primary)]">H-10 Menit (06:50 WIB)</span>, dan{' '}
                <span className="font-mono font-semibold text-[var(--tf-text-primary)]">Mulai Ujian (07:00 WIB)</span>.
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {EXAM_DAYS_2026.map((day) => (
                <Card key={day.hariKe} className="p-4 border border-[var(--tf-border)] bg-[var(--tf-bg-elevated)]/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase bg-[#C8A96E]/15 text-[#C8A96E] border border-[#C8A96E]/30">
                      Hari Ke-{day.hariKe} • {day.tanggalFormatted}
                    </span>
                    <span className="font-mono text-xs font-semibold text-[var(--tf-text-primary)] flex items-center gap-1">
                      <Clock size={12} className="text-[#C8A96E]" />
                      {day.mulaiWib} - {day.perkiraanSelesaiWib} WIB
                    </span>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-[var(--tf-text-primary)]">{day.shortTitle}</h4>
                    <p className="text-xs text-[var(--tf-text-secondary)] mt-0.5">{day.rincian}</p>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-[var(--tf-border)]">
                    {day.steps.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] text-[var(--tf-text-secondary)]">
                        <span>• {s.name}</span>
                        <span className="font-mono font-semibold text-[var(--tf-text-primary)]">{s.dur}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-[#C8A96E]">
                      <Timer size={12} /> Total {day.totalMenit} Menit Real
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleSyncDay(day.hariKe, day.shortTitle)}
                      disabled={syncingDay === day.hariKe}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--tf-bg-surface)] text-[var(--tf-text-primary)] border border-[var(--tf-border)] hover:border-[#C8A96E] transition-colors cursor-pointer"
                    >
                      <BellRing size={12} className={syncingDay === day.hariKe ? 'animate-spin' : ''} />
                      <span>Aktifkan Alarm Hari {day.hariKe}</span>
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          <Card className="p-5 border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--tf-text-secondary)]">
              Linimasa Resmi Tahapan TKA Nasional 2026
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {TKA_STAGES_2026.map((stg) => (
                <div
                  key={stg.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    stg.status === 'crucial'
                      ? 'border-[#C8A96E]/50 bg-[#C8A96E]/10 font-semibold'
                      : stg.status === 'completed'
                        ? 'border-emerald-500/25 bg-emerald-500/5 opacity-85'
                        : 'border-[var(--tf-border)] bg-[var(--tf-bg-elevated)]/40'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-[var(--tf-text-primary)]">{stg.nama}</div>
                    <div className="text-[11px] text-[var(--tf-text-secondary)] font-mono">{stg.rentangFormatted}</div>
                  </div>
                  <Badge
                    variant={stg.status === 'crucial' ? 'warning' : stg.status === 'completed' ? 'success' : 'neutral'}
                    size="sm"
                  >
                    {stg.status === 'crucial' ? 'Utama' : stg.status === 'completed' ? 'Selesai' : 'Terjadwal'}
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
