import React, { useState, useEffect } from 'react';
import { Calendar, GraduationCap } from 'lucide-react';

export default function CountdownTKA() {
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);

  useEffect(() => {
    // 26 Oktober (Current Year) or 2026 based on context
    const targetDate = new Date(2026, 9, 26, 0, 0, 0).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft(null);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-700 p-5 shadow-lg text-white flex flex-col sm:flex-row items-center justify-between mb-8 overflow-hidden relative transition-all hover:shadow-xl dark:border-slate-800">
      <GraduationCap className="absolute -right-4 -bottom-4 text-white/10 pointer-events-none" size={120} />
      
      <div className="relative z-10 w-full sm:w-auto text-center sm:text-left mb-4 sm:mb-0">
        <h3 className="flex items-center justify-center sm:justify-start gap-2 text-xl font-bold mb-1">
          <Calendar size={22} className="text-blue-200" /> Menuju TKA (26 Oktober)
        </h3>
        <p className="text-blue-100 text-sm font-medium">Persiapkan dirimu dengan maksimal!</p>
      </div>

      <div className="relative z-10 flex gap-2 sm:gap-3 text-center font-mono">
        {timeLeft ? (
          <>
            <div className="flex flex-col items-center bg-white/20 rounded-lg p-2 min-w-[60px] sm:min-w-[70px] backdrop-blur-sm border border-white/10 shadow-inner">
              <span className="text-2xl sm:text-3xl font-black tracking-tight">{timeLeft.days}</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-blue-100">Hari</span>
            </div>
            <div className="flex flex-col items-center bg-white/20 rounded-lg p-2 min-w-[60px] sm:min-w-[70px] backdrop-blur-sm border border-white/10 shadow-inner">
              <span className="text-2xl sm:text-3xl font-black tracking-tight">{timeLeft.hours.toString().padStart(2, '0')}</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-blue-100">Jam</span>
            </div>
            <div className="flex flex-col items-center bg-white/20 rounded-lg p-2 min-w-[60px] sm:min-w-[70px] backdrop-blur-sm border border-white/10 shadow-inner">
              <span className="text-2xl sm:text-3xl font-black tracking-tight">{timeLeft.minutes.toString().padStart(2, '0')}</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-blue-100">Menit</span>
            </div>
            <div className="flex flex-col items-center bg-white/20 rounded-lg p-2 min-w-[60px] sm:min-w-[70px] backdrop-blur-sm border border-white/10 shadow-inner">
              <span className="text-2xl sm:text-3xl font-black tracking-tight">{timeLeft.seconds.toString().padStart(2, '0')}</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-blue-100">Detik</span>
            </div>
          </>
        ) : (
          <div className="text-xl font-bold bg-white/20 rounded-lg p-3 backdrop-blur-sm border border-white/10">
            Semangat Ujian TKA!
          </div>
        )}
      </div>
    </div>
  );
}
