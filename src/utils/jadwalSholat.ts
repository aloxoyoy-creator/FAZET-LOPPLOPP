import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';

const CITIES = [
  { name: 'Ciamis', lat: -7.3274, lng: 108.3535 },
  { name: 'Tasikmalaya', lat: -7.3196, lng: 108.2040 },
  { name: 'Tuban', lat: -6.8976, lng: 112.0649 }
];

function formatTime(date: Date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export async function fetchJadwalKota(kota: string) {
  return new Promise((resolve) => {
    try {
      const cityData = CITIES.find(c => c.name === kota);
      if (!cityData) {
        throw new Error("Kota tidak didukung secara lokal");
      }

      const coordinates = new Coordinates(cityData.lat, cityData.lng);
      const date = new Date();
      
      // Metode Singapore menggunakan 20° Subuh dan 18° Isya, yang sama persis dengan standar Kemenag RI
      const params = CalculationMethod.Singapore();
      
      const prayerTimes = new PrayerTimes(coordinates, date, params);
      
      // Imsak di Indonesia secara baku adalah 10 menit sebelum waktu Subuh
      const imsak = new Date(prayerTimes.fajr.getTime() - 10 * 60000);

      resolve({
        kota,
        imsak: formatTime(imsak),
        subuh: formatTime(prayerTimes.fajr),
        dzuhur: formatTime(prayerTimes.dhuhr),
        ashar: formatTime(prayerTimes.asr),
        maghrib: formatTime(prayerTimes.maghrib),
        isya: formatTime(prayerTimes.isha),
        sumber: 'Adhan (Offline)'
      });
    } catch (e) {
      resolve({
        kota,
        imsak: '-',
        subuh: '-',
        dzuhur: '-',
        ashar: '-',
        maghrib: '-',
        isya: '-',
        sumber: 'Error'
      });
    }
  });
}
