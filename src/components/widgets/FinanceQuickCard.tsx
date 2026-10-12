import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, ArrowDownRight, Fuel, Coffee, ChevronRight, Plus, Sparkles } from 'lucide-react';
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
      <Card className="p-4 sm:p-5 rounded-3xl border border-[var(--tf-border)] bg-gradient-to-br from-amber-500/5 via-[var(--tf-bg-surface)] to-[var(--tf-bg-surface)] backdrop-blur-md shadow-xs">
        <div className="flex items-center justify-between border-b border-[var(--tf-border)] pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Wallet size={17} />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[var(--tf-text-primary)] flex items-center gap-1.5">
                Dompet & Catatan Pengeluaran
              </h3>
              <p className="text-[11px] text-[var(--tf-text-muted)]">
                Pengeluaran hari ini: <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{formatRupiah(summary.todayExpense)}</span>
              </p>
            </div>
          </div>

          <Link
            to="/finance"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
          >
            Buka Catatan <ChevronRight size={14} />
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Saldo summary */}
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-[var(--tf-text-muted)] font-medium">Total Saldo:</span>
            <span className="font-mono text-lg sm:text-xl font-black text-[var(--tf-text-primary)]">
              {formatRupiah(summary.totalBalance)}
            </span>
            {summary.monthlyLimit > 0 && (
              <Badge
                variant={summary.isOverBudget ? 'danger' : summary.isNearBudgetLimit ? 'warning' : 'success'}
                size="sm"
                className="ml-1 text-[10px]"
              >
                {summary.budgetUsedPercent.toFixed(0)}% Budget
              </Badge>
            )}
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openQuickAdd('bensin')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 text-xs font-bold transition-all active:scale-95"
            >
              <Fuel size={14} /> + Bensin
            </button>

            <button
              type="button"
              onClick={() => openQuickAdd('jajan')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 dark:text-pink-400 border border-pink-500/30 text-xs font-bold transition-all active:scale-95"
            >
              <Coffee size={14} /> + Jajan
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
            category: defaultCat
          });
        }}
        defaultType="expense"
      />
    </>
  );
}
