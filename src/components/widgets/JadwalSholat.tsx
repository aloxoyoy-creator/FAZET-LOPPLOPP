import React, { useState, useEffect } from 'react';

const kotaList = ['Tuban', 'Tasikmalaya', 'Ciamis'];

export default function JadwalSholat() {
  const [data, setData] = useState<{kota: string, date: string, timings: any, error?: boolean}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchJadwal = async () => {
      const results = [];
      for (const kota of kotaList) {
        try {
          const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${kota}&country=Indonesia&method=11`);
          const result = await res.json();
          if (active) {
            results.push({
              kota,
              date: result.data.date.readable,
              timings: {
                Imsak: result.data.timings.Imsak.split(' ')[0],
                Fajr: result.data.timings.Fajr.split(' ')[0],
                Dhuhr: result.data.timings.Dhuhr.split(' ')[0],
                Asr: result.data.timings.Asr.split(' ')[0],
                Maghrib: result.data.timings.Maghrib.split(' ')[0],
                Isha: result.data.timings.Isha.split(' ')[0],
              }
            });
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
    return <p style={{ textAlign: 'center', color: '#888' }}>Memuat jadwal sholat...</p>;
  }

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '15px',
      justifyContent: 'center',
      fontFamily: 'sans-serif'
    }}>
      {data.map((item, index) => {
        if (item.error) {
          return (
            <div key={index} style={{ padding: '15px', border: '1px solid red', color: 'red', borderRadius: '8px' }}>
              Gagal memuat {item.kota}
            </div>
          );
        }
        
        const t = item.timings;
        return (
          <div key={index} style={{
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            width: '100%',
            maxWidth: '280px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            color: '#333' // Ensure text is visible even in dark mode for this widget
          }}>
            <h3 style={{ margin: '0 0 10px 0', textAlign: 'center', color: '#2980b9', fontSize: '18px', fontWeight: 'bold' }}>{item.kota}</h3>
            <p style={{ margin: '0 0 15px 0', textAlign: 'center', fontSize: '12px', color: '#777' }}>{item.date}</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #eee', padding: '5px 0', fontSize: '14px' }}>
              <span>Imsak</span> <b>{t.Imsak}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #eee', padding: '5px 0', fontSize: '14px' }}>
              <span>Subuh</span> <b>{t.Fajr}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #eee', padding: '5px 0', fontSize: '14px' }}>
              <span>Dzuhur</span> <b>{t.Dhuhr}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #eee', padding: '5px 0', fontSize: '14px' }}>
              <span>Ashar</span> <b>{t.Asr}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #eee', padding: '5px 0', fontSize: '14px' }}>
              <span>Maghrib</span> <b>{t.Maghrib}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '14px' }}>
              <span>Isya</span> <b>{t.Isha}</b>
            </div>
          </div>
        );
      })}
    </div>
  );
}
