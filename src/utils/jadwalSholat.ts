export async function fetchJadwalKota(kota: string) {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  try {
    // LANGKAH 1: Coba API Utama (MyQuran - Kemenag)
    const searchRes = await fetch(`https://api.myquran.com/v2/sholat/kota/cari/${kota}`);
    const searchData = await searchRes.json();
    
    if (!searchData.status || searchData.data.length === 0) {
      throw new Error("Kota tidak ditemukan di MyQuran");
    }
    
    const cityId = searchData.data[0].id;
    const jadwalRes = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${cityId}/${year}/${month}/${day}`);
    const jadwalData = await jadwalRes.json();
    const jadwal = jadwalData.data.jadwal;

    return {
      kota: kota,
      imsak: jadwal.imsak,
      subuh: jadwal.subuh,
      dzuhur: jadwal.dzuhur,
      ashar: jadwal.ashar,
      maghrib: jadwal.maghrib,
      isya: jadwal.isya,
      sumber: 'MyQuran'
    };

  } catch (error) {
    console.warn(`Fallback aktif untuk ${kota}: Beralih ke API Aladhan...`);
    
    try {
      // LANGKAH 2: Fallback ke API Cadangan (Aladhan - Global)
      const aladhanRes = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${kota}&country=Indonesia&method=11`);
      const aladhanData = await aladhanRes.json();
      const timings = aladhanData.data.timings;

      return {
        kota: kota,
        imsak: timings.Imsak.split(' ')[0],
        subuh: timings.Fajr.split(' ')[0],
        dzuhur: timings.Dhuhr.split(' ')[0],
        ashar: timings.Asr.split(' ')[0],
        maghrib: timings.Maghrib.split(' ')[0],
        isya: timings.Isha.split(' ')[0],
        sumber: 'Aladhan'
      };
    } catch (fallbackError) {
      return {
        kota: kota,
        imsak: '-',
        subuh: '-',
        dzuhur: '-',
        ashar: '-',
        maghrib: '-',
        isya: '-',
        sumber: 'Error'
      };
    }
  }
}
