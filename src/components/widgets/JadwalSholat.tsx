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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto w-full">
      <table className="w-full min-w-[600px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="bg-emerald-600 text-white font-semibold p-3 text-center border-b border-emerald-700">Kota</th>
            <th className="bg-emerald-600 text-white font-semibold p-3 text-center border-b border-emerald-700">Imsak</th>
            <th className="bg-emerald-600 text-white font-semibold p-3 text-center border-b border-emerald-700">Subuh</th>
            <th className="bg-emerald-600 text-white font-semibold p-3 text-center border-b border-emerald-700">Dzuhur</th>
            <th className="bg-emerald-600 text-white font-semibold p-3 text-center border-b border-emerald-700">Ashar</th>
            <th className="bg-emerald-600 text-white font-semibold p-3 text-center border-b border-emerald-700">Maghrib</th>
            <th className="bg-emerald-600 text-white font-semibold p-3 text-center border-b border-emerald-700">Isya</th>
            <th className="bg-emerald-600 text-white font-semibold p-3 text-center border-b border-emerald-700">Sumber API</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            if (item.error) {
              return (
                <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 text-center border-b border-slate-200 dark:border-slate-800 text-red-500 font-bold" colSpan={8}>
                    Gagal memuat jadwal untuk {item.kota}
                  </td>
                </tr>
              );
            }
            
            return (
              <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="p-3 text-center border-b border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200">
                  {item.kota}
                </td>
                <td className="p-3 text-center border-b border-slate-200 dark:border-slate-800">{item.timings.Imsak}</td>
                <td className="p-3 text-center border-b border-slate-200 dark:border-slate-800">{item.timings.Fajr}</td>
                <td className="p-3 text-center border-b border-slate-200 dark:border-slate-800">{item.timings.Dhuhr}</td>
                <td className="p-3 text-center border-b border-slate-200 dark:border-slate-800">{item.timings.Asr}</td>
                <td className="p-3 text-center border-b border-slate-200 dark:border-slate-800">{item.timings.Maghrib}</td>
                <td className="p-3 text-center border-b border-slate-200 dark:border-slate-800">{item.timings.Isha}</td>
                <td className="p-3 text-center border-b border-slate-200 dark:border-slate-800">
                  <span className={`text-[0.75rem] px-2.5 py-1 rounded-full text-white font-medium ${item.sumber === 'MyQuran' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                    {item.sumber}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
