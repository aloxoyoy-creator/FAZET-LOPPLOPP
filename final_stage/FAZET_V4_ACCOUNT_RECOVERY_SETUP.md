# FAZET V4 — Self Signup + Forgot Password + Unblock

## Yang berubah
- Panel kanan login desktop dapat di-scroll sendiri.
- Semua halaman auth (Login, Register, Forgot Password, Reset Password) memiliki scroll vertikal di sisi kanan ketika konten melebihi tinggi layar.
- User dapat membuat akun sendiri melalui `/register`.
- Email verifikasi tetap menjadi syarat login.
- Menu `Lupa password?` menjadi menu pemulihan yang sama untuk password biasa dan akun yang memakai status aplikasi `disabled`.
- Setelah link pemulihan dibuka dan password baru berhasil disimpan, FAZET memanggil `public.recover_my_account()` untuk mengaktifkan kembali row milik `auth.uid()` saja.

## Supabase yang dipakai
Jalankan SQL di bawah ini pada **dua project Supabase FAZET**: project Fathur dan project Mazet. Jangan memakai database referensi `fathur-school-hub`.

File: `SUPABASE_ACCOUNT_RECOVERY_AND_SELF_SIGNUP.sql`

SQL membuat/menyiapkan:
1. `public.users.status`, `workspace_id`, dan `updated_at` bila belum ada.
2. RPC `public.recover_my_account()` dengan `security definer` yang hanya boleh mengubah row milik `auth.uid()`.
3. Trigger `on_auth_user_created_fazet` yang membuat row `public.users` otomatis setelah self-signup Supabase Auth.

## Pengaturan Supabase Auth
- Aktifkan Email provider.
- Atur Site URL / Redirect URLs agar mencakup URL aplikasi FAZET dan route `/auth/reset-password`.
- Setelah user mendaftar, email verifikasi dikirim dan login menunggu `email_confirmed_at`.

## Batasan unblock
Flow ini membuka blokir **status aplikasi** `public.users.status = 'disabled'`. Ban yang dibuat melalui mekanisme Admin Auth Supabase berbeda dan tetap membutuhkan tindakan administrator.

## Keamanan
Frontend hanya menggunakan publishable key. Jangan pernah menaruh service-role/secret key di browser.
