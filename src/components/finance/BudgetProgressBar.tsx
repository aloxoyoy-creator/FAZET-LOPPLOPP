import { Target, Settings2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { formatRupiah } from '../../data/financeCategories';
import type { FinanceSummary } from '../../types/finance';

interface Props {
  summary: FinanceSummary;
  onOpenBudgetModal: () => void;
}

export default function BudgetProgressBar({ summary, onOpenBudgetModal }: Props) {
  const hasBudget = summary.monthlyLimit > 0;
  const percent = Math.min(100, summary.budgetUsedPercent);

  // Gradient color based on percentage
  const barColor = summary.isOverBudget
    ? 'bg-rose-500'
    : summary.isNearBudgetLimit
    ? 'bg-amber-500'
    : percent > 60
    ? 'bg-indigo-500'
    : 'bg-emerald-500';

  return (
    <Card className="p-4 sm:p-5 rounded-3xl border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] backdrop-blur-md shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-500">
            <Target size={18} />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-[var(--tf-text-primary)] flex items-center gap-2">
              Batas Anggaran Bulanan
              {hasBudget && summary.isOverBudget && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/30 flex items-center gap-1">
                  <AlertTriangle size={11} /> Overbudget!
                </span>
              )}
              {hasBudget && summary.isNearBudgetLimit && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/30 flex items-center gap-1">
                  <AlertTriangle size={11} /> Waspada
                </span>
              )}
              {hasBudget && !summary.isNearBudgetLimit && !summary.isOverBudget && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 size={11} /> Aman
                </span>
              )}
            </h3>
            <p className="text-xs text-[var(--tf-text-muted)]">
              {hasBudget
                ? `Terpakai ${formatRupiah(summary.monthlyExpense)} dari limit ${formatRupiah(summary.monthlyLimit)}`
                : 'Belum ada batas anggaran bulanan yang ditentukan'}
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={onOpenBudgetModal}
          icon={<Settings2 size={14} />}
          className="rounded-2xl text-xs self-start sm:self-auto"
        >
          {hasBudget ? 'Ubah Limit Budget' : 'Atur Budget Bulanan'}
        </Button>
      </div>

      {hasBudget ? (
        <div className="space-y-2 mt-4">
          {/* Progress Track */}
          <div className="h-3 w-full rounded-full bg-slate-200/70 dark:bg-slate-800/80 overflow-hidden p-0.5 border border-slate-300/30 dark:border-slate-700/30">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-[var(--tf-text-muted)] font-mono font-medium">
            <span>{summary.budgetUsedPercent.toFixed(1)}% Terpakai</span>
            <span>
              {summary.isOverBudget
                ? `Lebih ${formatRupiah(summary.monthlyExpense - summary.monthlyLimit)} dari limit`
                : `Sisa ${formatRupiah(summary.budgetRemaining)}`}
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-3 p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/40 dark:border-indigo-900/30 flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-300">
          <span>Pasang batas pengeluaran untuk menerima notifikasi otomatis saat jajan/bensinmu mendekati limit!</span>
        </div>
      )}
    </Card>
  );
}
