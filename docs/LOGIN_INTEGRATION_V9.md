# Login baru — FAZET v9 "FAZET HEART" (terintegrasi)

## Yang berubah
| Bagian | Perubahan |
|---|---|
| `/login` | Diganti total dengan desain FAZET v9 (tema otomatis Pagi/Siang/Sore/Malam WIB, dua profil Fathur & Mazet, tab Fitur/Tutorial). |
| `/forgot-password` | Memakai layar "Atur ulang password" dari desain baru (bisa pilih profil Fathur/Mazet). |
| `/register`, `/verify-email`, `/auth/reset-password` | Fungsi tidak diubah. Tampilan diselaraskan (font Plus Jakarta Sans, latar & kartu senada, judul "Buat akun FAZET"). Bug ikon menabrak teks di kolom input ikut diperbaiki. |
| Nama merek di halaman auth | "FAZET SchoolHub · Workspace Fathur & Mazet". |

## Yang tersambung ke aplikasi (bukan lagi mode preview)
- **Login** → `useAuth().login(email, password, remember, workspace)`: Supabase Auth per workspace (project Fathur / Mazet), wajib email terverifikasi, mencatat sesi & aktivitas login seperti sebelumnya.
- **Lupa password** → `resetPassword(email, workspace)` dengan redirect ke `/auth/reset-password?workspace=…`.
- **Sesi aktif** → kalau Fathur/Mazet sudah punya sesi di perangkat, titik hijau menyala, statistik "Sedang aktif" terisi, dan muncul tombol **Buka workspace** tanpa mengetik ulang password.
- **Ganti akun** → `logout()` untuk workspace yang baru dipakai.
- **Setelah login** → kembali ke halaman asal (`location.state.from`) atau `/`.
- **Email belum diverifikasi** → pesan + tautan langsung ke `/verify-email?email=…&workspace=…`.
- Tautan **Buat akun siswa** dan **Belum verifikasi email?** ditambahkan ke desain (ada di login lama).
- Email terakhir per profil diingat di perangkat **hanya** jika "Ingat perangkat ini" dicentang. Password tidak pernah disimpan.
- Daftar fitur & tutorial disesuaikan dengan aplikasi sekarang (Lopp Lopp, FAZET AI, MediaBox & Watch Party, My Minee, Aktivitas & Keamanan, dst.). Teks "mode preview / backend nanti" dihapus.

## Perbaikan dari file desain asli
- `setWho` dipanggil tapi tidak pernah didefinisikan (ReferenceError yang menghentikan sisa script) → dirapikan.
- Percobaan gagal kini dihitung setelah verifikasi (sebelumnya percobaan ke-5 diblokir sebelum dicoba). Kunci sementara 20 detik setelah 5 kali gagal; rate-limit sungguhan tetap di Supabase.
- Scroll roda mouse ke panel kiri diperbaiki agar tetap jalan di dalam Shadow DOM.
- Semua timer & listener dibersihkan saat halaman login ditinggalkan.

## File
- `dist/assets/fazet-login-9.js` — modul login (Shadow DOM, CSS-nya tidak bentrok dengan Tailwind).
- `dist/assets/fazet-auth-theme.css` — tema untuk halaman auth lain.
- `dist/assets/index-FZlogin9.js` — bundle aplikasi dengan `zoe` (Login) dan `Boe` (Lupa password) diganti. `dist/index.html` sudah menunjuk ke sini.
- `dist/sw.js` — nama cache dinaikkan ke `v72-login9` + cache lama dihapus saat aktivasi.
- `vercel.json` — CSP diperluas: `style-src … https://fonts.googleapis.com` dan `font-src … https://fonts.gstatic.com` (tanpa ini font desain baru diblokir; font lama Google Fonts di index.html juga ikut terblokir sebelumnya).
- `src_login_v9/` — sumber modul (CSS ter-scope, markup, runtime, skrip build/patch) + `Login.page.tsx` sebagai referensi.
- `legacy_preserved/dist_before_login_v9/` — bundle, index.html, sw.js, vercel.json, dan komponen login lama (`OLD_LOGIN_COMPONENTS_zoe_Boe.js`) untuk rollback.

## Menjalankan tanpa src/
- `npm install` lalu `npm run dev` (atau `npm start`) menyajikan folder `dist/` lewat `vite preview` di http://localhost:5173.
- `npm run build` hanya menampilkan pesan info; build asli butuh folder `src/` (`npm run build:src` / `dev:src`).
- Vercel: `vercel.json` memakai `dist/` apa adanya, tanpa build dan tanpa install.

## Rollback cepat
Kembalikan `dist/index.html`, `dist/sw.js`, dan `vercel.json` dari `legacy_preserved/dist_before_login_v9/`, lalu salin `assets/index-BBBMkggZ.js` kembali ke `dist/assets/`.

## Catatan penting
1. Zip yang diterima **tidak memuat folder `src/`** (hanya `dist/` hasil build dan sumber lama di `legacy_preserved/`). Karena itu integrasi dilakukan pada `dist/`. Saat `src/` asli tersedia, pakai `src_login_v9/Login.page.tsx` lalu `npm run build`.
2. Untuk aplikasi Android: jalankan `npx cap sync android` setelah deploy/build agar aset terbaru masuk ke APK.
3. Diuji di Chromium headless dengan Supabase di-mock: login berhasil/gagal, email belum verifikasi, kunci 5 kali gagal, lupa password, navigasi ke daftar, sesi aktif → Buka workspace, Ganti akun, mobile & desktop. **Belum diuji** ke server Supabase sungguhan, di Safari/iOS, maupun di WebView Android.
