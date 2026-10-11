import { useState, useEffect } from 'react';
import Card from '../ui/Card';
import { GlassWater, Plus, RotateCcw, Sparkles, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'fazet_water_intake_today';

interface WaterState {
  date: string;
  count: number;
}

export default function WaterIntakeTracker() {
  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());

  const [waterData, setWaterData] = useState<WaterState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: WaterState = JSON.parse(stored);
        if (parsed.date === todayStr) return parsed;
      }
    } catch {}
    return { date: todayStr, count: 0 };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(waterData));
    } catch (e) {
      console.error('Failed to save water data', e);
    }
  }, [waterData]);

  const addGlass = () => {
    const nextCount = Math.min(12, waterData.count + 1);
    setWaterData({ date: todayStr, count: nextCount });
    if (nextCount === 8) {
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch {}
    }
  };

  const resetGlass = () => {
    if (window.confirm('Reset hitungan air minum hari ini?')) {
      setWaterData({ date: todayStr, count: 0 });
    }
  };

  const TARGET = 8;
  const ml = waterData.count * 250;
  const targetMl = TARGET * 250;
  const isGoalReached = waterData.count >= TARGET;

  return (
    <Card className="p-5 border-2 border-cyan-200/90 dark:border-cyan-900/40 bg-gradient-to-br from-cyan-50/50 via-white to-blue-50/40 dark:from-[#08121d] dark:via-[#091522] dark:to-[#07192a] shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-cyan-100 dark:bg-cyan-950/70 rounded-xl text-cyan-600 dark:text-cyan-300">
            <GlassWater size={20} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              Target Air Minum Pasangan
              <Heart size={14} className="text-cyan-500 fill-cyan-500" />
            </h3>
            <p className="text-[11px] text-[var(--tf-text-muted)]">
              Jaga ginjal & stamina dengan 8 gelas air putih per hari
            </p>
          </div>
        </div>

        <button
          onClick={resetGlass}
          title="Reset Hari Ini"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      <div className="flex items-end justify-between mb-2">
        <div>
          <span className="text-3xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
            {waterData.count}
          </span>
          <span className="text-xs text-slate-400 font-bold ml-1">/ {TARGET} Gelas ({ml} ml)</span>
        </div>
        <button
          onClick={addGlass}
          className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
        >
          <Plus size={14} /> Minum 1 Gelas
        </button>
      </div>

      {/* Glass Icons Visualization */}
      <div className="grid grid-cols-8 gap-1.5 mb-3">
        {Array.from({ length: TARGET }).map((_, idx) => {
          const filled = idx < waterData.count;
          return (
            <div
              key={idx}
              className={`h-8 rounded-lg flex items-center justify-center transition-all ${
                filled
                  ? 'bg-cyan-500 text-white shadow-xs scale-102'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-300'
              }`}
            >
              <GlassWater size={14} />
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-[var(--tf-text-muted)] italic">
        {isGoalReached
          ? '🎉 Luar biasa! Target hidrasi hari ini terpenuhi sayang, sehat terus yaa cintaku!'
          : `Sayangku, kurang ${TARGET - waterData.count} gelas lagi (${targetMl - ml} ml). Jangan lupa minum ya manis! 💧`}
      </p>
    </Card>
  );
}
