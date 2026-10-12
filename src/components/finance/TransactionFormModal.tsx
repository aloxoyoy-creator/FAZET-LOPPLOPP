import { useState, useEffect, useRef } from 'react';
import {
  Upload,
  X,
  Camera,
  Check,
  CreditCard,
  Building2,
  Calendar,
  Clock,
  FileText,
  Sparkles,
  Fuel,
  Coffee,
  Utensils,
  ShoppingBag,
  GraduationCap,
  Heart,
  Zap,
  Pill,
  Car,
  Gift,
  PiggyBank,
  Coins,
  Wallet,
  Briefcase,
  TrendingUp,
  Receipt
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
  formatRupiah
} from '../../data/financeCategories';
import { uploadReceipt } from '../../services/financeService';
import type { FinanceTransaction, TransactionType, FinanceWorkspace } from '../../types/finance';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<FinanceTransaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<unknown>;
  initialData?: FinanceTransaction | null;
  defaultType?: TransactionType;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  bensin: Fuel,
  jajan: Coffee,
  makan: Utensils,
  belanja: ShoppingBag,
  kuliah: GraduationCap,
  kencan: Heart,
  tagihan: Zap,
  kesehatan: Pill,
  transport: Car,
  kado: Gift,
  tabungan: PiggyBank,
  lainnya: Coins,
  uang_saku: Wallet,
  gaji: Briefcase,
  freelance: Sparkles,
  hadiah: Gift,
  pemasukan_lain: TrendingUp
};

export default function TransactionFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultType = 'expense'
}: Props) {
  const { user } = useAuth();
  const { workspaceId: currentWorkspace } = useWorkspace();

  const [type, setType] = useState<TransactionType>(defaultType);
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState('jajan');
  const [description, setDescription] = useState('');
  const [merchant, setMerchant] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [workspace, setWorkspace] = useState<FinanceWorkspace>('fathur');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [notes, setNotes] = useState('');

  // Receipt upload state
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);
  const [receiptName, setReceiptName] = useState<string | undefined>(undefined);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initialData if edit mode
  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmountStr(Math.round(initialData.amount).toString());
      setCategory(initialData.category);
      setDescription(initialData.description);
      setMerchant(initialData.merchant || '');
      setPaymentMethod(initialData.paymentMethod);
      setWorkspace(initialData.workspaceId);
      setDate(initialData.transactionDate);
      setTime(initialData.transactionTime || '12:00');
      setNotes(initialData.notes || '');
      setReceiptUrl(initialData.receiptUrl);
      setReceiptName(initialData.receiptName);
    } else {
      setType(defaultType);
      setAmountStr('');
      setCategory(defaultType === 'expense' ? 'bensin' : 'uang_saku');
      setDescription('');
      setMerchant('');
      setPaymentMethod('cash');
      setWorkspace((currentWorkspace as FinanceWorkspace) || 'fathur');
      setDate(new Date().toISOString().slice(0, 10));
      const d = new Date();
      setTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
      setNotes('');
      setReceiptUrl(undefined);
      setReceiptName(undefined);
    }
    setReceiptError(null);
  }, [initialData, defaultType, currentWorkspace, isOpen]);

  // When type changes, ensure category matches type
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense' && !EXPENSE_CATEGORIES.some((c) => c.id === category)) {
      setCategory('bensin');
    } else if (newType === 'income' && !INCOME_CATEGORIES.some((c) => c.id === category)) {
      setCategory('uang_saku');
    }
  };

  // Handle amount formatting
  const handleAmountChange = (val: string) => {
    const raw = val.replace(/\D/g, '');
    setAmountStr(raw);
  };

  const addQuickAmount = (delta: number) => {
    const current = Number(amountStr) || 0;
    setAmountStr(String(current + delta));
  };

  // Handle Receipt Upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setReceiptError('File harus berupa gambar (JPG, PNG, atau WEBP).');
      return;
    }

    setUploadingReceipt(true);
    setReceiptError(null);
    try {
      const res = await uploadReceipt(file, user?.id);
      setReceiptUrl(res.url);
      setReceiptName(res.name);
    } catch (err: unknown) {
      setReceiptError((err as Error).message || 'Gagal mengunggah gambar bukti');
    } finally {
      setUploadingReceipt(false);
    }
  };

  const removeReceipt = () => {
    setReceiptUrl(undefined);
    setReceiptName(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(amountStr);
    if (!numericAmount || numericAmount <= 0) {
      alert('Masukkan nominal transaksi yang valid.');
      return;
    }
    if (!description.trim()) {
      alert('Tulis keterangan transaksi terlebih dahulu.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        type,
        amount: numericAmount,
        category,
        categoryLabel: '',
        description: description.trim(),
        merchant: merchant.trim() || undefined,
        paymentMethod,
        workspaceId: workspace,
        transactionDate: date,
        transactionTime: time,
        receiptUrl,
        receiptName,
        notes: notes.trim() || undefined
      });
      onClose();
    } catch {
      // toast already handled
    } finally {
      setSubmitting(false);
    }
  };

  const currentCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Catatan Keuangan' : 'Catat Transaksi Baru'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type Toggle Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-[var(--tf-border)]">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              type === 'expense'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            💸 Pengeluaran (Expense)
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              type === 'income'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            💰 Pemasukan (Income)
          </button>
        </div>

        {/* Nominal Input (Large Hero Style) */}
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-[var(--tf-text-muted)] mb-1.5">
            Nominal Transaksi (Rp)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg sm:text-xl font-black text-[var(--tf-text-muted)]">
              Rp
            </span>
            <input
              type="text"
              inputMode="numeric"
              required
              value={amountStr ? Number(amountStr).toLocaleString('id-ID') : ''}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0"
              className="w-full pl-14 pr-4 py-3 sm:py-3.5 text-2xl sm:text-3xl font-black font-mono rounded-2xl border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] text-[var(--tf-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
            />
          </div>

          {/* Quick Amount Pills */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {[10000, 20000, 50000, 100000, 200000].map((quick) => (
              <button
                key={quick}
                type="button"
                onClick={() => addQuickAmount(quick)}
                className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-xl bg-[var(--tf-bg-subtle)] hover:bg-[var(--tf-border)] border border-[var(--tf-border)] text-[var(--tf-text-secondary)] transition-colors active:scale-95"
              >
                +{formatRupiah(quick)}
              </button>
            ))}
            {amountStr && (
              <button
                type="button"
                onClick={() => setAmountStr('')}
                className="text-[10px] uppercase font-bold px-2 py-1 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors ml-auto"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Category Selector Grid */}
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-[var(--tf-text-muted)] mb-2">
            Pilih Kategori {type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 rounded-2xl border border-[var(--tf-border)] bg-[var(--tf-bg-subtle)]/40 scrollbar-hide">
            {currentCategories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id] || Coins;
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold ring-1 ring-blue-500 shadow-xs'
                      : 'border-transparent bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span
                    className="p-1.5 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                  >
                    <Icon size={16} />
                  </span>
                  <span className="text-xs truncate">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description & Merchant Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-[var(--tf-text-muted)] mb-1">
              Keterangan Transaksi *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === 'expense' ? 'Contoh: Isi bensin pertalite motor' : 'Contoh: Uang saku bulanan'}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] text-[var(--tf-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-[var(--tf-text-muted)] mb-1">
              Merchant / Tempat (Opsional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Building2 size={14} />
              </span>
              <input
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="Contoh: SPBU Pertamina / Mixue"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] text-[var(--tf-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Payment Method & Workspace Target */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-[var(--tf-text-muted)] mb-1">
              Metode Pembayaran
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <CreditCard size={14} />
              </span>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] text-[var(--tf-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-[var(--tf-text-muted)] mb-1">
              Milik Siapa / Akun
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['fathur', 'mazet', 'joint'] as const).map((ws) => (
                <button
                  key={ws}
                  type="button"
                  onClick={() => setWorkspace(ws)}
                  className={`py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                    workspace === ws
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'border-[var(--tf-border)] bg-[var(--tf-bg-subtle)] text-[var(--tf-text-muted)] hover:bg-[var(--tf-border)]'
                  }`}
                >
                  {ws === 'joint' ? 'Bersama ❤️' : ws}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-[var(--tf-text-muted)] mb-1">
              Tanggal Transaksi
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Calendar size={14} />
              </span>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] text-[var(--tf-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-[var(--tf-text-muted)] mb-1">
              Waktu (Jam:Menit WIB)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Clock size={14} />
              </span>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] text-[var(--tf-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Bukti Transfer / Pembayaran (Receipt Upload Section) */}
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-[var(--tf-text-muted)] mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Receipt size={14} className="text-blue-500" />
              Bukti Transfer / Struk Pembayaran
            </span>
            <span className="text-[10px] text-[var(--tf-text-muted)] font-normal">Foto struk, nota, atau screenshot transfer</span>
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          {receiptUrl ? (
            <div className="relative rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-3 flex items-center gap-3">
              <img
                src={receiptUrl}
                alt="Bukti Transfer"
                className="w-16 h-16 rounded-xl object-cover border border-emerald-500/40 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <Check size={14} /> Bukti Terpasang
                </div>
                <div className="text-[11px] text-[var(--tf-text-muted)] truncate mt-0.5">
                  {receiptName || 'bukti_transfer.jpg'}
                </div>
              </div>
              <button
                type="button"
                onClick={removeReceipt}
                className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Hapus Bukti"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-[var(--tf-border)] hover:border-blue-500/50 hover:bg-blue-500/5 rounded-2xl p-4 text-center transition-all group"
            >
              {uploadingReceipt ? (
                <div className="py-2 text-xs font-bold text-blue-600 animate-pulse flex items-center justify-center gap-2">
                  <Upload size={16} className="animate-bounce" /> Mengompresi & Memproses Gambar...
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-[var(--tf-text-muted)] group-hover:text-blue-600">
                  <div className="p-2 rounded-xl bg-[var(--tf-bg-subtle)] text-[var(--tf-text-muted)] group-hover:bg-blue-500/10 group-hover:text-blue-600 transition-colors">
                    <Camera size={20} />
                  </div>
                  <div className="text-xs font-semibold">Klik untuk Pilih Foto atau Ambil Gambar Struk</div>
                  <div className="text-[10px] text-slate-400">Mendukung format JPG, PNG, WEBP (Otomatis dikompresi)</div>
                </div>
              )}
            </div>
          )}

          {receiptError && (
            <div className="text-xs text-rose-500 mt-1 font-medium">{receiptError}</div>
          )}
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-[var(--tf-text-muted)] mb-1">
            Catatan Tambahan (Opsional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catatan khusus transaksi..."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] text-[var(--tf-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--tf-border)]">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button
            type="submit"
            disabled={submitting || uploadingReceipt}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-6"
          >
            {submitting ? 'Menyimpan...' : initialData ? 'Simpan Perubahan' : 'Catat Transaksi ✨'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
