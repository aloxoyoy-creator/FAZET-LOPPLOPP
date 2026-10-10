import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Sparkles, Navigation, Clock, Sunrise, Sun, Sunset, Moon, CalendarDays, BellRing, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ContinuousMotion from '../ui/ContinuousMotion';
import { calculateOfflinePrayerTimes, PRAYER_WISDOM } from '../../utils/jadwalSholat';
import { showSystemNotification } from '../../services/systemNotificationService';

const WIDGETS = [
  { id: 'tasikmalaya', name: 'Tasikmalaya', apiId: '1227', cityName: 'Tasikmalaya' },
  { id: 'ciamis', name: 'Kawali, Ciamis', apiId: '1205', cityName: 'Ciamis' },
  { id: 'tuban', name: 'Tuban', apiId: '1628', cityName: 'Tuban' }
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
  date?: string;
  sumber?: string;
};

export default function JadwalSholat() {
  const [activeTab, setActiveTab] = useState(WIDGETS[0].id);
  const [jadwalToday, setJadwalToday] = useState<JadwalData | null>(null);
  const [jadwalTomorrow, setJadwalTomorrow] = useState<JadwalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifSent, setNotifSent] = useState(false);

  const [now, setNow] = useState(new Date());
  const cacheRef = useRef<Record<string, { today: JadwalData; tomorrow: JadwalData }>>({});

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; diff: number } | null>(null);
  const [currentPrayer, setCurrentPrayer] = useState<string>('');
  const [activeJadwal, setActiveJadwal] = useState<JadwalData | null>(null);
  const [isBesokUI, setIsBesokUI] = useState(false);

  const activeWidget = WIDGETS.find(w => w.id === activeTab) || WIDGETS[0];

  useEffect(() => {
    async function loadJadwal() {
      if (cacheRef.current[activeWidget.id]) {
        setJadwalToday(cacheRef.current[activeWidget.id].today);
        setJadwalTomorrow(cacheRef.current[activeWidget.id].tomorrow);
        setLoading(false);
        return;
      }

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
        
        let tData: JadwalData;
        let mData: JadwalData;

        if (jsonToday.status && jsonToday.data?.jadwal) {
          tData = jsonToday.data.jadwal;
        } else {
          tData = calculateOfflinePrayerTimes(activeWidget.cityName, today);
        }

        if (jsonTomorrow.status && jsonTomorrow.data?.jadwal) {
          mData = jsonTomorrow.data.jadwal;
        } else {
          mData = calculateOfflinePrayerTimes(activeWidget.cityName, tomorrow);
        }

        cacheRef.current[activeWidget.id] = { today: tData, tomorrow: mData };
        setJadwalToday(tData);
        setJadwalTomorrow(mData);
      } catch (err) {
        console.warn('API error, using offline prayer calculation fallback:', err);
        const tData = calculateOfflinePrayerTimes(activeWidget.cityName, new Date());
        const mData = calculateOfflinePrayerTimes(activeWidget.cityName, new Date(Date.now() + 86400000));
        setJadwalToday(tData);
        setJadwalTomorrow(mData);
      } finally {
        setLoading(false);
      }
    }

    void loadJadwal();
  }, [activeWidget.id, activeWidget.apiId, activeWidget.cityName]);

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
      const [h, m] = times[0].time.split(':').map(Number);
      next = { name: 'Imsak', time: times[0].time, diff: (24 * 60 - currentMinutes) + (h * 60 + m) };
      current = 'Isya'; 
    } else {
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

      if (!next && currentMinutes >= isyaMins) {
        current = 'Isya';
        next = null;
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

  const handleTestTrigger = async () => {
    if (!activeJadwal) return;
    const targetName = nextPrayer ? nextPrayer.name : currentPrayer || 'Subuh';
    const wisdom = PRAYER_WISDOM[targetName] || PRAYER_WISDOM['Subuh'];
    const time = (activeJadwal as Record<string, string>)[targetName.toLowerCase()] || activeJadwal.subuh;

    await showSystemNotification(
      `🕌 Adzan ${targetName} (${time} WIB) • ${activeWidget.name}`,
      `${wisdom.exactAdvice}\n${wisdom.hadith}`,
      '/schedule',
      {
        channelId: 'fazet_prayer_channel',
        soundType: 'prayer'
      }
    );

    setNotifSent(true);
    setTimeout(() => setNotifSent(false), 3000);
  };

  const currentWisdom = PRAYER_WISDOM[currentPrayer] || PRAYER_WISDOM[nextPrayer?.name || 'Subuh'];

  return (
    <div className="w-full my-4">
      <div className="bg-white dark:bg-[#0f1219] rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-amber-400/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-emerald-400/10 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-xl text-amber-600 dark:text-amber-400">
                <Sparkles size={18} />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Jadwal Sholat & Ibadah</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Data astronomis Kemenag RI • Dilengkapi pengingat adzan & hadits keutamaan
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Location Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl overflow-x-auto hide-scrollbar">
              {WIDGETS.map((widget) => (
                <button
                  key={widget.id}
                  onClick={() => setActiveTab(widget.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                    activeTab === widget.id 
                      ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <MapPin size={14} className={activeTab === widget.id ? "animate-bounce" : ""} />
                  {widget.name}
                </button>
              ))}
            </div>

            {/* Quick Test Audio Button */}
            <button
              onClick={handleTestTrigger}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                notifSent
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300 hover:bg-amber-100'
              }`}
            >
              <BellRing size={14} className={notifSent ? "animate-spin" : ""} />
              <span>{notifSent ? 'Notifikasi Terkirim!' : 'Tes Notif Sholat'}</span>
            </button>
          </div>
        </div>

        {/* Native UI Container */}
        <div className={`relative w-full rounded-3xl border p-6 min-h-[200px] transition-colors duration-500 ${
          isBesokUI 
            ? 'bg-indigo-50/50 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-900/30' 
            : 'bg-slate-50/60 border-slate-100 dark:bg-slate-900/40 dark:border-slate-800'
        }`}>
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Navigation className="w-8 h-8 animate-spin text-amber-400/50" />
              <span className="font-semibold text-xs animate-pulse">Menyiapkan jadwal wilayah {activeWidget.name}...</span>
            </div>
          ) : activeJadwal ? (
            <div className="fade-in space-y-5">
              <div className="text-center space-y-2.5">
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
                    <span className="text-amber-600 dark:text-amber-400 font-black text-xl">{formatCountdown(nextPrayer.diff)}</span> menuju {nextPrayer.name}.
                  </div>
                ) : (
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Sekarang waktu <span className="text-amber-600 dark:text-amber-400 font-black uppercase tracking-wider">{currentPrayer}</span>. 
                    <br />
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Selamat menunaikan ibadah sholat Isya.</span>
                  </div>
                )}
              </div>

              {/* Hadith / Wisdom Advice Pill */}
              {currentWisdom && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5 max-w-2xl mx-auto">
                  <BookOpen size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-black text-amber-800 dark:text-amber-400 block uppercase tracking-wider text-[10px]">
                      Keutamaan Waktu {currentPrayer || nextPrayer?.name}
                    </span>
                    <p className="italic text-slate-600 dark:text-slate-300">
                      {currentWisdom.hadith}
                    </p>
                  </div>
                </div>
              )}

              {/* Prayer Time Cards Grid */}
              <motion.div 
                className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05 }
                  }
                }}
              >
                <TimeCard title="Imsak" time={activeJadwal.imsak} icon={<Moon size={18} />} isActive={currentPrayer === 'Imsak' && !isBesokUI} />
                <TimeCard title="Subuh" time={activeJadwal.subuh} icon={<Sunrise size={18} />} isActive={currentPrayer === 'Subuh' && !isBesokUI} />
                <TimeCard title="Dhuha" time={activeJadwal.dhuha} icon={<Sun size={18} />} isActive={currentPrayer === 'Dhuha' && !isBesokUI} />
                <TimeCard title="Dzuhur" time={activeJadwal.dzuhur} icon={<Sun size={18} />} isActive={currentPrayer === 'Dzuhur' && !isBesokUI} />
                <TimeCard title="Ashar" time={activeJadwal.ashar} icon={<Sun size={18} />} isActive={currentPrayer === 'Ashar' && !isBesokUI} />
                <TimeCard title="Maghrib" time={activeJadwal.maghrib} icon={<Sunset size={18} />} isActive={currentPrayer === 'Maghrib' && !isBesokUI} />
                <TimeCard title="Isya" time={activeJadwal.isya} icon={<Moon size={18} />} isActive={currentPrayer === 'Isya' && !isBesokUI} />
              </motion.div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3">
              <span className="font-semibold text-xs">Gagal memuat jadwal sholat.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TimeCard({ title, time, icon, isActive = false }: { title: string, time: string, icon: React.ReactNode, isActive?: boolean }) {
  const itemVariants: any = {
    hidden: { opacity: 0, y: 15, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 350, damping: 25 } }
  };

  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ scale: 1.04, y: -3 }}
      className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl p-3.5 transition-all ${
        isActive
          ? 'bg-amber-100 border-2 border-amber-500 shadow-[0_0_18px_rgba(245,158,11,0.35)] dark:bg-amber-900/40 dark:border-amber-400 scale-105'
          : 'bg-white border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800 hover:border-amber-200'
      }`}
    >
      <ContinuousMotion intensity={isActive ? 'medium' : 'low'}>
        <div className={`grid h-9 w-9 place-items-center rounded-xl ${
          isActive 
            ? 'bg-amber-500 text-white shadow-sm' 
            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
        }`}>
          {icon}
        </div>
      </ContinuousMotion>
      <div className={`text-[10px] font-black uppercase tracking-wider ${
        isActive ? 'text-amber-800 dark:text-amber-300' : 'text-slate-500 dark:text-slate-400'
      }`}>
        {title}
      </div>
      <div className={`text-lg font-black tracking-tight ${
        isActive ? 'text-amber-950 dark:text-amber-200' : 'text-slate-900 dark:text-white'
      }`}>
        {time}
      </div>
    </motion.div>
  );
}
