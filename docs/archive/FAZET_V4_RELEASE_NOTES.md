# FAZET V4 — Scroll + Self Signup + Recovery

Basis proyek: FAZET LOP-LOP. `fathur-school-hub` hanya referensi UI/UX.

## UI
- Panel kanan login desktop punya scroll independen.
- Halaman Register, Forgot Password, Reset Password, dan Verify Email juga memakai area kanan yang dapat digulir ketika konten melebihi tinggi layar.
- Panel kiri dan kanan login tetap independent.

## Akun
- User dapat membuat akun sendiri di `/register`.
- Self-signup memakai Supabase Auth dan `preferred_workspace` Fathur/Mazet.
- Trigger SQL membuat/menjaga row `public.users` setelah signup.
- Email confirmation tetap menjadi syarat login.

## Password + unblock
- `Lupa password?` menjadi satu menu untuk reset password dan pemulihan akses akun.
- Login dengan `public.users.status = 'disabled'` menampilkan tautan langsung menuju menu recovery.
- Link recovery dari email membawa user ke `/auth/reset-password`.
- Setelah password baru berhasil disimpan, `public.recover_my_account()` mengaktifkan kembali row milik `auth.uid()` saja.
- Mekanisme ini hanya membuka blokir aplikasi (`public.users.status`). Ban Admin Auth Supabase tetap memerlukan administrator.

## Supabase
Jalankan `SUPABASE_ACCOUNT_RECOVERY_AND_SELF_SIGNUP.sql` pada **BOTH** project Supabase FAZET:
1. project Fathur
2. project Mazet

Jangan menggunakan database referensi `fathur-school-hub`.

Frontend tidak berisi service-role/secret key.
