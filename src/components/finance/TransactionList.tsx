import { useState } from 'react';
import {
  Receipt,
  MoreVertical,
  Trash2,
  Edit2,
  Calendar,
  Building2,
  ArrowDownRight,
  ArrowUpRight,
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
  Sparkles,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { formatRupiah, getCategoryById, getPaymentMethodById } from '../../data/financeCategories';
import type { FinanceTransaction } from '../../types/finance';

interface Props {
  transactions: FinanceTransaction[];
  onEdit: (tx: FinanceTransaction) => void;
  onDelete: (id: string) => void;
  onViewReceipt: (tx: FinanceTransaction) => void;
  onAddNew: () => void;
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

export default function TransactionList({
  transactions,
  onEdit,
  onDelete,
  onViewReceipt,
  onAddNew
}: Props) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  if (transactions.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center rounded-3xl border border-dashed border-[var(--tf-border)] bg-[var(--tf-bg-surface)]/50 backdrop-blur-md">
        <div className="p-4 rounded-3xl bg-blue-500/10 text-blue-500 w-fit mx-auto mb-3">
          <Receipt size={32} />
        </div>
        <h3 className="font-bold text-base text-[var(--tf-text-primary)]">Belum Ada Transaksi</h3>
        <p className="text-xs text-[var(--tf-text-muted)] max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
          Belum ada catatan pengeluaran atau pemasukan yang cocok dengan filter yang dipilih. Yuk catat transaksi pertamamu sekarang!
        </p>
        <Button onClick={onAddNew} size="sm" className="rounded-2xl shadow-sm">
          + Catat Transaksi Baru
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => {
        const cat = getCategoryById(tx.category);
        const Icon = CATEGORY_ICONS[tx.category] || Coins;
        const isExpense = tx.type === 'expense';
        const paymentMethod = getPaymentMethodById(tx.paymentMethod);
        const isMenuOpen = activeMenuId === tx.id;

        return (
          <Card
            key={tx.id}
            interactive
            className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] backdrop-blur-md hover:border-blue-500/40 transition-all shadow-xs"
          >
            <div className="flex items-start sm:items-center justify-between gap-3">
              {/* Left Column: Icon + Category + Description */}
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                {/* Category Icon */}
                <div
                  className="p-3 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                  style={{
                    backgroundColor: `${cat.color}15`,
                    color: cat.color,
                    border: `1px solid ${cat.color}30`
                  }}
                >
                  <Icon size={20} />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                    <span className="font-bold text-sm text-[var(--tf-text-primary)] truncate">
                      {tx.description}
                    </span>

                    {/* Workspace badge */}
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        tx.workspaceId === 'joint'
                          ? 'bg-rose-500/10 text-rose-600 border border-rose-500/30'
                          : tx.workspaceId === 'mazet'
                          ? 'bg-purple-500/10 text-purple-600 border border-purple-500/30'
                          : 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/30'
                      }`}
                    >
                      {tx.workspaceId === 'joint' ? 'Bersama ' : tx.workspaceId}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--tf-text-muted)]">
                    <span className="font-semibold text-[var(--tf-text-secondary)]">{cat.name}</span>
                    <span>•</span>
                    {tx.merchant && (
                      <>
                        <span className="flex items-center gap-1 text-[var(--tf-text-secondary)]">
                          <Building2 size={12} /> {tx.merchant}
                        </span>
                        <span>•</span>
                      </>
                    )}
                    <span className="font-mono text-[11px]">{tx.transactionDate}</span>
                    <span className="font-mono text-[11px]">{tx.transactionTime}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Amount + Receipt Thumb + Action Menu */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {/* Receipt Thumbnail Button (if attached) */}
                {tx.receiptUrl && (
                  <button
                    type="button"
                    onClick={() => onViewReceipt(tx)}
                    title="Lihat Bukti Transfer / Nota"
                    className="group relative flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 transition-all active:scale-95 text-xs font-semibold"
                  >
                    <div className="w-6 h-6 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-blue-500/40">
                      <img
                        src={tx.receiptUrl}
                        alt="Struk"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="hidden sm:inline text-[11px]">Bukti TF</span>
                  </button>
                )}

                {/* Amount */}
                <div className="text-right">
                  <div
                    className={`font-mono font-black text-sm sm:text-base tracking-tight ${
                      isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {isExpense ? '-' : '+'}
                    {formatRupiah(tx.amount)}
                  </div>
                  <div className="mt-0.5">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md border ${paymentMethod.badgeColor}`}
                    >
                      {paymentMethod.name}
                    </span>
                  </div>
                </div>

                {/* Actions Dropdown Toggle */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveMenuId(isMenuOpen ? null : tx.id)}
                    className="p-1.5 rounded-xl hover:bg-[var(--tf-bg-subtle)] text-[var(--tf-text-muted)] transition-colors"
                    aria-label="Menu Opsi"
                  >
                    <MoreVertical size={16} />
                  </button>

                  {isMenuOpen && (
                    <div
                      className="absolute right-0 top-8 z-30 w-36 rounded-2xl border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] p-1.5 shadow-xl text-xs space-y-1 backdrop-blur-md"
                      onMouseLeave={() => setActiveMenuId(null)}
                    >
                      {tx.receiptUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            onViewReceipt(tx);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left hover:bg-[var(--tf-bg-subtle)] text-[var(--tf-text-primary)]"
                        >
                          <ImageIcon size={14} className="text-blue-500" />
                          <span>Lihat Bukti</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMenuId(null);
                          onEdit(tx);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left hover:bg-[var(--tf-bg-subtle)] text-[var(--tf-text-primary)]"
                      >
                        <Edit2 size={14} className="text-amber-500" />
                        <span>Edit Catatan</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMenuId(null);
                          if (window.confirm(`Hapus catatan "${tx.description}"?`)) {
                            onDelete(tx.id);
                          }
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold"
                      >
                        <Trash2 size={14} />
                        <span>Hapus</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
