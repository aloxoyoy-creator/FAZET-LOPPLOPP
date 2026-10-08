import React, { useState, useEffect } from 'react';
import { MapPin, Sparkles, Navigation, Clock, Sunrise, Sun, Sunset, Moon } from 'lucide-react';

const WIDGETS = [
  {
    id: 'tasikmalaya',
    name: 'Tasikmalaya',
    apiId: '1227',
  },
  {
    id: 'ciamis',
    name: 'Kawali, Ciamis',
    apiId: '1205',
  },
  {
    id: 'tuban',
    name: 'Tuban',
    apiId: '1628',
  }
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
  const [jadwal, setJadwal] = useState<JadwalData | null>(null);
  const [loading, setLoading] = useState(true);

  const activeWidget = WIDGETS.find(w => w.id === activeTab) || WIDGETS[0];

  useEffect(() => {
    async function fetchJadwal() {
      setLoading(true);
      try {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        
        const response = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${activeWidget.apiId}/${year}/${month}/${day}`);
        const result = await response.json();
        
        if (result.status && result.data && result.data.jadwal) {
          setJadwal(result.data.jadwal);
        } else {
          setJadwal(null);
        }
      } catch (err) {
        console.error('Failed to fetch jadwal sholat:', err);
        setJadwal(null);
      } finally {
        setLoading(false);
      }
    }

    void fetchJadwal();
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
        <div className="relative w-full rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-6 min-h-[200px]">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Navigation className="w-8 h-8 animate-spin text-amber-400/50" />
              <span className="font-semibold text-sm animate-pulse">Menyiapkan jadwal wilayah {activeWidget.name}...</span>
            </div>
          ) : jadwal ? (
            <div>
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
                  <Clock size={14} />
                  {jadwal.tanggal}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <TimeCard title="Imsak" time={jadwal.imsak} icon={<Moon size={20} />} />
                <TimeCard title="Subuh" time={jadwal.subuh} icon={<Sunrise size={20} />} highlight />
                <TimeCard title="Dhuha" time={jadwal.dhuha} icon={<Sun size={20} />} />
                <TimeCard title="Dzuhur" time={jadwal.dzuhur} icon={<Sun size={20} />} highlight />
                <TimeCard title="Ashar" time={jadwal.ashar} icon={<Sun size={20} />} />
                <TimeCard title="Maghrib" time={jadwal.maghrib} icon={<Sunset size={20} />} highlight />
                <TimeCard title="Isya" time={jadwal.isya} icon={<Moon size={20} />} />
              </div>
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

function TimeCard({ title, time, icon, highlight = false }: { title: string, time: string, icon: React.ReactNode, highlight?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-4 transition-transform hover:scale-105 ${
      highlight 
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
    </div>
  );
}
