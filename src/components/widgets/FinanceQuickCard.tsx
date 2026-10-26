import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Fuel, Coffee, ArrowUpRight } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { useFinance } from '../../hooks/useFinance';
import { formatRupiah } from '../../data/financeCategories';
import TransactionFormModal from '../finance/TransactionFormModal';

export default function FinanceQuickCard() {
  const { summary, addTransaction } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultCat, setDefaultCat] = useState<'bensin' | 'jajan'>('jajan');

  const openQuickAdd = (cat: 'bensin' | 'jajan') => {
    setDefaultCat(cat);
    setModalOpen(true);
  };

  return (
    <>
      <Card className="p-5 sm:p-6 border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] flex flex-col justify-between">
        <div className="flex items-start justify-between gap-3 border-b border-[var(--tf-border)] pb-3.5 mb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--tf-accent-soft)] text-[var(--tf-accent)] border border-[var(--tf-accent)]/20">
              <Wallet size={16} strokeWidth={1.75} />
            </div>
            <div>
              <div className="studio-eyebrow">Ringkasan Finansial</div>
              <h3 className="font-medium text-sm text-[var(--tf-text-primary)] mt-0.5">
                Dompet &amp; Arus Kas Harian
              </h3>
            </div>
          </div>

          <Link
            to="/finance"
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--tf-text-secondary)] hover:text-[var(--tf-accent)] transition-colors"
          >
            <span>Buku Kas</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--tf-text-muted)]">
              Saldo Tersedia
            </div>
            <div className="flex items-baseline gap-2.5 flex-wrap">
              <span className="font-mono text-xl sm:text-2xl font-semibold tracking-tight text-[var(--tf-text-primary)]">
                {formatRupiah(summary.totalBalance)}
              </span>
              {summary.monthlyLimit > 0 && (
                <Badge
                  variant={summary.isOverBudget ? 'danger' : summary.isNearBudgetLimit ? 'warning' : 'neutral'}
                  size="sm"
                >
                  {summary.budgetUsedPercent.toFixed(0)}% Anggaran
                </Badge>
              )}
            </div>
            <div className="text-xs text-[var(--tf-text-muted)]">
              Pengeluaran hari ini:{' '}
              <span className="font-mono font-medium text-[var(--tf-text-primary)]">
                {formatRupiah(summary.todayExpense)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openQuickAdd('bensin')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--tf-bg-subtle)] hover:bg-[var(--tf-accent-soft)] text-[var(--tf-text-primary)] hover:text-[var(--tf-accent)] border border-[var(--tf-border)] hover:border-[var(--tf-accent)]/30 text-xs font-medium transition-all cursor-pointer"
            >
              <Fuel size={13} />
              <span>Catat Bensin</span>
            </button>

            <button
              type="button"
              onClick={() => openQuickAdd('jajan')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--tf-bg-subtle)] hover:bg-[var(--tf-accent-soft)] text-[var(--tf-text-primary)] hover:text-[var(--tf-accent)] border border-[var(--tf-border)] hover:border-[var(--tf-accent)]/30 text-xs font-medium transition-all cursor-pointer"
            >
              <Coffee size={13} />
              <span>Catat Jajan</span>
            </button>
          </div>
        </div>
      </Card>

      <TransactionFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={async (data) => {
          await addTransaction({
            ...data,
            category: defaultCat,
          });
        }}
        defaultType="expense"
      />
    </>
  );
}
