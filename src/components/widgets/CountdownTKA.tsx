import React, { useState, useEffect } from 'react';
import { Calendar, GraduationCap, Flame } from 'lucide-react';

export default function CountdownTKA() {
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);
  
  useEffect(() => {
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
    <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-xl mb-8 group">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-indigo-500/20 to-purple-600/20 pointer-events-none mix-blend-screen" />
      <div className="absolute -top-[50%] -left-[10%] w-[50%] h-[150%] bg-blue-500/30 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-[50%] -right-[10%] w-[50%] h-[150%] bg-purple-500/30 blur-[100px] pointer-events-none rounded-full" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-6 sm:p-8 gap-6">
        
        {/* Left Section */}
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/80 text-[10px] font-bold uppercase tracking-widest mb-4">
            <Flame size={12} className="text-orange-400" /> Event Penting
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 mb-2">
            Tes Kemampuan Akademik
          </h2>
          <p className="text-slate-400 text-sm font-medium flex items-center justify-center md:justify-start gap-2">
            <Calendar size={16} /> 26 Oktober 2026
          </p>
        </div>

        {/* Right Section / Countdown Grid */}
        <div className="flex gap-3 sm:gap-4 font-mono w-full md:w-auto justify-center">
          {timeLeft ? (
            <>
              {[
                { label: 'Hari', value: timeLeft.days },
                { label: 'Jam', value: timeLeft.hours.toString().padStart(2, '0') },
                { label: 'Menit', value: timeLeft.minutes.toString().padStart(2, '0') },
                { label: 'Detik', value: timeLeft.seconds.toString().padStart(2, '0') },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center bg-white/5 backdrop-blur-md rounded-2xl p-3 min-w-[70px] sm:min-w-[80px] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition-transform hover:-translate-y-1">
                  <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-1">{item.value}</div>
                  <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">{item.label}</div>
                </div>
              ))}
            </>
          ) : (
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white font-bold text-lg shadow-lg border border-white/20 animate-pulse">
              Sedang Berlangsung / Selesai!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
