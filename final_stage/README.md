# FAZET LOPP LOPP v2

Satu aplikasi (PWA + Android via Capacitor) untuk **Fathur** dan **Mazet**.
Basis: backend, dua workspace Supabase, bridge Lopp Lopp, dan UI/UX login **FAZET HEART (v9)**.
Ditambah seluruh fitur **Fathur School Hub**, tema yang dikembangkan, dan **tanpa lokasi & absensi**.

## Fitur
Beranda (jam, ringkasan produktivitas, pintasan) · Ruang Kita (chat realtime + AI) · FAZET AI · My Minee ·
Jadwal Sekolah · Jadwal Les · Academic Timeline/Kalender · Tugas (detail, AI assistant, ringkasan PDF) ·
Catatan · Focus Mode + streak · Insights · Pencarian · Notifikasi · Aktivitas & Perangkat ·
TimeBox · MediaBox · Watch Party/Remote · Kartu Digital · Profil · Pengaturan · Admin Center (20+ halaman).
Command palette: `Ctrl/⌘ + K`.

## Dihapus total
Absensi digital (QR/NFC/kartu fisik), lokasi/GPS, geofence, rute/journey, Google Maps, dan paket `@capgo/capacitor-nfc`.
Izin Android lokasi & NFC dibuang. Migrasi `0028` menghapus tabel/fungsi terkait dari database lama.

## Tema (Pengaturan → Tema & Visual)
- Mode: System / Light / Dark
- 14 palet aksen: Red Pen, Ledger Blue, Ochre, Forest Ink, Fathur, Mazet, **Lopp Lopp** (gradien dua warna), Sakura, Ocean, Sunset, Midnight, Matcha, Lavender, Mono
- Bentuk sudut: Tajam / Lembut / Bulat · Ukuran huruf: Kecil / Normal / Besar
- Ambience: Polos / Aurora / Grain / Bintang
- Tersimpan di perangkat (tanpa kilatan saat buka) dan di tabel `settings` (sinkron antar perangkat).

## Menjalankan
```bash
npm install
npm run typecheck
npm run build
```
Isi `.env` dari `.env.example`.

## Database (wajib dijalankan di KEDUA project Supabase)
Jalankan `supabase/migrations/*.sql` berurutan. **`0028`** wajib: membuang tabel lokasi/absen dan
memperbaiki constraint `accent_color` (sebelumnya hanya `blue/violet/cyan/emerald`, padahal aplikasi memakai
`redpen/ledger/ochre/forest`, sehingga penyimpanan aksen ditolak database).

Edge functions: `admin-users`, `daily-digest`, `study-advisor`. Bridge `cross-bridge` dan folder `ops/`
yang disebut README FAZET lama **tidak ada** di ZIP yang diunggah, jadi tidak ikut di sini.

Catatan lama ada di `docs/archive/`.
