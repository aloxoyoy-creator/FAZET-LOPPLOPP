import React, { useEffect, useState } from 'react';
import { fetchJadwalKota } from '../../utils/jadwalSholat';
import { Clock, MapPin, Sparkles } from 'lucide-react';

const CITIES = ['Ciamis', 'Tasikmalaya', 'Tuban'];

function parseTime(timeStr: string) {
  if (!timeStr || timeStr === '-') return new Date(0);
  const [h, m] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date;
}

function formatDuration(diffMs: number) {
  if (diffMs <= 0) return 'Sekarang';
  const h = Math.floor(diffMs / (1000 * 60 * 60));
  const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diffMs % (1000 * 60)) / 1000);
  
  if (h > 0) return `${h}j ${m}m ${s}d`;
  return `${m}m ${s}d`;
}

type NextPrayer = { name: string; time: Date; remainingMs: number };

export default function JadwalSholatCards() {
  const [jadwal, setJadwal] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    async function loadData() {
      try {
        const results = await Promise.all(CITIES.map(city => fetchJadwalKota(city)));
        setJadwal(results);
      } catch (error) {
        console.error("Error memuat jadwal sholat:", error);
      } finally {
        setIsLoading(false);
      }
    }
    void loadData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getNextPrayer = (j: any): NextPrayer | null => {
    if (!j || j.sumber === 'Error') return null;
    const times = [
      { name: 'Imsak', time: parseTime(j.imsak) },
      { name: 'Subuh', time: parseTime(j.subuh) },
      { name: 'Dzuhur', time: parseTime(j.dzuhur) },
      { name: 'Ashar', time: parseTime(j.ashar) },
      { name: 'Maghrib', time: parseTime(j.maghrib) },
      { name: 'Isya', time: parseTime(j.isya) }
    ];

    let next = null;
    for (const t of times) {
      if (t.time > now) {
        next = t;
        break;
      }
    }

    if (!next) {
      const tomorrowImsak = parseTime(j.imsak);
      tomorrowImsak.setDate(tomorrowImsak.getDate() + 1);
      next = { name: 'Imsak', time: tomorrowImsak };
    }

    return { ...next, remainingMs: next.time.getTime() - now.getTime() };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40 text-slate-500 font-medium animate-pulse">
        <Sparkles className="w-5 h-5 mr-2 animate-spin" /> Menyiapkan jadwal sholat...
      </div>
    );
  }

  return (
    <div className="w-full my-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {jadwal.map((data, idx) => {
          const next = getNextPrayer(data);
          
          if (data.error || data.sumber === 'Error') {
            return (
              <div key={idx} className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-100 dark:border-red-900/50 flex items-center justify-center text-red-500">
                Gagal memuat jadwal untuk {data.kota}
              </div>
            );
          }

          return (
            <div key={idx} className="bg-white dark:bg-[#0f1219] rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              {/* Decorative gradient blob */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-400/10 blur-3xl rounded-full pointer-events-none group-hover:bg-emerald-400/20 transition-all duration-500"></div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-xl text-emerald-600 dark:text-emerald-400">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{data.kota}</h3>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mt-0.5">{data.sumber}</p>
                  </div>
                </div>
              </div>

              {/* Countdown Banner per City */}
              {next && (
                <div className="mb-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center text-center">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
                    Menuju {next.name}
                  </div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                    {formatDuration(next.remainingMs)}
                  </div>
                </div>
              )}

              {/* Grid Waktu */}
              <div className="grid grid-cols-3 gap-3 relative z-10">
                {[
                  { label: 'Subuh', time: data.subuh },
                  { label: 'Dzuhur', time: data.dzuhur },
                  { label: 'Ashar', time: data.ashar },
                  { label: 'Maghrib', time: data.maghrib },
                  { label: 'Isya', time: data.isya },
                  { label: 'Imsak', time: data.imsak }
                ].map((sholat) => {
                  const isNext = next?.name === sholat.label;
                  return (
                    <div 
                      key={sholat.label} 
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${
                        isNext 
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-105 transform' 
                          : 'bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${isNext ? 'text-emerald-50' : 'text-slate-400 dark:text-slate-500'}`}>
                        {sholat.label}
                      </span>
                      <span className="font-black text-sm">{sholat.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
