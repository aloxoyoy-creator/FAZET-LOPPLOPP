import { Wallet, ArrowDownRight, ArrowUpRight, PiggyBank, AlertTriangle, ShieldCheck } from 'lucide-react';
import Card from '../ui/Card';
import { formatRupiah } from '../../data/financeCategories';
import type { FinanceSummary } from '../../types/finance';

interface Props {
  summary: FinanceSummary;
  monthLabel: string;
}

export default function FinanceOverviewCards({ summary, monthLabel }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Saldo Kumulatif */}
      <Card className="p-4 sm:p-5 rounded-3xl border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] backdrop-blur-md relative overflow-hidden group shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--tf-text-muted)]">
            Total Saldo Bersih
          </span>
          <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Wallet size={18} />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-[var(--tf-text-primary)] tracking-tight font-mono">
          {formatRupiah(summary.totalBalance)}
        </div>
        <p className="text-[11px] text-[var(--tf-text-muted)] mt-1.5 flex items-center gap-1 font-medium">
          <span>Akumulasi seluruh arus kas</span>
        </p>
      </Card>

      {/* 2. Pemasukan Bulan Ini */}
      <Card className="p-4 sm:p-5 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md relative overflow-hidden group shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Pemasukan ({monthLabel})
          </span>
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight size={18} />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">
          +{formatRupiah(summary.monthlyIncome)}
        </div>
        <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 mt-1.5 font-medium">
          Uang saku, gaji & rezeki masuk
        </p>
      </Card>

      {/* 3. Pengeluaran Bulan Ini */}
      <Card className="p-4 sm:p-5 rounded-3xl border border-rose-500/20 bg-rose-500/5 backdrop-blur-md relative overflow-hidden group shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Pengeluaran ({monthLabel})
          </span>
          <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <ArrowDownRight size={18} />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight font-mono">
          -{formatRupiah(summary.monthlyExpense)}
        </div>
        <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80 mt-1.5 font-medium">
          Hari ini: {formatRupiah(summary.todayExpense)}
        </p>
      </Card>

      {/* 4. Sisa Budget / Tabungan */}
      <Card className={`p-4 sm:p-5 rounded-3xl border backdrop-blur-md relative overflow-hidden group shadow-xs ${
        summary.isOverBudget
          ? 'border-red-500/30 bg-red-500/10'
          : summary.isNearBudgetLimit
          ? 'border-amber-500/30 bg-amber-500/10'
          : 'border-indigo-500/20 bg-indigo-500/5'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-bold uppercase tracking-wider ${
            summary.isOverBudget
              ? 'text-red-600 dark:text-red-400'
              : summary.isNearBudgetLimit
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-indigo-600 dark:text-indigo-400'
          }`}>
            {summary.monthlyLimit > 0 ? 'Sisa Budget Bulan Ini' : 'Surplus Tabungan'}
          </span>
          <div className={`p-2.5 rounded-2xl ${
            summary.isOverBudget
              ? 'bg-red-500/20 text-red-600'
              : summary.isNearBudgetLimit
              ? 'bg-amber-500/20 text-amber-600'
              : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
          }`}>
            {summary.isOverBudget ? <AlertTriangle size={18} /> : summary.monthlyLimit > 0 ? <ShieldCheck size={18} /> : <PiggyBank size={18} />}
          </div>
        </div>
        <div className={`text-2xl sm:text-3xl font-black tracking-tight font-mono ${
          summary.isOverBudget
            ? 'text-red-600 dark:text-red-400'
            : summary.isNearBudgetLimit
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-indigo-600 dark:text-indigo-400'
        }`}>
          {summary.monthlyLimit > 0
            ? formatRupiah(summary.budgetRemaining)
            : formatRupiah(summary.netSavings)}
        </div>
        <p className={`text-[11px] mt-1.5 font-medium ${
          summary.isOverBudget
            ? 'text-red-700 dark:text-red-300'
            : summary.isNearBudgetLimit
            ? 'text-amber-700 dark:text-amber-300'
            : 'text-indigo-700/80 dark:text-indigo-300/80'
        }`}>
          {summary.monthlyLimit > 0
            ? `${summary.budgetUsedPercent.toFixed(1)}% terpakai dari target`
            : summary.netSavings >= 0 ? 'Cashflow surplus bulan ini ✨' : 'Cashflow defisit bulan ini ⚠️'}
        </p>
      </Card>
    </div>
  );
}
