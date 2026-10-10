import { useEffect, useMemo, useRef, useState } from 'react';
import { 
  Brain, CheckCircle2, Pause, Play, RotateCcw, Target, TimerReset,
  Coffee, Sparkles, Volume2, VolumeX, Sliders, Trophy, Flame
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../context/AuthContext';
import { loadFocusStats, saveFocusSession, type FocusStats } from '../services/focusService';
import { showSystemNotification, playNotificationSound } from '../services/systemNotificationService';
import { trackEvent } from '../lib/analytics';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

type TimerMode = 'focus' | 'short_break' | 'long_break';
type AmbientSound = 'none' | 'rain' | 'whitenoise' | 'binaural';

const PRESETS = [25, 50, 90] as const;

export default function Focus() {
  const { user } = useAuth();
  const { tasks } = useTasks();

  const [mode, setMode] = useState<TimerMode>('focus');
  const [minutes, setMinutes] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [selectedTask, setSelectedTask] = useState('');
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [sessions, setSessions] = useState(0);
  const [focusMinutes, setFocusMinutes] = useState(0);

  // Ambient Sound Generator via Web Audio API
  const [ambient, setAmbient] = useState<AmbientSound>('none');
  const [ambientVol, setAmbientVol] = useState(0.4);
  const ambientCtxRef = useRef<AudioContext | null>(null);
  const ambientSourceRef = useRef<AudioNode | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setSessions(0);
      setFocusMinutes(0);
      return;
    }

    let active = true;
    const load = async (): Promise<void> => {
      try {
        const stats: FocusStats = await loadFocusStats(user.id);
        if (!active) return;
        setSessions(stats.sessions);
        setFocusMinutes(stats.totalMinutes);
      } catch (error) {
        console.error('Focus statistics load failed:', error);
      }
    };

    void load();
    return () => { active = false; };
  }, [user?.id]);

  // Ambient sound management
  useEffect(() => {
    // Stop previous sound
    if (ambientSourceRef.current) {
      try {
        (ambientSourceRef.current as AudioBufferSourceNode).stop();
      } catch {}
      ambientSourceRef.current.disconnect();
      ambientSourceRef.current = null;
    }

    if (ambient === 'none' || !running) {
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!ambientCtxRef.current) {
        ambientCtxRef.current = new AudioCtx();
      }
      const ctx = ambientCtxRef.current;
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(ambientVol, ctx.currentTime);
      gain.connect(ctx.destination);
      ambientGainRef.current = gain;

      if (ambient === 'rain' || ambient === 'whitenoise') {
        // Generate continuous filtered noise
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (ambient === 'rain') {
            // Pink noise filter approximation for rain
            b0 = 0.99765 * b0 + white * 0.0990460;
            b1 = 0.96300 * b1 + white * 0.2965164;
            b2 = 0.57000 * b2 + white * 1.0526913;
            output[i] = (b0 + b1 + b2) * 0.08;
          } else {
            // White noise
            output[i] = white * 0.05;
          }
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = buffer;
        whiteNoise.loop = true;
        whiteNoise.connect(gain);
        whiteNoise.start();
        ambientSourceRef.current = whiteNoise;
      } else if (ambient === 'binaural') {
        // Alpha wave (200Hz carrier + 210Hz beat = 10Hz alpha)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.frequency.value = 200;
        osc2.frequency.value = 210;

        const subGain = ctx.createGain();
        subGain.gain.value = 0.15;
        osc1.connect(subGain);
        osc2.connect(subGain);
        subGain.connect(gain);

        osc1.start();
        osc2.start();
        ambientSourceRef.current = subGain;
      }
    } catch (e) {
      console.warn('Ambient sound synthesis error:', e);
    }

    return () => {
      if (ambientSourceRef.current) {
        try {
          (ambientSourceRef.current as AudioBufferSourceNode).stop();
        } catch {}
      }
    };
  }, [ambient, running, ambientVol]);

  // Volume slider sync
  useEffect(() => {
    if (ambientGainRef.current && ambientCtxRef.current) {
      ambientGainRef.current.gain.setValueAtTime(ambientVol, ambientCtxRef.current.currentTime);
    }
  }, [ambientVol]);

  // Countdown timer
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setRemaining((val) => Math.max(0, val - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  // Timer Finished
  useEffect(() => {
    if (!running || remaining !== 0) return;

    setRunning(false);
    playNotificationSound('success');

    if (mode === 'focus') {
      confetti({ particleCount: 180, spread: 80, origin: { y: 0.6 } });

      // Send Rich Completion Notification
      const taskObj = tasks.find(t => t.id === selectedTask);
      const taskLabel = taskObj ? `fokus mengerjakan "${taskObj.title}"` : 'sesi belajar bebas';

      void showSystemNotification(
        `🎉 Sesi Fokus Selesai! (${minutes} Menit)`,
        `Hebat! Kamu telah menuntaskan ${taskLabel}. Luangkan 5 menit untuk istirahat mata dan stretching sejenak.`,
        '/focus',
        { channelId: 'fazet_default_channel', soundType: 'success' }
      );

      if (user?.id) {
        const userId = user.id;
        const endedAt = new Date().toISOString();
        const effectiveStartedAt = startedAt ?? new Date(Date.now() - minutes * 60_000).toISOString();

        void saveFocusSession(userId, {
          taskId: selectedTask || null,
          minutes,
          startedAt: effectiveStartedAt,
          endedAt,
        }).then(() => {
          setSessions((val) => val + 1);
          setFocusMinutes((val) => val + minutes);
        });

        void trackEvent('focus_session_completed', {
          minutes,
          taskId: selectedTask || undefined,
        });
      }
    } else {
      // Break Finished
      void showSystemNotification(
        `⏰ Waktu Istirahat Berakhir!`,
        `Waktu istirahat selesai. Segarkan kembali pikiranmu dan mari mulai sesi fokus berikutnya!`,
        '/focus',
        { channelId: 'fazet_default_channel', soundType: 'reminder' }
      );
    }
  }, [remaining, running, mode, minutes, selectedTask, startedAt, user?.id, tasks]);

  const totalSeconds = minutes * 60;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0;

  const formatted = useMemo(() => {
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [remaining]);

  const activeTasks = tasks.filter((task) => task.status !== 'completed' && task.status !== 'submitted');

  const toggle = (): void => {
    setRunning((val) => !val);
    if (!running) {
      setStartedAt(new Date().toISOString());
      void trackEvent('focus_session_started', {
        minutes,
        taskId: selectedTask || undefined,
      });
    }
  };

  const reset = (): void => {
    setRunning(false);
    setRemaining(minutes * 60);
    setStartedAt(null);
  };

  const changeMode = (newMode: TimerMode) => {
    setRunning(false);
    setMode(newMode);
    const defaultMins = newMode === 'focus' ? 25 : newMode === 'short_break' ? 5 : 15;
    setMinutes(defaultMins);
    setRemaining(defaultMins * 60);
    setStartedAt(null);
  };

  const changePreset = (val: number): void => {
    setRunning(false);
    setMinutes(val);
    setRemaining(val * 60);
    setStartedAt(null);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 fade-up pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--tf-border)] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Brain size={20} />
            </span>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Focus & Pomodoro</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Tingkatkan konsentrasi belajar dengan teknik Pomodoro, ambient soundscapes, dan pengingat audio
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            onClick={() => changeMode('focus')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'focus' 
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Brain size={14} /> Fokus Belajar
          </button>
          <button
            onClick={() => changeMode('short_break')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'short_break' 
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Coffee size={14} /> Rehat 5m
          </button>
          <button
            onClick={() => changeMode('long_break')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'long_break' 
                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles size={14} /> Rehat 15m
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Main Timer Display */}
        <Card className="p-8 text-center border-slate-200 dark:border-slate-800 relative overflow-hidden bg-white dark:bg-[#0f1219]">
          <div className="relative mx-auto flex flex-col items-center justify-center">
            {/* Animated Circular Ring */}
            <div className="relative w-64 h-64 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className={`transition-all duration-1000 ${
                    mode === 'focus' 
                      ? 'stroke-indigo-600 dark:stroke-indigo-400' 
                      : mode === 'short_break' 
                        ? 'stroke-emerald-500 dark:stroke-emerald-400' 
                        : 'stroke-purple-500 dark:stroke-purple-400'
                  }`}
                  strokeWidth="6"
                  strokeDasharray="276.46"
                  strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute flex flex-col items-center">
                <span className="text-6xl font-black tracking-tight text-slate-950 dark:text-white tabular-nums">
                  {formatted}
                </span>
                <span className={`text-[11px] font-black uppercase tracking-[.25em] mt-2 ${
                  running 
                    ? 'text-indigo-600 dark:text-indigo-400 animate-pulse' 
                    : 'text-slate-400'
                }`}>
                  {running ? (mode === 'focus' ? 'Sedang Fokus 🔥' : 'Rehat Sejenak ☕') : 'Siap Mulai'}
                </span>
              </div>
            </div>
          </div>

          {/* Duration Presets */}
          {mode === 'focus' && (
            <div className="mx-auto mt-6 flex max-w-md justify-center gap-2">
              {PRESETS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => changePreset(value)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    minutes === value 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 scale-105' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {value} menit
                </button>
              ))}
            </div>
          )}

          {/* Focus Task Picker */}
          {mode === 'focus' && (
            <div className="mx-auto mt-5 max-w-md text-left">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Tautkan Tugas yang Dikerjakan
              </label>
              <select
                className="input bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs font-bold"
                value={selectedTask}
                onChange={(event) => setSelectedTask(event.target.value)}
              >
                <option value="">Belajar Bebas / Tugas Umum</option>
                {activeTasks.slice(0, 50).map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.subjectName ? `[${task.subjectName}] ` : ''}{task.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Timer Controls */}
          <div className="mt-7 flex justify-center gap-3">
            <Button
              size="lg"
              onClick={toggle}
              className={running ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25'}
              icon={running ? <Pause size={18} /> : <Play size={18} />}
            >
              {running ? 'Jeda Timer' : 'Mulai Fokus Sekarang'}
            </Button>
            <Button variant="outline" size="lg" onClick={reset} icon={<RotateCcw size={18} />}>
              Reset
            </Button>
          </div>
        </Card>

        {/* Sidebar Controls: Ambient Sounds & Stats */}
        <div className="space-y-5">
          {/* Ambient Soundscapes Card */}
          <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1219]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Volume2 size={18} className="text-indigo-600 dark:text-indigo-400" />
                <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">Soundscape Belajar</h2>
              </div>
              <Badge variant="primary" size="sm">Sintesis Audio</Badge>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
              Putar suara latar peredam kebisingan saat timer berjalan:
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAmbient('none')}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-colors ${
                  ambient === 'none' 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300' 
                    : 'border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                Tanpa Suara
              </button>
              <button
                onClick={() => setAmbient('rain')}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-colors ${
                  ambient === 'rain' 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300' 
                    : 'border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                🌧️ Suara Hujan
              </button>
              <button
                onClick={() => setAmbient('whitenoise')}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-colors ${
                  ambient === 'whitenoise' 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300' 
                    : 'border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                💨 White Noise
              </button>
              <button
                onClick={() => setAmbient('binaural')}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-colors ${
                  ambient === 'binaural' 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300' 
                    : 'border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                🧠 Gelombang Alfa
              </button>
            </div>

            {ambient !== 'none' && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
                  <span>Volume Suara Latar</span>
                  <span>{Math.round(ambientVol * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientVol}
                  onChange={(e) => setAmbientVol(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            )}
          </Card>

          {/* Stats Card */}
          <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1219]">
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={18} className="text-amber-500" />
              <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">Pencapaian Fokus</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 p-3.5 border border-indigo-100 dark:border-indigo-900/40">
                <div className="text-2xl font-black text-indigo-900 dark:text-indigo-300">{sessions}</div>
                <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Sesi Selesai</div>
              </div>
              <div className="rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5 border border-emerald-100 dark:border-emerald-900/40">
                <div className="text-2xl font-black text-emerald-900 dark:text-emerald-300">{focusMinutes}</div>
                <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Menit Total</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
