import React, { useState, useEffect } from 'react';
import { Calendar, GraduationCap, Flame, Target, BookOpen, BrainCircuit, TrendingUp, ChevronRight } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

export default function TKADashboard() {
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);
  
  useEffect(() => {
    const targetDate = new Date(2026, 9, 26, 0, 0, 0).getTime();
    const interval = setInterval(() => {
      const distance = targetDate - new Date().getTime();
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

  const subjects = [
    { name: 'Penalaran Umum (PU)', progress: 75, color: 'bg-blue-500' },
    { name: 'Pengetahuan Kuantitatif', progress: 45, color: 'bg-rose-500' },
    { name: 'Matematika TKA', progress: 60, color: 'bg-emerald-500' },
    { name: 'Literasi Bahasa', progress: 85, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-4 mb-8">
      {/* 1. HERO COUNTDOWN */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-purple-600/20 to-rose-500/10 mix-blend-screen pointer-events-none" />
        <div className="absolute -top-[50%] -left-[10%] w-[50%] h-[150%] bg-blue-500/20 blur-[120px] pointer-events-none rounded-full" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-6 sm:p-8 gap-8">
          <div className="flex-1 text-center md:text-left">
            <Badge variant="warning" className="mb-4 inline-flex shadow-[0_0_15px_rgba(251,146,60,0.4)]">
              <Flame size={14} className="mr-1" /> Ujian TKA & SNBT
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70 mb-2">
              Tes Kemampuan Akademik
            </h2>
            <p className="text-slate-400 font-medium flex items-center justify-center md:justify-start gap-2">
              <Calendar size={16} /> 26 Oktober 2026
            </p>
          </div>

          <div className="flex gap-3 sm:gap-4 font-mono w-full md:w-auto justify-center">
            {timeLeft ? (
              ['Hari', 'Jam', 'Menit', 'Detik'].map((label, i) => (
                <div key={label} className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl p-3 min-w-[70px] sm:min-w-[80px] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                  <div className="text-3xl sm:text-4xl font-black text-white mb-1">
                    {i === 0 ? timeLeft.days : i === 1 ? timeLeft.hours.toString().padStart(2,'0') : i === 2 ? timeLeft.minutes.toString().padStart(2,'0') : timeLeft.seconds.toString().padStart(2,'0')}
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest">{label}</div>
                </div>
              ))
            ) : (
              <div className="px-6 py-4 bg-emerald-500 rounded-2xl text-white font-bold animate-pulse">Sedang Berlangsung!</div>
            )}
          </div>
        </div>
      </div>

      {/* 2. STATISTIK & MATERI */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5 border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2 text-slate-800">
              <Target className="text-rose-500" size={20} /> Progres Penguasaan Materi
            </h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">Target: 750</span>
          </div>
          <div className="space-y-4">
            {subjects.map((sub, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700">{sub.name}</span>
                  <span className="text-slate-500">{sub.progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${sub.color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${sub.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
          <button className="mt-5 w-full bg-slate-50 hover:bg-slate-100 text-blue-600 font-bold text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1">
            Lihat Semua Materi <ChevronRight size={16} />
          </button>
        </Card>

        <Card className="p-5 border-slate-200 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50/50">
          <h3 className="font-bold flex items-center gap-2 text-slate-800 mb-4">
            <TrendingUp className="text-blue-600" size={20} /> Hasil TryOut Terakhir
          </h3>
          <div className="flex items-end gap-4 mb-6">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Skor Rata-Rata</div>
              <div className="text-4xl font-black text-slate-900 tracking-tight">640<span className="text-lg text-slate-400">/1000</span></div>
            </div>
            <Badge variant="success" className="mb-2">Naik +25 Poin</Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <div className="text-xs text-slate-500 font-bold mb-1">Tertinggi</div>
              <div className="text-sm font-black text-emerald-600">Literasi (710)</div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <div className="text-xs text-slate-500 font-bold mb-1">Terendah</div>
              <div className="text-sm font-black text-rose-600">Kuantitatif (510)</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-colors flex justify-center items-center gap-2 text-sm shadow-lg shadow-blue-600/20">
              <BrainCircuit size={16} /> Mulai Latihan
            </button>
            <button className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition-colors flex justify-center items-center gap-2 text-sm">
              <BookOpen size={16} /> Bank Soal
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
