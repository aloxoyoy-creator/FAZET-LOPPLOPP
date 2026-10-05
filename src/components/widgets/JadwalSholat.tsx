import React, { useState, useEffect } from 'react';

const targetCities = ['Ciamis', 'Tasikmalaya', 'Tuban'];

type JadwalData = {
  kota: string;
  date: string;
  timings: {
    Imsak: string;
    Fajr: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
  sumber: string;
  error?: boolean;
};

export default function JadwalSholat() {
  const [data, setData] = useState<JadwalData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    
    const fetchJadwal = async () => {
      const results: JadwalData[] = [];
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      for (const kota of targetCities) {
        try {
          // LANGKAH 1: Coba API Utama (MyQuran - Kemenag)
          const searchRes = await fetch(`https://api.myquran.com/v2/sholat/kota/cari/${kota}`);
          const searchData = await searchRes.json();
          
          if (!searchData.status || searchData.data.length === 0) {
            throw new Error(`Kota ${kota} tidak ditemukan di MyQuran`);
          }
          const cityId = searchData.data[0].id;

          const jadwalRes = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${cityId}/${year}/${month}/${day}`);
          const jadwalData = await jadwalRes.json();
          const jadwal = jadwalData.data.jadwal;

          if (active) {
            results.push({
              kota,
              date: jadwal.tanggal,
              timings: {
                Imsak: jadwal.imsak,
                Fajr: jadwal.subuh,
                Dhuhr: jadwal.dzuhur,
                Asr: jadwal.ashar,
                Maghrib: jadwal.maghrib,
                Isha: jadwal.isya,
              },
              sumber: 'MyQuran'
            });
          }
        } catch (error) {
          console.warn(`MyQuran gagal untuk ${kota}. Beralih ke API Aladhan...`, error);
          
          try {
            // LANGKAH 2: Fallback ke API Cadangan (Aladhan - Global)
            const aladhanRes = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${kota}&country=Indonesia&method=11`);
            const aladhanData = await aladhanRes.json();
            const timings = aladhanData.data.timings;
            const aladhanDate = aladhanData.data.date.readable;

            if (active) {
              results.push({
                kota,
                date: aladhanDate,
                timings: {
                  Imsak: timings.Imsak.split(' ')[0],
                  Fajr: timings.Fajr.split(' ')[0],
                  Dhuhr: timings.Dhuhr.split(' ')[0],
                  Asr: timings.Asr.split(' ')[0],
                  Maghrib: timings.Maghrib.split(' ')[0],
                  Isha: timings.Isha.split(' ')[0],
                },
                sumber: 'Aladhan'
              });
            }
          } catch (fallbackError) {
            if (active) {
              results.push({
                kota,
                date: '',
                timings: { Imsak: '', Fajr: '', Dhuhr: '', Asr: '', Maghrib: '', Isha: '' },
                sumber: 'Error',
                error: true
              });
            }
          }
        }
      }
      
      if (active) {
        setData(results);
        setLoading(false);
      }
    };
    
    void fetchJadwal();
    
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '16px',
      justifyContent: 'center',
      fontFamily: 'sans-serif'
    }}>
      {data.map((item, index) => {
        if (item.error) {
          return (
            <div key={index} className="p-4 border border-red-500/30 bg-red-500/10 text-red-500 rounded-xl">
              Gagal memuat jadwal untuk {item.kota}
            </div>
          );
        }
        
        const t = item.timings;
        return (
          <div key={index} className="bg-[var(--tf-bg-surface)] border border-[var(--tf-border)] rounded-2xl p-5 shadow-sm transition-all hover:shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0">
              <span className={`text-[10px] font-bold px-2 py-1 rounded-bl-lg text-white ${item.sumber === 'MyQuran' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                API {item.sumber}
              </span>
            </div>

            <h3 className="m-0 text-center text-lg font-bold text-blue-600 dark:text-blue-400 mb-1 mt-2">{item.kota}</h3>
            <p className="m-0 text-center text-xs text-[var(--tf-text-muted)] mb-4">{item.date}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center border-b border-[var(--tf-border)] pb-2 text-sm text-[var(--tf-text-secondary)]">
                <span>Imsak</span> <b className="text-[var(--tf-text-primary)]">{t.Imsak}</b>
              </div>
              <div className="flex justify-between items-center border-b border-[var(--tf-border)] pb-2 text-sm text-[var(--tf-text-secondary)]">
                <span>Subuh</span> <b className="text-[var(--tf-text-primary)]">{t.Fajr}</b>
              </div>
              <div className="flex justify-between items-center border-b border-[var(--tf-border)] pb-2 text-sm text-[var(--tf-text-secondary)]">
                <span>Dzuhur</span> <b className="text-[var(--tf-text-primary)]">{t.Dhuhr}</b>
              </div>
              <div className="flex justify-between items-center border-b border-[var(--tf-border)] pb-2 text-sm text-[var(--tf-text-secondary)]">
                <span>Ashar</span> <b className="text-[var(--tf-text-primary)]">{t.Asr}</b>
              </div>
              <div className="flex justify-between items-center border-b border-[var(--tf-border)] pb-2 text-sm text-[var(--tf-text-secondary)]">
                <span>Maghrib</span> <b className="text-[var(--tf-text-primary)]">{t.Maghrib}</b>
              </div>
              <div className="flex justify-between items-center pt-1 text-sm text-[var(--tf-text-secondary)]">
                <span>Isya</span> <b className="text-[var(--tf-text-primary)]">{t.Isha}</b>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
