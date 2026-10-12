import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { PieChart as PieIcon, BarChart3, TrendingDown, Fuel, Coffee, Utensils, ShoppingBag, GraduationCap, Heart, Zap, Pill, Car, Gift, PiggyBank, Coins } from 'lucide-react';
import Card from '../ui/Card';
import { formatRupiah } from '../../data/financeCategories';
import type { CategoryStat, FinanceTransaction } from '../../types/finance';

interface Props {
  categoryStats: CategoryStat[];
  transactions: FinanceTransaction[];
  totalExpense: number;
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
  lainnya: Coins
};

export default function FinanceCharts({ categoryStats, transactions, totalExpense }: Props) {
  // Prepare data for Category Donut Chart
  const pieData = categoryStats.map((stat) => ({
    name: stat.label,
    value: stat.amount,
    color: stat.color,
    percentage: stat.percentage
  }));

  // Prepare recent 7-days cashflow bar chart data
  const last7DaysData = (() => {
    const daysMap = new Map<string, { date: string; label: string; income: number; expense: number }>();
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const iso = d.toISOString().slice(0, 10);
      const dayLabel = new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(d);
      daysMap.set(iso, { date: iso, label: dayLabel, income: 0, expense: 0 });
    }

    transactions.forEach((tx) => {
      const record = daysMap.get(tx.transactionDate);
      if (record) {
        if (tx.type === 'income') record.income += tx.amount;
        if (tx.type === 'expense') record.expense += tx.amount;
      }
    });

    return Array.from(daysMap.values());
  })();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* 1. Category Breakdown Donut Chart */}
      <Card className="lg:col-span-7 p-4 sm:p-5 rounded-3xl border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] backdrop-blur-md shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-rose-500/10 text-rose-500">
              <PieIcon size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[var(--tf-text-primary)]">
                Proporsi Pengeluaran per Kategori
              </h3>
              <p className="text-xs text-[var(--tf-text-muted)]">
                Total {formatRupiah(totalExpense)}
              </p>
            </div>
          </div>
        </div>

        {categoryStats.length === 0 ? (
          <div className="py-12 text-center text-xs text-[var(--tf-text-muted)]">
            Belum ada data pengeluaran untuk ditampilkan di grafik.
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Donut Chart */}
            <div className="w-full sm:w-56 h-56 shrink-0 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [formatRupiah(Number(val)), 'Pengeluaran']}
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] font-bold uppercase text-[var(--tf-text-muted)]">Pengeluaran</span>
                <span className="text-sm font-black font-mono text-[var(--tf-text-primary)]">
                  {formatRupiah(totalExpense)}
                </span>
              </div>
            </div>

            {/* Category Badges / Ranking */}
            <div className="w-full flex-1 max-h-56 overflow-y-auto space-y-2 pr-1 scrollbar-hide text-xs">
              {categoryStats.map((stat) => {
                const Icon = CATEGORY_ICONS[stat.category] || Coins;
                return (
                  <div
                    key={stat.category}
                    className="flex items-center justify-between p-2 rounded-xl bg-[var(--tf-bg-subtle)] hover:bg-[var(--tf-border)]/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="p-1.5 rounded-lg shrink-0"
                        style={{ backgroundColor: `${stat.color}20`, color: stat.color }}
                      >
                        <Icon size={14} />
                      </span>
                      <span className="font-semibold text-[var(--tf-text-primary)] truncate">
                        {stat.label}
                      </span>
                    </div>

                    <div className="text-right shrink-0 font-mono">
                      <div className="font-bold text-[var(--tf-text-primary)]">
                        {formatRupiah(stat.amount)}
                      </div>
                      <div className="text-[10px] text-[var(--tf-text-muted)]">
                        {stat.percentage.toFixed(1)}% • {stat.count}x
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* 2. 7-Day Cashflow Bar Chart */}
      <Card className="lg:col-span-5 p-4 sm:p-5 rounded-3xl border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] backdrop-blur-md shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-500">
              <BarChart3 size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[var(--tf-text-primary)]">
                Arus Kas 7 Hari Terakhir
              </h3>
              <p className="text-xs text-[var(--tf-text-muted)]">
                Perbandingan Masuk vs Keluar
              </p>
            </div>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--tf-text-muted)' }} />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--tf-text-muted)' }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(val: number, name: string) => [
                  formatRupiah(Number(val)),
                  name === 'expense' ? 'Pengeluaran' : 'Pemasukan'
                ]}
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs mt-3 pt-2 border-t border-[var(--tf-border)]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[var(--tf-text-muted)]">Pemasukan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-[var(--tf-text-muted)]">Pengeluaran</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
