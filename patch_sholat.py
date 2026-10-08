import re
import sys

file_path = "c:/Users/ASUS/Downloads/FAZET-LOPLOP-V2-TOTAL-REDESIGN/src/components/widgets/JadwalSholat.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# I want to add `import { useState, useEffect }` but it's already there: `import React, { useState, useEffect } from 'react';`
# Let's add current time logic inside JadwalSholat component.

new_logic = """
  const [now, setNow] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; diff: number } | null>(null);
  const [currentPrayer, setCurrentPrayer] = useState<string>('');

  useEffect(() => {
    if (!jadwal) return;
    
    const times = [
      { name: 'Imsak', time: jadwal.imsak },
      { name: 'Subuh', time: jadwal.subuh },
      { name: 'Terbit', time: jadwal.terbit },
      { name: 'Dhuha', time: jadwal.dhuha },
      { name: 'Dzuhur', time: jadwal.dzuhur },
      { name: 'Ashar', time: jadwal.ashar },
      { name: 'Maghrib', time: jadwal.maghrib },
      { name: 'Isya', time: jadwal.isya },
    ];

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    let next = null;
    let current = '';
    
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
    
    // If all times have passed, next is Imsak tomorrow
    if (!next) {
      const [h, m] = times[0].time.split(':').map(Number);
      next = { name: 'Imsak', time: times[0].time, diff: (24 * 60 - currentMinutes) + (h * 60 + m) };
      current = 'Isya';
    }
    
    setNextPrayer(next);
    setCurrentPrayer(current);
  }, [now, jadwal]);

  const formatCountdown = (diff: number) => {
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    const seconds = 59 - now.getSeconds();
    return `${hours > 0 ? `${hours}j ` : ''}${minutes}m ${seconds}d`;
  };
"""

content = content.replace("  const [loading, setLoading] = useState(true);", "  const [loading, setLoading] = useState(true);\n" + new_logic)

# Change the display inside the component
ui_replacement = """
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
                  <Clock size={14} />
                  {jadwal.tanggal}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
"""

new_ui = """
              <div className="text-center mb-6 space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
                  <Clock size={14} />
                  {jadwal.tanggal} — {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                {nextPrayer && (
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Sekarang waktu <span className="text-amber-600 dark:text-amber-400 font-black uppercase tracking-wider">{currentPrayer || 'Belum masuk waktu'}</span>. 
                    <br />
                    <span className="text-amber-600 dark:text-amber-400 font-black">{formatCountdown(nextPrayer.diff)}</span> menuju {nextPrayer.name}.
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
"""

content = content.replace(ui_replacement, new_ui)

# Update TimeCard to highlight the current prayer
timecard_call_replacement = """
                <TimeCard title="Imsak" time={jadwal.imsak} icon={<Moon size={20} />} />
                <TimeCard title="Subuh" time={jadwal.subuh} icon={<Sunrise size={20} />} highlight />
                <TimeCard title="Dhuha" time={jadwal.dhuha} icon={<Sun size={20} />} />
                <TimeCard title="Dzuhur" time={jadwal.dzuhur} icon={<Sun size={20} />} highlight />
                <TimeCard title="Ashar" time={jadwal.ashar} icon={<Sun size={20} />} />
                <TimeCard title="Maghrib" time={jadwal.maghrib} icon={<Sunset size={20} />} highlight />
                <TimeCard title="Isya" time={jadwal.isya} icon={<Moon size={20} />} />
"""

new_timecard_call = """
                <TimeCard title="Imsak" time={jadwal.imsak} icon={<Moon size={20} />} isActive={currentPrayer === 'Imsak'} highlight />
                <TimeCard title="Subuh" time={jadwal.subuh} icon={<Sunrise size={20} />} isActive={currentPrayer === 'Subuh'} highlight />
                <TimeCard title="Dhuha" time={jadwal.dhuha} icon={<Sun size={20} />} isActive={currentPrayer === 'Dhuha'} highlight />
                <TimeCard title="Dzuhur" time={jadwal.dzuhur} icon={<Sun size={20} />} isActive={currentPrayer === 'Dzuhur'} highlight />
                <TimeCard title="Ashar" time={jadwal.ashar} icon={<Sun size={20} />} isActive={currentPrayer === 'Ashar'} highlight />
                <TimeCard title="Maghrib" time={jadwal.maghrib} icon={<Sunset size={20} />} isActive={currentPrayer === 'Maghrib'} highlight />
                <TimeCard title="Isya" time={jadwal.isya} icon={<Moon size={20} />} isActive={currentPrayer === 'Isya'} highlight />
"""

content = content.replace(timecard_call_replacement, new_timecard_call)

# update TimeCard component definition to accept isActive
timecard_def = """function TimeCard({ title, time, icon, highlight = false }: { title: string, time: string, icon: React.ReactNode, highlight?: boolean }) {"""
new_timecard_def = """function TimeCard({ title, time, icon, highlight = false, isActive = false }: { title: string, time: string, icon: React.ReactNode, highlight?: boolean, isActive?: boolean }) {"""

content = content.replace(timecard_def, new_timecard_def)

# update TimeCard class to pulsate or change border if active
active_replacement1 = """    <div className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-4 transition-transform hover:scale-105 ${
      highlight 
      ? 'bg-amber-50 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30' 
      : 'bg-white border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800'
    }`}>"""

new_active_replacement1 = """    <div className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-4 transition-transform hover:scale-105 ${
      isActive
      ? 'bg-amber-100 border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] dark:bg-amber-900/40 dark:border-amber-400 scale-105'
      : highlight 
        ? 'bg-amber-50 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30' 
        : 'bg-white border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800'
    }`}>"""

content = content.replace(active_replacement1, new_active_replacement1)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated JadwalSholat.tsx")
