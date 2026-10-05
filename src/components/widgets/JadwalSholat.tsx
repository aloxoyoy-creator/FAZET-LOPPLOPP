import React, { useState, useEffect } from 'react';

const kotaMap: Record<string, string> = {
  'Tuban': '1628',
  'Tasikmalaya': '1227', // Kota Tasikmalaya
  'Ciamis': '1205'
};

export default function JadwalSholat() {
  const [data, setData] = useState<{kota: string, date: string, timings: any, error?: boolean}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchJadwal = async () => {
      const results = [];
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');

      for (const [kota, id] of Object.entries(kotaMap)) {
        try {
          const res = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${id}/${year}/${month}/${day}`);
          const result = await res.json();
          if (active && result.status) {
            results.push({
              kota,
              date: result.data.jadwal.tanggal,
              timings: {
                Imsak: result.data.jadwal.imsak,
                Fajr: result.data.jadwal.subuh,
                Dhuhr: result.data.jadwal.dzuhur,
                Asr: result.data.jadwal.ashar,
                Maghrib: result.data.jadwal.maghrib,
                Isha: result.data.jadwal.isya,
              }
            });
          } else if (active) {
            results.push({ kota, date: '', timings: null, error: true });
          }
        } catch (e) {
          if (active) {
            results.push({ kota, date: '', timings: null, error: true });
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
          <div key={index} className="bg-[var(--tf-bg-surface)] border border-[var(--tf-border)] rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
            <h3 className="m-0 text-center text-lg font-bold text-blue-600 dark:text-blue-400 mb-1">{item.kota}</h3>
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
