import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Clock, Sunrise, Sun, Sunset, Moon, BellRing, BookOpen } from 'lucide-react';
import { calculateOfflinePrayerTimes, PRAYER_WISDOM } from '../../utils/jadwalSholat';
import { showSystemNotification } from '../../services/systemNotificationService';

const WIDGETS = [
  { id: 'tasikmalaya', name: 'Tasikmalaya', apiId: '1227', cityName: 'Tasikmalaya' },
  { id: 'ciamis', name: 'Kawali, Ciamis', apiId: '1205', cityName: 'Ciamis' },
  { id: 'tuban', name: 'Tuban', apiId: '1628', cityName: 'Tuban' },
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

  const activeWidget = WIDGETS.find((w) => w.id === activeTab) || WIDGETS[0];

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
          fetch(`https://api.myquran.com/v2/sholat/jadwal/${activeWidget.apiId}/${mYear}/${mMonth}/${mDay}`),
        ]);

        const jsonToday = await resToday.json();
        const jsonTomorrow = await resTomorrow.json();

        const tData: JadwalData =
          jsonToday.status && jsonToday.data?.jadwal
            ? jsonToday.data.jadwal
            : calculateOfflinePrayerTimes(activeWidget.cityName, today);

        const mData: JadwalData =
          jsonTomorrow.status && jsonTomorrow.data?.jadwal
            ? jsonTomorrow.data.jadwal
            : calculateOfflinePrayerTimes(activeWidget.cityName, tomorrow);

        cacheRef.current[activeWidget.id] = { today: tData, tomorrow: mData };
        setJadwalToday(tData);
        setJadwalTomorrow(mData);
      } catch {
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
      next = { name: 'Imsak', time: times[0].time, diff: 24 * 60 - currentMinutes + (h * 60 + m) };
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
      `Waktu ${targetName} (${time} WIB) • ${activeWidget.name}`,
      `${wisdom.exactAdvice}\n${wisdom.hadith}`,
      '/schedule',
      {
        channelId: 'fazet_prayer_channel',
        soundType: 'prayer',
      }
    );

    setNotifSent(true);
    setTimeout(() => setNotifSent(false), 3000);
  };

  const realTimeDateString = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);

  const tomorrowDate = new Date(now.getTime() + 86400000);
  const realTimeTomorrowDateString = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(tomorrowDate);

  const realTimeClock = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const currentWisdom = PRAYER_WISDOM[currentPrayer] || PRAYER_WISDOM[nextPrayer?.name || 'Subuh'];

  return (
    <div className="w-full">
      <div className="bg-[var(--tf-bg-surface)] rounded-[var(--tf-radius-card)] p-5 sm:p-7 border border-[var(--tf-border)] shadow-[var(--tf-shadow-raised)]">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 mb-5 border-b border-[var(--tf-border)]">
          <div>
            <div className="studio-eyebrow mb-1">Spiritual &amp; Waktu Ibadah</div>
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-[var(--tf-text-primary)]">
              Jadwal Sholat Wilayah {activeWidget.name}
            </h2>
            <p className="text-xs text-[var(--tf-text-muted)] mt-0.5">
              {isBesokUI ? `Menampilkan jadwal besok (${realTimeTomorrowDateString})` : realTimeDateString} &bull; Perhitungan Astronomis Kemenag RI
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Location Switcher */}
            <div className="flex bg-[var(--tf-bg-subtle)] p-1 rounded-xl border border-[var(--tf-border)]">
              {WIDGETS.map((widget) => (
                <button
                  key={widget.id}
                  type="button"
                  onClick={() => setActiveTab(widget.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === widget.id
                      ? 'bg-[var(--tf-bg-surface)] text-[var(--tf-text-primary)] shadow-2xs border border-[var(--tf-border)]'
                      : 'text-[var(--tf-text-muted)] hover:text-[var(--tf-text-primary)]'
                  }`}
                >
                  <MapPin size={12} className={activeTab === widget.id ? 'text-[var(--tf-accent)]' : ''} />
                  <span>{widget.name}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleTestTrigger}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] text-[var(--tf-text-secondary)] hover:border-[var(--tf-accent)]/40 hover:text-[var(--tf-text-primary)] transition-all cursor-pointer"
            >
              <BellRing size={13} className="text-[var(--tf-accent)]" />
              <span>{notifSent ? 'Pengingat Terkirim' : 'Uji Pengingat'}</span>
            </button>
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-[var(--tf-text-muted)] gap-2.5">
            <Navigation className="w-5 h-5 animate-spin text-[var(--tf-accent)]" />
            <span className="text-xs">Menyelaraskan jadwal wilayah {activeWidget.name}...</span>
          </div>
        ) : activeJadwal ? (
          <div className="space-y-5">
            {/* Status Bar & Wisdom */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              <div className="lg:col-span-5 rounded-xl bg-[var(--tf-bg-subtle)] border border-[var(--tf-border)] p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-[var(--tf-text-muted)]">
                  <span>Waktu Saat Ini ({ currentPrayer || 'Menunggu' })</span>
                  <span className="font-mono font-medium text-[var(--tf-text-primary)] inline-flex items-center gap-1">
                    <Clock size={12} className="text-[var(--tf-accent)]" />
                    {realTimeClock} WIB
                  </span>
                </div>

                {nextPrayer ? (
                  <div className="mt-3 flex items-baseline justify-between gap-2">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--tf-text-muted)]">
                        Menuju Waktu {nextPrayer.name}
                      </div>
                      <div className="font-serif text-2xl font-semibold text-[var(--tf-text-primary)] mt-0.5">
                        {nextPrayer.time} WIB
                      </div>
                    </div>
                    <div className="font-mono text-sm font-semibold px-3 py-1 rounded-lg bg-[var(--tf-accent-soft)] text-[var(--tf-accent)] border border-[var(--tf-accent)]/20">
                      -{formatCountdown(nextPrayer.diff)}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-xs font-medium text-[var(--tf-text-secondary)]">
                    Seluruh rangkaian waktu sholat hari ini telah masuk. Selamat beristirahat.
                  </div>
                )}
              </div>

              {currentWisdom && (
                <div className="lg:col-span-7 rounded-xl bg-[var(--tf-bg-subtle)] border border-[var(--tf-border)] p-4 flex items-start gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--tf-bg-surface)] border border-[var(--tf-border)] text-[var(--tf-accent)] mt-0.5">
                    <BookOpen size={14} />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--tf-accent)]">
                      Catatan Keutamaan &bull; {currentPrayer || nextPrayer?.name}
                    </div>
                    <p className="font-serif text-sm italic text-[var(--tf-text-primary)] leading-relaxed">
                      {currentWisdom.hadith}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 7 Prayer Time Pillars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              <TimeCard title="Imsak" time={activeJadwal.imsak} icon={<Moon size={15} />} isActive={currentPrayer === 'Imsak' && !isBesokUI} />
              <TimeCard title="Subuh" time={activeJadwal.subuh} icon={<Sunrise size={15} />} isActive={currentPrayer === 'Subuh' && !isBesokUI} />
              <TimeCard title="Dhuha" time={activeJadwal.dhuha} icon={<Sun size={15} />} isActive={currentPrayer === 'Dhuha' && !isBesokUI} />
              <TimeCard title="Dzuhur" time={activeJadwal.dzuhur} icon={<Sun size={15} />} isActive={currentPrayer === 'Dzuhur' && !isBesokUI} />
              <TimeCard title="Ashar" time={activeJadwal.ashar} icon={<Sun size={15} />} isActive={currentPrayer === 'Ashar' && !isBesokUI} />
              <TimeCard title="Maghrib" time={activeJadwal.maghrib} icon={<Sunset size={15} />} isActive={currentPrayer === 'Maghrib' && !isBesokUI} />
              <TimeCard title="Isya" time={activeJadwal.isya} icon={<Moon size={15} />} isActive={currentPrayer === 'Isya' && !isBesokUI} />
            </div>
          </div>
        ) : (
          <div className="py-10 text-center text-xs text-[var(--tf-text-muted)]">
            Jadwal sholat belum dapat dimuat saat ini.
          </div>
        )}
      </div>
    </div>
  );
}

function TimeCard({
  title,
  time,
  icon,
  isActive = false,
}: {
  title: string;
  time: string;
  icon: React.ReactNode;
  isActive?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1.5 rounded-xl p-3.5 transition-all border ${
        isActive
          ? 'bg-[var(--tf-accent-soft)] border-[var(--tf-accent)] text-[var(--tf-text-primary)]'
          : 'bg-[var(--tf-bg-subtle)]/50 border-[var(--tf-border)] text-[var(--tf-text-secondary)] hover:border-[var(--tf-accent)]/40'
      }`}
    >
      <div
        className={`grid h-8 w-8 place-items-center rounded-lg border ${
          isActive
            ? 'bg-[var(--tf-accent)] text-[var(--tf-on-accent)] border-transparent'
            : 'bg-[var(--tf-bg-surface)] text-[var(--tf-text-muted)] border-[var(--tf-border)]'
        }`}
      >
        {icon}
      </div>
      <div
        className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${
          isActive ? 'text-[var(--tf-accent)]' : 'text-[var(--tf-text-muted)]'
        }`}
      >
        {title}
      </div>
      <div className="font-mono text-base font-semibold tracking-tight text-[var(--tf-text-primary)]">
        {time}
      </div>
    </div>
  );
}
