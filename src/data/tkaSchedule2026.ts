export interface ExamStepDetail {
  name: string;
  dur: string;
  minutes: number;
  questions?: number;
}

export interface ExamDaySchedule {
  hariKe: number;
  hari: string;
  tanggal: string;
  tanggalFormatted: string;
  mulaiWib: string;
  perkiraanSelesaiWib: string;
  mapel: string;
  shortTitle: string;
  subtitle: string;
  rincian: string;
  totalMenit: number;
  totalSoal: number;
  sesi: number;
  colorTone: string;
  badgeLabel: string;
  chips: string[];
  steps: ExamStepDetail[];
  persiapanTips: string;
}

export interface StageSchedule {
  id: string;
  nama: string;
  mulai: string;
  selesai: string;
  rentangFormatted: string;
  catatan?: string;
  status: 'completed' | 'ongoing' | 'crucial' | 'upcoming';
}

export const TKA_SCHEDULE_2026_META = {
  judul: "Jadwal TKA SMA 2026 - Gelombang 1, Sesi 1 (WIB)",
  subjudul: "Bahasa Indonesia, Matematika, Bahasa Inggris, Matematika Tingkat Lanjut, Bahasa Inggris Tingkat Lanjut",
  targetDateStr: "2026-10-26T07:00:00+07:00",
  endDateStr: "2026-10-29T09:05:00+07:00",
  disusun: "2026-10-11",
  peserta: "SMA/MA, 3 mapel wajib + Matematika Tingkat Lanjut + Bahasa Inggris Tingkat Lanjut | Gelombang 1 | Sesi 1 | WIB",
  zonaWaktu: "WIB",
  catatanDurasi: "Perkiraan selesai dihitung dari total durasi (latihan, tes, dan survei). Jam pada kartu peserta yang berlaku.",
  catatanSumber: "Dirangkum dari media pendidikan; bukan dokumen resmi. Tanggal dan jam pada kartu peserta serta portal resmi TKA Kemendikdasmen yang berlaku."
};

export const EXAM_DAYS_2026: ExamDaySchedule[] = [
  {
    hariKe: 1,
    hari: "Senin",
    tanggal: "2026-10-26",
    tanggalFormatted: "Senin, 26 Okt 2026",
    mulaiWib: "07.00",
    perkiraanSelesaiWib: "08.45",
    mapel: "Bahasa Indonesia Wajib dan Literasi Membaca",
    shortTitle: "Bahasa Indonesia Wajib & Literasi",
    subtitle: "Literasi Membaca & Survei Karakter",
    rincian: "Latihan 5 menit + tes 75 menit (30 soal) + Survei Karakter 25 menit. Total sekitar 105 menit.",
    totalMenit: 105,
    totalSoal: 30,
    sesi: 1,
    colorTone: "from-blue-600 to-cyan-500",
    badgeLabel: "Hari Ke-1",
    chips: ["105 Menit", "30 Soal", "Survei Karakter"],
    steps: [
      { name: "Latihan Ujian CBT", dur: "5 Menit", minutes: 5 },
      { name: "Tes Literasi Membaca (30 Soal)", dur: "75 Menit", minutes: 75, questions: 30 },
      { name: "Survei Karakter", dur: "25 Menit", minutes: 25 }
    ],
    persiapanTips: "Siapkan Kartu Peserta Ujian, KTP/Kartu Pelajar, dan sarapan pagi sebelum pukul 06.15 WIB. Fokus pada ide pokok paragraf dan pernyataan sesuai teks."
  },
  {
    hariKe: 2,
    hari: "Selasa",
    tanggal: "2026-10-27",
    tanggalFormatted: "Selasa, 27 Okt 2026",
    mulaiWib: "07.00",
    perkiraanSelesaiWib: "08.45",
    mapel: "Bahasa Inggris Wajib",
    shortTitle: "Bahasa Inggris Wajib",
    subtitle: "Literasi Bahasa Inggris & Sulingjar",
    rincian: "Latihan 5 menit + tes 75 menit (30 soal) + Survei Lingkungan Belajar 25 menit. Total sekitar 105 menit.",
    totalMenit: 105,
    totalSoal: 30,
    sesi: 1,
    colorTone: "from-indigo-600 to-violet-500",
    badgeLabel: "Hari Ke-2",
    chips: ["105 Menit", "30 Soal", "Survei Lingkungan"],
    steps: [
      { name: "Latihan Ujian CBT", dur: "5 Menit", minutes: 5 },
      { name: "Tes Bahasa Inggris (30 Soal)", dur: "75 Menit", minutes: 75, questions: 30 },
      { name: "Survei Lingkungan Belajar (Sulingjar)", dur: "25 Menit", minutes: 25 }
    ],
    persiapanTips: "Gunakan teknik skimming & scanning pada teks bacaan bahasa Inggris. Baca pertanyaan terlebih dahulu sebelum membaca wacana panjang."
  },
  {
    hariKe: 3,
    hari: "Rabu",
    tanggal: "2026-10-28",
    tanggalFormatted: "Rabu, 28 Okt 2026",
    mulaiWib: "07.00",
    perkiraanSelesaiWib: "08.20",
    mapel: "Matematika Wajib dan Numerasi",
    shortTitle: "Matematika Wajib & Numerasi",
    subtitle: "Tes Penalaran Numerasi Matematika",
    rincian: "Latihan 5 menit + tes 75 menit (25 soal). Total sekitar 80 menit.",
    totalMenit: 80,
    totalSoal: 25,
    sesi: 1,
    colorTone: "from-emerald-600 to-teal-500",
    badgeLabel: "Hari Ke-3",
    chips: ["80 Menit", "25 Soal", "Fokus Numerasi"],
    steps: [
      { name: "Latihan Ujian CBT", dur: "5 Menit", minutes: 5 },
      { name: "Tes Numerasi Matematika (25 Soal)", dur: "75 Menit", minutes: 75, questions: 25 }
    ],
    persiapanTips: "Pastikan istirahat cukup malam ini. Kerjakan soal numerasi yang paling mudah terlebih dahulu dan manfaatkan fitur Ragu-ragu bila perhitungan memakan waktu > 3 menit."
  },
  {
    hariKe: 4,
    hari: "Kamis",
    tanggal: "2026-10-29",
    tanggalFormatted: "Kamis, 29 Okt 2026",
    mulaiWib: "07.00",
    perkiraanSelesaiWib: "09.05",
    mapel: "Mapel Pilihan 1 dan 2: Matematika Tingkat Lanjut dan Bahasa Inggris Tingkat Lanjut (urutan sesuai kartu peserta)",
    shortTitle: "Mapel Pilihan 1 & 2 (Lanjut)",
    subtitle: "Matematika & B. Inggris Tingkat Lanjut",
    rincian: "Latihan 5 menit + pilihan 1 selama 60 menit (25 soal) + pilihan 2 selama 60 menit (25 soal). Total sekitar 125 menit.",
    totalMenit: 125,
    totalSoal: 50,
    sesi: 1,
    colorTone: "from-amber-600 to-rose-500",
    badgeLabel: "Hari Ke-4",
    chips: ["125 Menit", "2x 25 Soal", "Mapel Peminatan"],
    steps: [
      { name: "Latihan Ujian CBT", dur: "5 Menit", minutes: 5 },
      { name: "Pilihan 1: MTK Tingkat Lanjut (25 Soal)", dur: "60 Menit", minutes: 60, questions: 25 },
      { name: "Pilihan 2: B. Inggris Tingkat Lanjut (25 Soal)", dur: "60 Menit", minutes: 60, questions: 25 }
    ],
    persiapanTips: "Hari terakhir! Durasi 125 menit (2 jam 5 menit) membutuhkan stamina ekstra. Jaga fokus untuk 2x 25 soal mapel tingkat lanjut."
  }
];

export const TKA_STAGES_2026: StageSchedule[] = [
  {
    id: "pendaftaran",
    nama: "Pendaftaran peserta",
    mulai: "2026-07-27",
    selesai: "2026-09-27",
    rentangFormatted: "27 Jul 2026 s.d. 27 Sep 2026",
    status: "completed"
  },
  {
    id: "simulasi",
    nama: "Simulasi TKA nasional",
    mulai: "2026-09-21",
    selesai: "2026-09-27",
    rentangFormatted: "21 Sep 2026 s.d. 27 Sep 2026",
    status: "completed"
  },
  {
    id: "gladi",
    nama: "Gladi bersih Gelombang 1",
    mulai: "2026-10-05",
    selesai: "2026-10-11",
    rentangFormatted: "5 Okt 2026 s.d. 11 Okt 2026",
    status: "completed"
  },
  {
    id: "pelaksanaan_gel_1",
    nama: "Pelaksanaan Gelombang 1",
    mulai: "2026-10-26",
    selesai: "2026-10-29",
    rentangFormatted: "26 Okt 2026 s.d. 29 Okt 2026",
    status: "crucial"
  },
  {
    id: "gel_khusus_wajib",
    nama: "Gelombang khusus mapel wajib",
    mulai: "2026-10-31",
    selesai: "2026-11-01",
    rentangFormatted: "31 Okt 2026 s.d. 1 Nov 2026",
    status: "upcoming"
  },
  {
    id: "gel_khusus_pilihan",
    nama: "Gelombang khusus mapel pilihan",
    mulai: "2026-11-07",
    selesai: "2026-11-08",
    rentangFormatted: "7 Nov 2026 s.d. 8 Nov 2026",
    status: "upcoming"
  },
  {
    id: "susulan",
    nama: "TKA susulan",
    mulai: "2026-11-16",
    selesai: "2026-11-29",
    rentangFormatted: "16 Nov 2026 s.d. 29 Nov 2026",
    catatan: "Satu sumber merinci: mapel wajib 21-22 Nov, mapel pilihan 28-29 Nov",
    status: "upcoming"
  },
  {
    id: "pengumuman",
    nama: "Pengumuman hasil",
    mulai: "2026-12-23",
    selesai: "2026-12-23",
    rentangFormatted: "23 Des 2026",
    catatan: "Menurut dua sumber media; konfirmasi di portal resmi",
    status: "upcoming"
  }
];

export function getExamDayByDate(dateStr: string): ExamDaySchedule | undefined {
  return EXAM_DAYS_2026.find((d) => d.tanggal === dateStr);
}

export function getActiveOrNextExamDay(now: Date = new Date()): {
  exam: ExamDaySchedule;
  state: 'before_day' | 'pre_session' | 'in_session' | 'completed_all';
  targetTimestamp: number;
} {
  for (const day of EXAM_DAYS_2026) {
    const startStr = `${day.tanggal}T${day.mulaiWib.replace('.', ':')}:00+07:00`;
    const endStr = `${day.tanggal}T${day.perkiraanSelesaiWib.replace('.', ':')}:00+07:00`;
    const startTs = new Date(startStr).getTime();
    const endTs = new Date(endStr).getTime();
    const nowTs = now.getTime();

    const todayWibStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);

    if (nowTs >= startTs && nowTs <= endTs) {
      return { exam: day, state: 'in_session', targetTimestamp: endTs };
    }
    if (nowTs < startTs) {
      return {
        exam: day,
        state: todayWibStr === day.tanggal ? 'pre_session' : 'before_day',
        targetTimestamp: startTs,
      };
    }
  }

  const lastExam = EXAM_DAYS_2026[EXAM_DAYS_2026.length - 1];
  const lastEndTs = new Date(`${lastExam.tanggal}T${lastExam.perkiraanSelesaiWib.replace('.', ':')}:00+07:00`).getTime();
  return { exam: lastExam, state: 'completed_all', targetTimestamp: lastEndTs };
}

/**
 * Automatic Friday Expiration Rule:
 * TKA SMA 2026 runs Monday (26 Oct 2026) through Thursday (29 Oct 2026).
 * Starting Friday (30 Oct 2026 at 00:00 WIB) or any Friday onwards after the exam period,
 * all TKA features, menus, banners, and alarms automatically expire and hide.
 */
export function isTkaFeatureActive(now: Date = new Date()): boolean {
  const todayWibStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  const weekdayWib = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
  }).format(now);

  // Wajib terhapus otomatis mulai Jumat setelah rangkaian TKA (2026-10-30 ke atas) atau jika hari Jumat
  if (todayWibStr >= '2026-10-30' || weekdayWib.toLowerCase() === 'jumat') {
    return false;
  }

  return true;
}

