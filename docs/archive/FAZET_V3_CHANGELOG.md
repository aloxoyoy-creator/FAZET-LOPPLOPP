# FAZET LOP-LOP — Dual Profile Home V3

Basis utama: **FAZETT LOPP LOPP**.
Referensi UI/UX: **fathur-school-hub**.

## Perubahan utama
- Source aplikasi lengkap dikembalikan ke `src/` menggunakan UI/UX referensi Fathur School Hub.
- Fathur dan Mazet tetap menjadi dua workspace dengan session/database terpisah.
- Dashboard memakai struktur lengkap referensi: agenda, task, insights, academic command center, smart advisor, schedule, time system, dan panel pendukung lainnya.
- Scroll utama diperbaiki pada level `html/body/#root/AppShell/main`; halaman utama tidak dikunci ke viewport.
- Sidebar dan header mengikuti shell referensi, ditambah indikator workspace aktif Fathur/Mazet dan switcher sesi.
- Seluruh menu legacy tetap dipertahankan dan tidak disembunyikan berdasarkan workspace.
- Login/forgot-password FAZET V9 tetap dipertahankan sebagai asset yang dapat dipanggil dari source build.
- Notes legacy FAZET diintegrasikan kembali ke source.
- Original files/build sebelum rebuild disimpan di `legacy_preserved/baseline_before_home_v3/`.

## Preservasi
File-file asli yang menjadi basis sebelum rebuild tidak dihapus; versi sebelum perubahan disimpan di folder preservasi di atas.

## Validasi
- Struktur source dan import relatif diperiksa secara statis.
- TypeScript compiler global tersedia, tetapi environment tidak memiliki seluruh `@types/*` dependency yang diperlukan sehingga `tsc -b` belum dapat dinyatakan lulus penuh di lingkungan pemeriksaan ini.
- Jalankan `npm install` lalu `npm run build` pada mesin pengembangan untuk menghasilkan `dist/` production terbaru dari source V3.
