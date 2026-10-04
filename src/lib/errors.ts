export function friendlyError(error: unknown): string {
  if (error instanceof Error) {
    const name = error.name;
    const message = error.message || '';
    if (name === 'EmailNotVerifiedError') return message;
    if (name === 'AccountBlockedError') return message;
    if (/Invalid login credentials/i.test(message)) return 'Email atau password belum sesuai.';
    if (/Email not confirmed/i.test(message)) return 'Email belum diverifikasi. Cek inbox dan folder spam.';
    if (/rate limit|too many requests/i.test(message)) return 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.';
    return message;
  }
  return 'Terjadi kesalahan yang belum diketahui. Coba lagi.';
}
