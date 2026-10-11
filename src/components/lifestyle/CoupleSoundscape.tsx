import { useState, useEffect } from 'react';
import Card from '../ui/Card';
import { Headphones, Play, Square, Volume2, Clock, Sparkles } from 'lucide-react';
import { soundSynthesizer, type AmbienceType } from '../../utils/audioSynthesizer';

const SOUNDS: Array<{ type: AmbienceType; name: string; emoji: string; desc: string }> = [
  { type: 'rain', name: 'Hujan Romantis', emoji: '🌧️', desc: 'Deru hujan rintik-rintik yang menenangkan dan syahdu.' },
  { type: 'fire', name: 'Api Unggun Hangat', emoji: '🪵', desc: 'Kretek api unggun yang hangat menemani malam belajar berdua.' },
  { type: 'cafe', name: 'Kafe Belajar Santai', emoji: '☕', desc: 'Suasana kedai kopi favorit untuk fokus ngerjain tugas.' },
  { type: 'binaural', name: 'Gelombang Fokus Theta', emoji: '🎧', desc: 'Frekuensi binaural 6Hz untuk ketenangan batin & fokus tajam.' },
];

export default function CoupleSoundscape() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeType, setActiveType] = useState<AmbienceType>('rain');
  const [volume, setVolume] = useState(0.4);
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    return () => {
      soundSynthesizer.stop();
    };
  }, []);

  const handleTogglePlay = (type: AmbienceType) => {
    if (isPlaying && activeType === type) {
      soundSynthesizer.stop();
      setIsPlaying(false);
      setRemainingSeconds(0);
    } else {
      setActiveType(type);
      soundSynthesizer.play(type, volume);
      setIsPlaying(true);
      if (timerMinutes > 0) {
        soundSynthesizer.setTimer(timerMinutes, (sec) => setRemainingSeconds(sec));
      }
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    soundSynthesizer.setVolume(newVol);
  };

  const handleSetTimer = (mins: number) => {
    setTimerMinutes(mins);
    if (isPlaying) {
      soundSynthesizer.setTimer(mins, (sec) => setRemainingSeconds(sec));
    }
  };

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <Card className="p-6 border-2 border-indigo-200/90 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40 dark:from-[#0a0f1d] dark:via-[#0c1326] dark:to-[#160f26] shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-950/60 rounded-2xl text-indigo-600 dark:text-indigo-300">
            <Headphones size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              Suasana Belajar Berdua (Couple Soundscape)
              <Sparkles size={16} className="text-indigo-500" />
            </h2>
            <p className="text-xs text-[var(--tf-text-muted)] mt-0.5">
              Generator audio sintetis alami offline untuk menemani sesi belajar & relaksasi Fathur & Mazet
            </p>
          </div>
        </div>

        {isPlaying && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Sedang Memutar: {SOUNDS.find(s => s.type === activeType)?.name}
            {remainingSeconds > 0 && ` (${formatTime(remainingSeconds)})`}
          </div>
        )}
      </div>

      {/* Sound Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {SOUNDS.map(s => {
          const isCurrentActive = isPlaying && activeType === s.type;
          return (
            <button
              key={s.type}
              type="button"
              onClick={() => handleTogglePlay(s.type)}
              className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isCurrentActive
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 shadow-md ring-2 ring-indigo-400/30'
                  : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-indigo-200'
              }`}
            >
              <div>
                <div className="text-3xl mb-2">{s.emoji}</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  {s.name}
                </div>
                <p className="text-[11px] text-[var(--tf-text-muted)] leading-relaxed">
                  {s.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold">
                <span className={isCurrentActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}>
                  {isCurrentActive ? 'Memutar...' : 'Putar Audio'}
                </span>
                <span className={`p-1.5 rounded-lg ${isCurrentActive ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  {isCurrentActive ? <Square size={12} className="fill-current" /> : <Play size={12} className="fill-current" />}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Volume & Timer Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-indigo-100 dark:border-indigo-900/30 grid sm:grid-cols-2 gap-4 items-center">
        {/* Volume */}
        <div className="flex items-center gap-3">
          <Volume2 size={18} className="text-indigo-500 shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              <span>Volume Suara</span>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Auto-Stop Timer */}
        <div className="flex items-center gap-2 justify-start sm:justify-end">
          <Clock size={16} className="text-slate-400 shrink-0" />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 mr-1">Timer Mati:</span>
          {[0, 15, 30, 60].map(mins => (
            <button
              key={mins}
              onClick={() => handleSetTimer(mins)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                timerMinutes === mins
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50'
              }`}
            >
              {mins === 0 ? 'Mati' : `${mins}m`}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
