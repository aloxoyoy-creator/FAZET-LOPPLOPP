import React, { useState, useEffect } from 'react';
import { MapPin, Sparkles, Navigation, Clock, Sunrise, Sun, Sunset, Moon, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';

const WIDGETS = [
  { id: 'tasikmalaya', name: 'Tasikmalaya', apiId: '1227' },
  { id: 'ciamis', name: 'Kawali, Ciamis', apiId: '1205' },
  { id: 'tuban', name: 'Tuban', apiId: '1628' }
];

type JadwalData = {
  tanggal: string;
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  date: string;
};

export default function JadwalSholat() {
  const [activeTab, setActiveTab] = useState(WIDGETS[0].id);
  const [jadwalToday, setJadwalToday] = useState<JadwalData | null>(null);
  const [jadwalTomorrow, setJadwalTomorrow] = useState<JadwalData | null>(null);
  const [loading, setLoading] = useState(true);

  const [now, setNow] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; diff: number } | null>(null);
  const [currentPrayer, setCurrentPrayer] = useState<string>('');
  const [activeJadwal, setActiveJadwal] = useState<JadwalData | null>(null);
  const [isBesokUI, setIsBesokUI] = useState(false);

  useEffect(() => {
    if (!jadwalToday || !jadwalTomorrow) return;
    
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [isyaH, isyaM] = jadwalToday.isya.split(':').map(Number);
    const isyaMins = isyaH * 60 + isyaM;

    let active = jadwalToday;
    let isBesok = false;
    let next = null;
    let current = '';

    if (currentMinutes >= isyaMins + 30) {
      active = jadwalTomorrow;
      isBesok = true;
    }

    const times = [
      { name: 'Imsak', time: active.imsak },
      { name: 'Subuh', time: active.subuh },
      { name: 'Terbit', time: active.terbit },
      { name: 'Dhuha', time: active.dhuha },
      { name: 'Dzuhur', time: active.dzuhur },
      { name: 'Ashar', time: active.ashar },
      { name: 'Maghrib', time: active.maghrib },
      { name: 'Isya', time: active.isya },
    ];

    if (isBesok) {
      // Countdown ke Imsak esok hari
      const [h, m] = times[0].time.split(':').map(Number);
      next = { name: 'Imsak', time: times[0].time, diff: (24 * 60 - currentMinutes) + (h * 60 + m) };
      current = 'Isya'; 
    } else {
      // Hari ini
      for (let i = 0; i < times.length; i++) {
        const t = times[i];
        const [h, m] = t.time.split(':').map(Number);
        const tMins = h * 60 + m;
        
        if (tMins > currentMinutes) {
          next = { name: t.name, time: t.time, diff: tMins - currentMinutes };
          break;
        } else {
          current = t.name;
        }
      }

      // Jika sudah masuk Isya tapi belum lewat 30 menit
      if (!next && currentMinutes >= isyaMins) {
         current = 'Isya';
         next = null; // Menghilangkan countdown selama 30 menit
      }
    }
    
    setActiveJadwal(active);
    setNextPrayer(next);
    setCurrentPrayer(current);
    setIsBesokUI(isBesok);
  }, [now, jadwalToday, jadwalTomorrow]);

  const formatCountdown = (diff: number) => {
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    const seconds = 59 - now.getSeconds();
    return `${hours > 0 ? `${hours}j ` : ''}${minutes}m ${seconds}d`;
  };

  const activeWidget = WIDGETS.find(w => w.id === activeTab) || WIDGETS[0];

  useEffect(() => {
    async function fetchBothDays() {
      setLoading(true);
      try {
        const today = new Date();
        const tYear = today.getFullYear();
        const tMonth = String(today.getMonth() + 1).padStart(2, '0');
        const tDay = String(today.getDate()).padStart(2, '0');

        const tomorrow = new Date(today.getTime() + 86400000);
        const mYear = tomorrow.getFullYear();
        const mMonth = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const mDay = String(tomorrow.getDate()).padStart(2, '0');
        
        const [resToday, resTomorrow] = await Promise.all([
          fetch(`https://api.myquran.com/v2/sholat/jadwal/${activeWidget.apiId}/${tYear}/${tMonth}/${tDay}`),
          fetch(`https://api.myquran.com/v2/sholat/jadwal/${activeWidget.apiId}/${mYear}/${mMonth}/${mDay}`)
        ]);

        const jsonToday = await resToday.json();
        const jsonTomorrow = await resTomorrow.json();
        
        if (jsonToday.status && jsonToday.data?.jadwal) {
          setJadwalToday(jsonToday.data.jadwal);
        } else {
          setJadwalToday(null);
        }

        if (jsonTomorrow.status && jsonTomorrow.data?.jadwal) {
          setJadwalTomorrow(jsonTomorrow.data.jadwal);
        } else {
          setJadwalTomorrow(null);
        }

      } catch (err) {
        console.error('Failed to fetch jadwal sholat:', err);
        setJadwalToday(null);
        setJadwalTomorrow(null);
      } finally {
        setLoading(false);
      }
    }

    void fetchBothDays();
  }, [activeWidget.apiId]);

  return (
    <div className="w-full my-4">
      <div className="bg-white dark:bg-[#0f1219] rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-amber-400/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-emerald-400/10 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-xl text-amber-600 dark:text-amber-400">
                <Sparkles size={18} />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Jadwal Sholat</h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Data dari API MyQuran Bimas Islam Kemenag RI</p>
          </div>

          {/* Location Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl overflow-x-auto hide-scrollbar">
            {WIDGETS.map((widget) => (
              <button
                key={widget.id}
                onClick={() => setActiveTab(widget.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                  activeTab === widget.id 
                    ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                }`}
              >
                <MapPin size={16} className={activeTab === widget.id ? "animate-bounce" : ""} />
                {widget.name}
              </button>
            ))}
          </div>
        </div>

        {/* Native UI Container */}
        <div className={`relative w-full rounded-2xl border p-6 min-h-[200px] transition-colors duration-500 ${
          isBesokUI 
            ? 'bg-indigo-50/50 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-900/30' 
            : 'bg-slate-50/50 border-slate-100 dark:bg-slate-900/50 dark:border-slate-800'
        }`}>
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Navigation className="w-8 h-8 animate-spin text-amber-400/50" />
              <span className="font-semibold text-sm animate-pulse">Menyiapkan jadwal wilayah {activeWidget.name}...</span>
            </div>
          ) : activeJadwal ? (
            <div className="fade-in">
              <div className="text-center mb-6 space-y-3">
                <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold transition-colors ${
                  isBesokUI 
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300'
                    : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300'
                }`}>
                  {isBesokUI ? <CalendarDays size={14} /> : <Clock size={14} />}
                  {isBesokUI ? `Besok: ${activeJadwal.tanggal}` : activeJadwal.tanggal} — {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                
                {nextPrayer ? (
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Sekarang waktu <span className="text-amber-600 dark:text-amber-400 font-black uppercase tracking-wider">{currentPrayer || 'Belum masuk waktu'}</span>. 
                    <br />
                    <span className="text-amber-600 dark:text-amber-400 font-black text-lg">{formatCountdown(nextPrayer.diff)}</span> menuju {nextPrayer.name}.
                  </div>
                ) : (
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Sekarang waktu <span className="text-amber-600 dark:text-amber-400 font-black uppercase tracking-wider">{currentPrayer}</span>. 
                    <br />
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Selamat menunaikan ibadah sholat Isya.</span>
                  </div>
                )}
              </div>
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-7 gap-3"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 }
                  }
                } as any}
              >
                <TimeCard title="Imsak" time={activeJadwal.imsak} icon={<Moon size={20} />} isActive={currentPrayer === 'Imsak' && !isBesokUI} highlight />
                <TimeCard title="Subuh" time={activeJadwal.subuh} icon={<Sunrise size={20} />} isActive={currentPrayer === 'Subuh' && !isBesokUI} highlight />
                <TimeCard title="Dhuha" time={activeJadwal.dhuha} icon={<Sun size={20} />} isActive={currentPrayer === 'Dhuha' && !isBesokUI} highlight />
                <TimeCard title="Dzuhur" time={activeJadwal.dzuhur} icon={<Sun size={20} />} isActive={currentPrayer === 'Dzuhur' && !isBesokUI} highlight />
                <TimeCard title="Ashar" time={activeJadwal.ashar} icon={<Sun size={20} />} isActive={currentPrayer === 'Ashar' && !isBesokUI} highlight />
                <TimeCard title="Maghrib" time={activeJadwal.maghrib} icon={<Sunset size={20} />} isActive={currentPrayer === 'Maghrib' && !isBesokUI} highlight />
                <TimeCard title="Isya" time={activeJadwal.isya} icon={<Moon size={20} />} isActive={currentPrayer === 'Isya' && !isBesokUI} highlight />
              </motion.div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3">
              <span className="font-semibold text-sm">Gagal memuat jadwal sholat.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TimeCard({ title, time, icon, highlight = false, isActive = false }: { title: string, time: string, icon: React.ReactNode, highlight?: boolean, isActive?: boolean }) {
  const itemVariants: any = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ scale: 1.05, y: -5, transition: { type: "spring", stiffness: 400 } }}
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-4 cursor-default ${
      isActive
      ? 'bg-amber-100 border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] dark:bg-amber-900/40 dark:border-amber-400 scale-105'
      : highlight 
        ? 'bg-amber-50 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30' 
        : 'bg-white border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800'
    }`}>
      <div className={`grid h-10 w-10 place-items-center rounded-xl ${
        highlight 
        ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400' 
        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
      }`}>
        {icon}
      </div>
      <div className={`text-[11px] font-black uppercase tracking-wider ${
        highlight ? 'text-amber-700 dark:text-amber-500' : 'text-slate-500 dark:text-slate-400'
      }`}>
        {title}
      </div>
      <div className={`text-xl font-black ${
        highlight ? 'text-amber-900 dark:text-amber-300' : 'text-slate-900 dark:text-white'
      }`}>
        {time}
      </div>
    </motion.div>
  );
}
