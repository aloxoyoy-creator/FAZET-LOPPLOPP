import type { FinanceCategory, PaymentMethodOption } from '../types/finance';

export const EXPENSE_CATEGORIES: FinanceCategory[] = [
  {
    id: 'bensin',
    name: 'Bensin & BBM',
    icon: 'Fuel',
    color: '#f97316', // Orange
    textColor: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-500/10 border-orange-500/30',
    type: 'expense',
    examples: 'Pertalite, Pertamax, isi bensin motor/mobil, parkir, tol'
  },
  {
    id: 'jajan',
    name: 'Jajan & Ngemil',
    icon: 'Coffee',
    color: '#ec4899', // Pink
    textColor: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-500/10 border-pink-500/30',
    type: 'expense',
    examples: 'Kopi, boba, snack, roti, es teh, nongkrong'
  },
  {
    id: 'makan',
    name: 'Makan Utama',
    icon: 'Utensils',
    color: '#eab308', // Amber/Yellow
    textColor: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/30',
    type: 'expense',
    examples: 'Sarapan, makan siang, makan malam, warteg, catering'
  },
  {
    id: 'belanja',
    name: 'Belanja & Kebutuhan',
    icon: 'ShoppingBag',
    color: '#8b5cf6', // Violet
    textColor: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-500/10 border-violet-500/30',
    type: 'expense',
    examples: 'Minimarket, sabun, skincare, baju, perlengkapan kamar'
  },
  {
    id: 'kuliah',
    name: 'Kuliah & Pendidikan',
    icon: 'GraduationCap',
    color: '#3b82f6', // Blue
    textColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/30',
    type: 'expense',
    examples: 'SPP/UKT, fotokopi, modul, buku tugas, alat tulis, les'
  },
  {
    id: 'kencan',
    name: 'Kencan & Hiburan (Fazet)',
    icon: 'Heart',
    color: '#f43f5e', // Rose
    textColor: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-500/10 border-rose-500/30',
    type: 'expense',
    examples: 'Jalan bareng, nonton film bioskop, kencan romantis, tiket wisata'
  },
  {
    id: 'tagihan',
    name: 'Tagihan & Utilitas',
    icon: 'Zap',
    color: '#06b6d4', // Cyan
    textColor: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-500/10 border-cyan-500/30',
    type: 'expense',
    examples: 'Pulsa, paket internet/kuota, WiFi, token listrik, streaming'
  },
  {
    id: 'kesehatan',
    name: 'Kesehatan & Obat',
    icon: 'Pill',
    color: '#10b981', // Emerald
    textColor: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/30',
    type: 'expense',
    examples: 'Apotek, vitamin, obat flu/pusing, masker, dokter'
  },
  {
    id: 'transport',
    name: 'Transportasi & Ojol',
    icon: 'Car',
    color: '#6366f1', // Indigo
    textColor: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-500/10 border-indigo-500/30',
    type: 'expense',
    examples: 'Gojek, Grab, Maxim, angkot, bus, servis motor'
  },
  {
    id: 'kado',
    name: 'Kado & Sedekah',
    icon: 'Gift',
    color: '#a855f7', // Purple
    textColor: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/30',
    type: 'expense',
    examples: 'Infaq, sedekah jumat, hadiah ultah, traktiran teman'
  },
  {
    id: 'tabungan',
    name: 'Tabungan & Investasi',
    icon: 'PiggyBank',
    color: '#14b8a6', // Teal
    textColor: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-500/10 border-teal-500/30',
    type: 'both',
    examples: 'Menabung masa depan, reksadana, celengan'
  },
  {
    id: 'lainnya',
    name: 'Lain-lain / Darurat',
    icon: 'Coins',
    color: '#64748b', // Slate
    textColor: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-500/10 border-slate-500/30',
    type: 'expense',
    examples: 'Keperluan mendadak atau pengeluaran tidak terduga'
  }
];

export const INCOME_CATEGORIES: FinanceCategory[] = [
  {
    id: 'uang_saku',
    name: 'Uang Saku / Bulanan',
    icon: 'Wallet',
    color: '#10b981', // Emerald
    textColor: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/30',
    type: 'income',
    examples: 'Kiriman orang tua, jatah bulanan, uang bekal'
  },
  {
    id: 'gaji',
    name: 'Gaji & Honor',
    icon: 'Briefcase',
    color: '#3b82f6', // Blue
    textColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/30',
    type: 'income',
    examples: 'Gaji kerja, honor mengajar/les, part-time'
  },
  {
    id: 'freelance',
    name: 'Freelance & Jasa',
    icon: 'Sparkles',
    color: '#8b5cf6', // Violet
    textColor: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-500/10 border-violet-500/30',
    type: 'income',
    examples: 'Desain, coding, joki tugas, komisi freelance'
  },
  {
    id: 'hadiah',
    name: 'Hadiah & Bonus',
    icon: 'Gift',
    color: '#ec4899', // Pink
    textColor: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-500/10 border-pink-500/30',
    type: 'income',
    examples: 'Kado uang, THR, cashback, rezeki nomplok'
  },
  {
    id: 'pemasukan_lain',
    name: 'Pemasukan Lainnya',
    icon: 'TrendingUp',
    color: '#06b6d4', // Cyan
    textColor: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-500/10 border-cyan-500/30',
    type: 'income',
    examples: 'Penjualan barang bekas, pengembalian dana, dll'
  }
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategoryById(id: string): FinanceCategory {
  const found = ALL_CATEGORIES.find((c) => c.id === id);
  if (found) return found;
  return {
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    icon: 'Coins',
    color: '#64748b',
    textColor: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-500/10 border-slate-500/30',
    type: 'expense'
  };
}

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  { id: 'cash', name: 'Tunai / Cash', type: 'cash', badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  { id: 'qris', name: 'QRIS', type: 'ewallet', badgeColor: 'bg-rose-500/10 text-rose-600 border-rose-500/30' },
  { id: 'bca', name: 'BCA', type: 'bank', badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  { id: 'mandiri', name: 'Mandiri', type: 'bank', badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  { id: 'bri', name: 'BRI', type: 'bank', badgeColor: 'bg-blue-600/10 text-blue-700 border-blue-600/30' },
  { id: 'bni', name: 'BNI', type: 'bank', badgeColor: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  { id: 'seabank', name: 'SeaBank', type: 'bank', badgeColor: 'bg-orange-600/10 text-orange-600 border-orange-600/30' },
  { id: 'gopay', name: 'GoPay', type: 'ewallet', badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  { id: 'ovo', name: 'OVO', type: 'ewallet', badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
  { id: 'dana', name: 'DANA', type: 'ewallet', badgeColor: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  { id: 'shopeepay', name: 'ShopeePay', type: 'ewallet', badgeColor: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  { id: 'kartu', name: 'Kartu Debit/Kredit', type: 'card', badgeColor: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30' },
  { id: 'lainnya', name: 'Lainnya', type: 'other', badgeColor: 'bg-slate-500/10 text-slate-600 border-slate-500/30' }
];

export function getPaymentMethodById(id: string): PaymentMethodOption {
  return PAYMENT_METHODS.find((p) => p.id === id) || {
    id,
    name: id.toUpperCase(),
    type: 'other',
    badgeColor: 'bg-slate-500/10 text-slate-600 border-slate-500/30'
  };
}

export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Rp 0';
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}
