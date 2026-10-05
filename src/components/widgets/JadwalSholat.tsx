import React, { useEffect, useState } from 'react';
import { fetchJadwalKota } from '../../utils/jadwalSholat';
import { Clock } from 'lucide-react';

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
  
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function JadwalSholatTable() {
  const [jadwal, setJadwal] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextPrayer, setNextPrayer] = useState<{ name: string, time: Date } | null>(null);
  const [countdown, setCountdown] = useState<string>('--:--:--');

  useEffect(() => {
    async function loadData() {
      try {
        const results = await Promise.all(CITIES.map(city => fetchJadwalKota(city)));
        setJadwal(results);
      } catch (error) {
        console.error("Terjadi kesalahan saat memuat data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    void loadData();
  }, []);

  useEffect(() => {
    if (jadwal.length === 0 || isLoading) return;

    // Gunakan kota pertama sebagai patokan (Ciamis)
    const refJadwal = jadwal[0];
    if (!refJadwal || refJadwal.sumber === 'Error') return;

    const calculateNext = () => {
      const now = new Date();
      const times = [
        { name: 'Imsak', time: parseTime(refJadwal.imsak) },
        { name: 'Subuh', time: parseTime(refJadwal.subuh) },
        { name: 'Dzuhur', time: parseTime(refJadwal.dzuhur) },
        { name: 'Ashar', time: parseTime(refJadwal.ashar) },
        { name: 'Maghrib', time: parseTime(refJadwal.maghrib) },
        { name: 'Isya', time: parseTime(refJadwal.isya) }
      ];

      let next = null;
      for (const t of times) {
        if (t.time > now) {
          next = t;
          break;
        }
      }

      // Jika semua sudah lewat, berarti Imsak besok
      if (!next) {
        const tomorrowImsak = parseTime(refJadwal.imsak);
        tomorrowImsak.setDate(tomorrowImsak.getDate() + 1);
        next = { name: 'Imsak', time: tomorrowImsak };
      }

      setNextPrayer(next);
      setCountdown(formatDuration(next.time.getTime() - now.getTime()));
    };

    calculateNext();
    const interval = setInterval(calculateNext, 1000);
    return () => clearInterval(interval);
  }, [jadwal, isLoading]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32 text-slate-500 font-medium animate-pulse">
        Memuat jadwal sholat...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-6 p-5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
      <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100 mb-2">Jadwal Sholat Hari Ini</h2>
      
      {/* Penghitung Waktu Mundur */}
      {nextPrayer && (
        <div className="flex flex-col items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 p-4 rounded-xl mb-6 border border-emerald-100 dark:border-emerald-800/50">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} />
            <span className="text-sm font-semibold uppercase tracking-wider">Menuju Waktu {nextPrayer.name}</span>
          </div>
          <div className="text-3xl font-black font-mono tracking-tight">{countdown}</div>
          <div className="text-xs opacity-70 mt-1">Berdasarkan waktu {jadwal[0]?.kota}</div>
        </div>
      )}
      
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="text-xs text-white uppercase bg-emerald-600">
            <tr>
              <th className="px-6 py-3">Kota</th>
              <th className="px-4 py-3">Imsak</th>
              <th className="px-4 py-3">Subuh</th>
              <th className="px-4 py-3">Dzuhur</th>
              <th className="px-4 py-3">Ashar</th>
              <th className="px-4 py-3">Maghrib</th>
              <th className="px-4 py-3">Isya</th>
              <th className="px-6 py-3 text-center">Status API</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {jadwal.map((data, index) => (
              <tr key={index} className="hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors bg-white dark:bg-slate-900">
                <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">{data.kota}</td>
                <td className="px-4 py-4 text-slate-700 dark:text-slate-300">{data.imsak}</td>
                <td className="px-4 py-4 text-slate-700 dark:text-slate-300">{data.subuh}</td>
                <td className="px-4 py-4 text-slate-700 dark:text-slate-300">{data.dzuhur}</td>
                <td className="px-4 py-4 text-slate-700 dark:text-slate-300">{data.ashar}</td>
                <td className="px-4 py-4 font-bold text-emerald-700 dark:text-emerald-400">{data.maghrib}</td>
                <td className="px-4 py-4 text-slate-700 dark:text-slate-300">{data.isya}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2.5 py-1 text-[0.7rem] uppercase tracking-wider font-bold rounded-full ${
                    data.sumber === 'Adhan (Offline)'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' 
                      : data.sumber === 'MyQuran' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' 
                      : data.sumber === 'Aladhan'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {data.sumber}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
