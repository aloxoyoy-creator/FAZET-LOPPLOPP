import React, { useState, useEffect } from 'react';
import { Clock, MapPin } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PrayerTime {
  Imsak: string;
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

interface CityData {
  kota: string;
  tanggal: string;
  waktu: PrayerTime;
  nextPrayerName: string;
  countdown: string;
}

const kotaList = ['Tuban', 'Tasikmalaya', 'Ciamis'];
const PRAYERS = [
  { id: 'Imsak', name: 'Imsak' },
  { id: 'Fajr', name: 'Subuh' },
  { id: 'Dhuhr', name: 'Dzuhur' },
  { id: 'Asr', name: 'Ashar' },
  { id: 'Maghrib', name: 'Maghrib' },
  { id: 'Isha', name: 'Isya' }
];

export default function JadwalSholat() {
  const [data, setData] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJadwal = async () => {
      const dataBanyakKota: CityData[] = [];
      for (const kota of kotaList) {
        try {
          const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${kota}&country=Indonesia&method=11`);
          const result = await response.json();
          const cleanTimings: Record<string, string> = {};
          for (const key in result.data.timings) {
             cleanTimings[key] = result.data.timings[key].split(' ')[0];
          }
          dataBanyakKota.push({
            kota: kota,
            tanggal: result.data.date.readable,
            waktu: cleanTimings as any,
            nextPrayerName: '',
            countdown: ''
          });
        } catch (error) {
          console.error(`Error fetching data for ${kota}`, error);
        }
      }
      setData(dataBanyakKota);
      setLoading(false);
    };

    void fetchJadwal();
  }, []);

  useEffect(() => {
    if (data.length === 0) return;

    const interval = setInterval(() => {
      const now = new Date();
      
      setData(prevData => prevData.map(city => {
        let nextPrayer = null;
        let minDiff = Infinity;
        
        for (const prayer of PRAYERS) {
          const timeStr = city.waktu[prayer.id];
          if (!timeStr) continue;
          
          const [hours, minutes] = timeStr.split(':').map(Number);
          const prayerTime = new Date();
          prayerTime.setHours(hours, minutes, 0, 0);
          
          const diff = prayerTime.getTime() - now.getTime();
          if (diff > 0 && diff < minDiff) {
            minDiff = diff;
            nextPrayer = prayer.name;
          }
        }
        
        let countdownStr = '--:--:--';
        let nextName = nextPrayer || 'Besok (Imsak)';
        
        if (nextPrayer && minDiff !== Infinity) {
          const h = Math.floor((minDiff / (1000 * 60 * 60)) % 24);
          const m = Math.floor((minDiff / 1000 / 60) % 60);
          const s = Math.floor((minDiff / 1000) % 60);
          countdownStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        } else {
            const timeStr = city.waktu['Imsak'];
            if (timeStr) {
              const [hours, minutes] = timeStr.split(':').map(Number);
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              tomorrow.setHours(hours, minutes, 0, 0);
              const diff = tomorrow.getTime() - now.getTime();
              const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
              const m = Math.floor((diff / 1000 / 60) % 60);
              const s = Math.floor((diff / 1000) % 60);
              countdownStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            }
        }

        return { ...city, nextPrayerName: nextName, countdown: countdownStr };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [data.length]);

  if (loading) return (
    <div className="grid gap-4 md:grid-cols-3">
       <div className="h-64 w-full bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
       <div className="h-64 w-full bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
       <div className="h-64 w-full bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
    </div>
  );

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {data.map((item, index) => (
        <div key={index} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111b21] transition-all hover:shadow-md">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h2 className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100"><MapPin size={18} className="text-indigo-500"/> {item.kota}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{item.tanggal}</p>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{item.nextPrayerName}</div>
              <div className="flex items-center gap-1 font-mono text-lg font-bold text-indigo-600 dark:text-indigo-400">
                <Clock size={16} /> {item.countdown}
              </div>
            </div>
          </div>
          
          <div className="space-y-1.5 text-sm">
            {PRAYERS.map(p => {
               const isActive = item.nextPrayerName === p.name || (item.nextPrayerName === 'Besok (Imsak)' && p.name === 'Imsak');
               return (
                 <div key={p.id} className={cn("flex justify-between rounded-lg p-2 transition-colors", isActive ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50")}>
                   <span>{p.name}</span>
                   <strong className="font-mono">{item.waktu[p.id]}</strong>
                 </div>
               )
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
