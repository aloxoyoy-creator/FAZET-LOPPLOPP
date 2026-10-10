import { useState, useEffect } from 'react';
import { useAppConfig } from '../context/AppConfigContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Coffee, Heart, Moon, Sun, Utensils, BellRing, Sparkles, SwitchCamera, Play } from 'lucide-react';
import { getNowWIB, getWIBDateForDay } from '../utils/timeUtils';
import { getJadwalSholatHariIni } from '../utils/jadwalSholat';
import { showSystemNotification } from '../services/systemNotificationService';
import { getRandomMessage } from '../utils/romanticMessages';

export default function Lifestyle() {
  const { appConfig } = useAppConfig();
  const { lifestyle } = appConfig;
  const [now, setNow] = useState(getNowWIB());

  useEffect(() => {
    const timer = setInterval(() => setNow(getNowWIB()), 60000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = getWIBDateForDay(0).toISOString().split('T')[0];
  const jadwal = getJadwalSholatHariIni(todayStr);

  const toggleFasting = (v: boolean) => {
    void appConfig.save('lifestyle', { ...lifestyle, isFasting: v });
  };
  
  const toggleRomantic = (v: boolean) => {
    void appConfig.save('lifestyle', { ...lifestyle, enableRomanticReminders: v });
  };

  const testNotifPagi = () => {
    void showSystemNotification('Good Morning Sayang! ☀️', getRandomMessage('good_morning'), '/lifestyle', { soundType: 'reminder' });
  };

  const testNotifMakan = () => {
    void showSystemNotification('Waktunya Makan! 🍽️', getRandomMessage('eat'), '/lifestyle', { soundType: 'reminder' });
  };

  const testNotifMalam = () => {
    void showSystemNotification('Good Night Sayang! 🌙', getRandomMessage('good_night'), '/lifestyle', { soundType: 'reminder' });
  };

  const testNotifSahur = () => {
    void showSystemNotification('Waktunya Sahur! ☕', getRandomMessage('sahur'), '/lifestyle', { soundType: 'prayer' });
  };

  const testNotifBuka = () => {
    void showSystemNotification('Alhamdulillah Waktunya Berbuka! 🍽️', getRandomMessage('iftar'), '/lifestyle', { soundType: 'success' });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <header className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Heart className="text-rose-500" />
          Lifestyle & Romansa
        </h1>
        <p className="text-[var(--tf-text-muted)] mt-2">
          Pusat kontrol rutinitas manis dan ibadah kalian berdua. Notifikasi akan disinkronisasi dalam waktu WIB.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Card Romantis */}
        <Card className={`p-5 border-2 transition-all ${lifestyle.enableRomanticReminders ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/20' : 'border-transparent'}`}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-rose-100 dark:bg-rose-900 rounded-xl text-rose-600 dark:text-rose-300">
              <Sun size={24} />
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={lifestyle.enableRomanticReminders} onChange={(e) => toggleRomantic(e.target.checked)} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-rose-500"></div>
            </label>
          </div>
          <h2 className="text-lg font-bold">Reminders Romantis</h2>
          <p className="text-sm text-[var(--tf-text-muted)] mt-1 mb-4">
            Notifikasi spesial pengingat Good Morning, Makan Siang, dan Good Night yang tidak akan monoton.
          </p>
          {lifestyle.enableRomanticReminders && (
            <div className="space-y-2 mt-4 text-xs bg-white dark:bg-[#070b14] p-3 rounded-xl border border-rose-100 dark:border-rose-900/30">
              <div className="flex items-center justify-between"><span className="flex items-center gap-2"><Sun size={12}/> Pagi (05:30)</span> <button onClick={testNotifPagi} className="flex items-center gap-1 text-rose-600 hover:bg-rose-100 px-2 py-1 rounded-md"><Play size={10}/> Test</button></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-2"><Utensils size={12}/> Siang (12:30)</span> <button onClick={testNotifMakan} className="flex items-center gap-1 text-rose-600 hover:bg-rose-100 px-2 py-1 rounded-md"><Play size={10}/> Test</button></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-2"><Moon size={12}/> Malam (22:00)</span> <button onClick={testNotifMalam} className="flex items-center gap-1 text-rose-600 hover:bg-rose-100 px-2 py-1 rounded-md"><Play size={10}/> Test</button></div>
            </div>
          )}
        </Card>

        {/* Card Puasa */}
        <Card className={`p-5 border-2 transition-all ${lifestyle.isFasting ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20' : 'border-transparent'}`}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-900 rounded-xl text-amber-600 dark:text-amber-300">
              <Coffee size={24} />
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={lifestyle.isFasting} onChange={(e) => toggleFasting(e.target.checked)} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
            </label>
          </div>
          <h2 className="text-lg font-bold">Mode Puasa</h2>
          <p className="text-sm text-[var(--tf-text-muted)] mt-1 mb-4">
            Sesuaikan pengingat makan menjadi peringatan Sahur (45 menit sebelum Imsak) dan Berbuka (saat Maghrib).
          </p>
          {lifestyle.isFasting && jadwal && (
            <div className="space-y-2 mt-4 text-xs bg-white dark:bg-[#070b14] p-3 rounded-xl border border-amber-100 dark:border-amber-900/30">
              <div className="flex items-center justify-between"><span className="flex items-center gap-2"><Coffee size={12}/> Sahur & Imsak ({jadwal.imsak} WIB)</span> <button onClick={testNotifSahur} className="flex items-center gap-1 text-amber-600 hover:bg-amber-100 px-2 py-1 rounded-md"><Play size={10}/> Test</button></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-2"><Utensils size={12}/> Buka ({jadwal.maghrib} WIB)</span> <button onClick={testNotifBuka} className="flex items-center gap-1 text-amber-600 hover:bg-amber-100 px-2 py-1 rounded-md"><Play size={10}/> Test</button></div>
            </div>
          )}
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <BellRing size={16} className="text-[var(--tf-primary)]" />
          <h2 className="font-bold">Info Sinkronisasi WIB</h2>
        </div>
        <p className="text-sm text-[var(--tf-text-muted)] leading-relaxed">
          Seluruh waktu notifikasi di FAZET LOPP LOPP secara ketat disinkronisasi ke <strong>Waktu Indonesia Barat (WIB)</strong>. 
          Meski sistem HP kalian berada di WITA atau WIT, notifikasi akan berbunyi tepat waktu secara bersamaan untuk kalian berdua sesuai zona waktu Fathur (WIB).
        </p>
      </Card>
    </div>
  );
}
