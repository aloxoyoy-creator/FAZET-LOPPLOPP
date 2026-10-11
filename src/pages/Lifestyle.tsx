import { useState, useEffect } from 'react';
import { useAppConfig } from '../context/AppConfigContext';
import Card from '../components/ui/Card';
import { Coffee, Moon, Sun, Utensils, BellRing, Sparkles, Play, Headphones, BookOpen, Clock } from 'lucide-react';
import { getNowWIB } from '../utils/timeUtils';
import { calculateOfflinePrayerTimes } from '../utils/jadwalSholat';
import { showSystemNotification, checkNotificationPermission, requestNotificationPermission } from '../services/systemNotificationService';
import { useToast } from '../components/ui/Toast';

// Imported Useful Lifestyle & Routine Modules
import CouplePrayersAndRoutines from '../components/lifestyle/CouplePrayersAndRoutines';
import CoupleSoundscape from '../components/lifestyle/CoupleSoundscape';

export default function Lifestyle() {
  const appConfig = useAppConfig();
  const { lifestyle } = appConfig;
  const [now, setNow] = useState(getNowWIB());
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'ibadah' | 'suasana'>('ibadah');

  useEffect(() => {
    const timer = setInterval(() => setNow(getNowWIB()), 60000);
    return () => clearInterval(timer);
  }, []);

  const prayerTimes = calculateOfflinePrayerTimes('Tuban', now);
  const jadwal = {
    imsak: prayerTimes.imsak,
    maghrib: prayerTimes.maghrib
  };

  const toggleFasting = (v: boolean) => {
    void appConfig.save('lifestyle', { ...lifestyle, isFasting: v });
  };

  const handleTest = async (title: string, message: string, soundType: 'reminder' | 'prayer' | 'success') => {
    let perm = await checkNotificationPermission();
    if (perm !== 'granted') {
      const granted = await requestNotificationPermission();
      if (!granted) {
        toast.push({ tone: 'error', title: 'Izin Ditolak', message: 'Tidak dapat menampilkan notifikasi percobaan. Izinkan notifikasi di pengaturan browser/HP kamu.' });
        return;
      }
    }
    toast.push({ tone: 'info', title: 'Menguji Notifikasi...', message: 'Notifikasi akan segera muncul di layar.' });
    void showSystemNotification(title, message, '/lifestyle', { soundType });
  };

  const testNotifSahur = () => handleTest('Waktunya Sahur! ☕', `Waktu imsak pukul ${jadwal.imsak} WIB. Jangan lupa santap sahur dan niat berpuasa ya!`, 'prayer');
  const testNotifBuka = () => handleTest('Alhamdulillah Waktunya Berbuka! 🍽️', `Adzan Maghrib telah berkumandang (${jadwal.maghrib} WIB). Selamat berbuka puasa!`, 'success');

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs tracking-widest uppercase mb-2">
          <Sparkles size={16} /> Gaya Hidup & Produktivitas
        </div>
        <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
          <Clock className="text-blue-600 dark:text-blue-400" />
          Lifestyle, Ibadah & Suasana Belajar
        </h1>
        <p className="text-[var(--tf-text-muted)] mt-2 text-sm max-w-2xl leading-relaxed">
          Pusat jadwal sholat harian, mode puasa (sahur & berbuka), doa penyejuk hati, dan generator audio suasana (soundscape) untuk mendukung fokus belajar.
        </p>
      </header>

      {/* Navigation Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl w-full sm:w-fit gap-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('ibadah')}
          className={`flex-1 sm:px-6 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'ibadah'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-300 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen size={14} />
          Ibadah & Rutinitas
        </button>

        <button
          onClick={() => setActiveTab('suasana')}
          className={`flex-1 sm:px-6 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'suasana'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Headphones size={14} />
          Suasana & Belajar
        </button>
      </div>

      {/* TAB 1: IBADAH & RUTINITAS */}
      {activeTab === 'ibadah' && (
        <div className="space-y-6 fade-up">
          {/* Doa Harian & Jadwal Sholat */}
          <CouplePrayersAndRoutines />

          {/* Mode Puasa Card */}
          <Card className={`p-6 border-2 transition-all ${lifestyle.isFasting ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20' : 'border-slate-200 dark:border-slate-800'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-2xl text-amber-600 dark:text-amber-300">
                <Coffee size={24} />
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={lifestyle.isFasting} onChange={(e) => toggleFasting(e.target.checked)} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
              </label>
            </div>
            <h2 className="text-lg font-bold">Mode Puasa (Sahur & Iftar)</h2>
            <p className="text-sm text-[var(--tf-text-muted)] mt-1 mb-4">
              Sesuaikan jadwal pengingat makan menjadi peringatan Sahur (sebelum Imsak) dan Berbuka (saat Maghrib).
            </p>
            {lifestyle.isFasting && jadwal && (
              <div className="space-y-2 mt-4 text-xs bg-white dark:bg-[#070b14] p-3.5 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-semibold">
                    <Coffee size={14}/> Sahur & Imsak ({jadwal.imsak} WIB)
                  </span>
                  <button onClick={testNotifSahur} className="flex items-center gap-1 text-amber-600 hover:bg-amber-50 px-2.5 py-1 rounded-lg font-bold">
                    <Play size={10}/> Test Notif
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-semibold">
                    <Utensils size={14}/> Buka Puasa ({jadwal.maghrib} WIB)
                  </span>
                  <button onClick={testNotifBuka} className="flex items-center gap-1 text-amber-600 hover:bg-amber-50 px-2.5 py-1 rounded-lg font-bold">
                    <Play size={10}/> Test Notif
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: SUASANA & BELAJAR */}
      {activeTab === 'suasana' && (
        <div className="space-y-6 fade-up">
          {/* Soundscape Synthesizer */}
          <CoupleSoundscape />

          {/* Info Sinkronisasi WIB */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <BellRing size={18} className="text-[var(--tf-primary)]" />
              <h2 className="font-bold text-sm">Info Sinkronisasi Waktu Indonesia Barat (WIB)</h2>
            </div>
            <p className="text-xs text-[var(--tf-text-muted)] leading-relaxed">
              Seluruh jadwal dan notifikasi disinkronisasi ke <strong>Waktu Indonesia Barat (WIB)</strong>. 
              Meski berada di zona WITA atau WIT saat bepergian, jadwal sholat dan waktu pengingat tetap akurat.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
