import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';

export interface CityLocation {
  name: string;
  lat: number;
  lng: number;
  timezone: string;
}

export const SUPPORTED_CITIES: CityLocation[] = [
  { name: 'Tuban', lat: -6.8976, lng: 112.0649, timezone: 'WIB' },
  { name: 'Tasikmalaya', lat: -7.3196, lng: 108.2040, timezone: 'WIB' },
  { name: 'Ciamis', lat: -7.3274, lng: 108.3535, timezone: 'WIB' },
];

export interface PrayerWisdom {
  name: string;
  arabic: string;
  hadith: string;
  prepAdvice: string;
  exactAdvice: string;
  icon: string;
}

export const PRAYER_WISDOM: Record<string, PrayerWisdom> = {
  Imsak: {
    name: 'Imsak',
    arabic: 'الإمساك',
    hadith: 'Waktu menahan diri dari hal yang membatalkan puasa sebelum fajar shadiq.',
    prepAdvice: 'Waktu imsak mendekati. Segera selesaikan santap sahur dan bersiap sikat gigi.',
    exactAdvice: 'Waktu Imsak telah tiba. Hentikan makan dan minum, persiapkan diri untuk shalat Subuh.',
    icon: '🌙'
  },
  Subuh: {
    name: 'Subuh',
    arabic: 'صلاة الصبح',
    hadith: '“Dua rakaat fajar (shalat sunnah sebelum subuh) lebih baik dari dunia dan seisinya.” (HR. Muslim No. 725)',
    prepAdvice: 'Waktu sholat Subuh kurang 10 menit lagi. Yuk ambil air wudhu dan bersiap menghadap Allah.',
    exactAdvice: 'Adzan Subuh berkumandang! Awali harimu dengan shalat Subuh berjamaah tepat waktu untuk keberkahan.',
    icon: '🌅'
  },
  Terbit: {
    name: 'Terbit',
    arabic: 'شروق الشمس',
    hadith: 'Matahari mulai terbit di ufuk timur. Waktu sholat subuh telah berakhir.',
    prepAdvice: 'Matahari segera terbit. Pastikan sudah menunaikan shalat Subuh.',
    exactAdvice: 'Matahari telah terbit. Waktu terlarang sholat hingga matahari meninggi (waktu Dhuha).',
    icon: '☀️'
  },
  Dhuha: {
    name: 'Dhuha',
    arabic: 'صلاة الضحى',
    hadith: '“Setiap persendian manusia wajib disedekahi... Dan semua itu cukup digantikan dengan dua rakaat shalat Dhuha.” (HR. Muslim)',
    prepAdvice: 'Waktu Dhuha telah masuk. Sempatkan 2 atau 4 rakaat untuk membuka pintu rezeki dan ketenangan hati.',
    exactAdvice: 'Waktu shalat Dhuha terbaik telah tiba. Rehat sejenak dari aktivitas belajar untuk sujud.',
    icon: '✨'
  },
  Dzuhur: {
    name: 'Dzuhur',
    arabic: 'صلاة الظهر',
    hadith: '“Sesungguhnya pintu-pintu langit dibuka ketika matahari tergelincir, dan aku suka ada amal salehku yang naik saat itu.” (HR. Tirmidzi)',
    prepAdvice: 'Waktu Dzuhur kurang 10 menit lagi. Bersiap istirahat dari tugas & pelajaran siang ini.',
    exactAdvice: 'Adzan Dzuhur telah tiba! Rehatkan pikiran, segarkan diri dengan wudhu, dan tunaikan shalat Dzuhur.',
    icon: '☀️'
  },
  Ashar: {
    name: 'Ashar',
    arabic: 'صلاة العصر',
    hadith: '“Barangsiapa meninggalkan shalat Ashar, maka terhapuslah seluruh amalnya.” (HR. Bukhari No. 553)',
    prepAdvice: '10 menit menjelang Ashar. Jangan tunda sholat Ashar, mari bersiap wudhu.',
    exactAdvice: 'Waktu shalat Ashar telah masuk. Segerakan shalat Ashar di awal waktu agar tidak terlewat.',
    icon: '🌤️'
  },
  Maghrib: {
    name: 'Maghrib',
    arabic: 'صلاة المغرب',
    hadith: '“Umatku akan senantiasa dalam kebaikan selama mereka tidak mengakhirkan shalat Maghrib.” (HR. Abu Dawud)',
    prepAdvice: '10 menit menuju Maghrib. Perbanyak doa di sore hari dan segerakan persiapan sholat.',
    exactAdvice: 'Adzan Maghrib berkumandang! Selamat berbuka bagi yang berpuasa dan mari segerakan shalat Maghrib.',
    icon: '🌇'
  },
  Isya: {
    name: 'Isya',
    arabic: 'صلاة العشاء',
    hadith: '“Seandainya mereka mengetahui keutamaan shalat Isya dan Subuh, niscaya mereka mendatanginya walau dengan merangkak.” (HR. Bukhari)',
    prepAdvice: '10 menit menjelang Isya. Selesaikan santap malam dan siapkan diri menghadap Illahi.',
    exactAdvice: 'Waktu shalat Isya telah tiba! Lengkapi ibadah malam dengan sholat Isya dan sholat sunnah witir.',
    icon: '🌌'
  }
};

function formatTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function calculateOfflinePrayerTimes(cityName: string, targetDate: Date = new Date()) {
  const normalized = cityName.toLowerCase().trim();
  const cityData = SUPPORTED_CITIES.find(c => c.name.toLowerCase() === normalized) || SUPPORTED_CITIES[0];

  const coordinates = new Coordinates(cityData.lat, cityData.lng);
  // Singapore calculation method matches standard Indonesian Kemenag (Subuh 20°, Isya 18°)
  const params = CalculationMethod.Singapore();
  
  const prayerTimes = new PrayerTimes(coordinates, targetDate, params);

  const imsakDate = new Date(prayerTimes.fajr.getTime() - 10 * 60000);
  const dhuhaDate = new Date(prayerTimes.sunrise.getTime() + 20 * 60000);

  return {
    kota: cityData.name,
    tanggal: targetDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    imsak: formatTime(imsakDate),
    subuh: formatTime(prayerTimes.fajr),
    terbit: formatTime(prayerTimes.sunrise),
    dhuha: formatTime(dhuhaDate),
    dzuhur: formatTime(prayerTimes.dhuhr),
    ashar: formatTime(prayerTimes.asr),
    maghrib: formatTime(prayerTimes.maghrib),
    isya: formatTime(prayerTimes.isha),
    sumber: 'Adhan (Kemenag RI Offline Calculation)'
  };
}

export async function fetchJadwalKota(kota: string, targetDate: Date = new Date()) {
  return calculateOfflinePrayerTimes(kota, targetDate);
}
