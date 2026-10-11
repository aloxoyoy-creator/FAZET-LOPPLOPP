export interface ExamDaySchedule {
  hariKe: number;
  hari: string;
  tanggal: string;
  tanggalFormatted: string;
  mulaiWib: string;
  perkiraanSelesaiWib: string;
  mapel: string;
  rincian: string;
  totalMenit: number;
  sesi: number;
  colorTone: string;
  badgeLabel: string;
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
    rincian: "Latihan 5 menit + tes 75 menit (30 soal) + Survei Karakter 25 menit. Total sekitar 105 menit.",
    totalMenit: 105,
    sesi: 1,
    colorTone: "from-blue-600 to-cyan-500",
    badgeLabel: "Hari Ke-1"
  },
  {
    hariKe: 2,
    hari: "Selasa",
    tanggal: "2026-10-27",
    tanggalFormatted: "Selasa, 27 Okt 2026",
    mulaiWib: "07.00",
    perkiraanSelesaiWib: "08.45",
    mapel: "Bahasa Inggris Wajib",
    rincian: "Latihan 5 menit + tes 75 menit (30 soal) + Survei Lingkungan Belajar 25 menit. Total sekitar 105 menit.",
    totalMenit: 105,
    sesi: 1,
    colorTone: "from-indigo-600 to-violet-500",
    badgeLabel: "Hari Ke-2"
  },
  {
    hariKe: 3,
    hari: "Rabu",
    tanggal: "2026-10-28",
    tanggalFormatted: "Rabu, 28 Okt 2026",
    mulaiWib: "07.00",
    perkiraanSelesaiWib: "08.20",
    mapel: "Matematika Wajib dan Numerasi",
    rincian: "Latihan 5 menit + tes 75 menit (25 soal). Total sekitar 80 menit.",
    totalMenit: 80,
    sesi: 1,
    colorTone: "from-emerald-600 to-teal-500",
    badgeLabel: "Hari Ke-3"
  },
  {
    hariKe: 4,
    hari: "Kamis",
    tanggal: "2026-10-29",
    tanggalFormatted: "Kamis, 29 Okt 2026",
    mulaiWib: "07.00",
    perkiraanSelesaiWib: "09.05",
    mapel: "Mapel Pilihan 1 dan 2: Matematika Tingkat Lanjut dan Bahasa Inggris Tingkat Lanjut (urutan sesuai kartu peserta)",
    rincian: "Latihan 5 menit + pilihan 1 selama 60 menit (25 soal) + pilihan 2 selama 60 menit (25 soal). Total sekitar 125 menit.",
    totalMenit: 125,
    sesi: 1,
    colorTone: "from-amber-600 to-rose-500",
    badgeLabel: "Hari Ke-4"
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
    status: "ongoing"
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
