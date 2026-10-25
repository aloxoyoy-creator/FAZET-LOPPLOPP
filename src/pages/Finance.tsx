import { useState, useMemo } from 'react';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Search,
  Download,
  Calendar,
  Sparkles,
  PieChart,
  ListOrdered,
  Tag,
  RefreshCw,
  Fuel,
  Coffee,
  Utensils,
  GraduationCap,
  Zap,
  Loader2,
  X
} from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import { useWorkspace } from '../context/WorkspaceContext';
import { askAiAssistant } from '../services/aiAssistantService';
import FinanceOverviewCards from '../components/finance/FinanceOverviewCards';
import BudgetProgressBar from '../components/finance/BudgetProgressBar';
import TransactionList from '../components/finance/TransactionList';
import FinanceCharts from '../components/finance/FinanceCharts';
import TransactionFormModal from '../components/finance/TransactionFormModal';
import ReceiptViewerModal from '../components/finance/ReceiptViewerModal';
import BudgetSettingsModal from '../components/finance/BudgetSettingsModal';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../src/data/financeCategories';
import type { FinanceTransaction, TransactionType } from '../types/finance';

const QUICK_EXPENSE_PRESETS = [
  { id: 'bensin', label: '⛽ Isi Bensin', amount: 20000, category: 'bensin', categoryLabel: 'Bensin & BBM', desc: 'Isi Bensin Pertalite/Pertamax', icon: Fuel },
  { id: 'makan', label: '🍜 Makan Siang/Malam', amount: 15000, category: 'makan', categoryLabel: 'Makan Utama', desc: 'Makan Harian', icon: Utensils },
  { id: 'jajan', label: '☕ Kopi / Jajan', amount: 10000, category: 'jajan', categoryLabel: 'Jajan & Ngemil', desc: 'Beli Minuman / Ngemil', icon: Coffee },
  { id: 'print', label: '📚 Print / Alat Tulis', amount: 10000, category: 'kuliah', categoryLabel: 'Kuliah & Pendidikan', desc: 'Print Tugas / Fotokopi', icon: GraduationCap },
];

export default function Finance() {
  const { workspaceId } = useWorkspace();
  const {
    transactions,
    allTransactions,
    summary,
    budget,
    filter,
    setFilter,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    saveBudget,
    exportCsv,
    refresh
  } = useFinance();

  // Active view tab
  const [activeTab, setActiveTab] = useState<'transactions' | 'analytics'>('transactions');

  // Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [formDefaultType, setFormDefaultType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<FinanceTransaction | null>(null);

  const [receiptViewerOpen, setReceiptViewerOpen] = useState(false);
  const [viewingReceiptTx, setViewingReceiptTx] = useState<FinanceTransaction | null>(null);

  const [budgetModalOpen, setBudgetModalOpen] = useState(false);

  // Quick add & AI state
  const [quickBusyId, setQuickBusyId] = useState<string | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Month selector options (Last 6 months)
  const monthOptions = useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = d.toISOString().slice(0, 7);
      const label = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(d);
      list.push({ val, label });
    }
    return list;
  }, []);

  const currentMonthLabel = useMemo(() => {
    if (filter.month === 'all') return 'Semua Periode';
    const [y, m] = filter.month.split('-').map(Number);
    const d = new Date(y, m - 1, 1);
    return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(d);
  }, [filter.month]);

  // Handlers
  const handleOpenAdd = (type: TransactionType = 'expense') => {
    setEditingTransaction(null);
    setFormDefaultType(type);
    setFormOpen(true);
  };

  const handleEdit = (tx: FinanceTransaction) => {
    setEditingTransaction(tx);
    setFormDefaultType(tx.type);
    setFormOpen(true);
  };

  const handleViewReceipt = (tx: FinanceTransaction) => {
    setViewingReceiptTx(tx);
    setReceiptViewerOpen(true);
  };

  const handleQuickPreset = async (preset: typeof QUICK_EXPENSE_PRESETS[number]) => {
    if (quickBusyId) return;
    setQuickBusyId(preset.id);
    try {
      const now = new Date();
      await addTransaction({
        workspaceId,
        type: 'expense',
        amount: preset.amount,
        category: preset.category,
        categoryLabel: preset.categoryLabel,
        description: preset.desc,
        paymentMethod: 'qris',
        transactionDate: now.toISOString().slice(0, 10),
        transactionTime: now.toTimeString().slice(0, 5),
      });
    } finally {
      setQuickBusyId(null);
    }
  };

  const handleAskFinancialAi = async () => {
    setAiLoading(true);
    try {
      const topCats = summary.categoryStats
        .slice(0, 4)
        .map((c) => `${c.label}: Rp ${Math.round(c.amount).toLocaleString('id-ID')} (${c.percentage}%)`)
        .join(', ');
      const prompt = `Analisis kondisi keuangan saya untuk periode ${currentMonthLabel}:
- Pemasukan Bulan Ini: Rp ${Math.round(summary.monthlyIncome).toLocaleString('id-ID')}
- Pengeluaran Bulan Ini: Rp ${Math.round(summary.monthlyExpense).toLocaleString('id-ID')}
- Pengeluaran Hari Ini: Rp ${Math.round(summary.todayExpense).toLocaleString('id-ID')}
- Limit Anggaran Bulanan: ${summary.monthlyLimit > 0 ? `Rp ${Math.round(summary.monthlyLimit).toLocaleString('id-ID')} (Terpakai ${summary.budgetUsedPercent}%)` : 'Belum diatur'}
- Kategori Pengeluaran Terbesar: ${topCats || 'Belum ada transaksi'}

Berikan 3 saran penghematan dan pengelolaan uang saku/bulanan yang sangat praktis, realistis, dan ramah dalam Bahasa Indonesia.`;
      const reply = await askAiAssistant({ prompt, workspace: workspaceId });
      setAiAdvice(reply);
    } catch {
      setAiAdvice('Gagal memuat analisis AI saat ini. Pastikan pengeluaran harian tetap berada di bawah batas anggaran bulananmu.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 px-2 sm:px-4">
      {/* 1. Header Banner */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs tracking-widest uppercase mb-1.5">
            <Sparkles size={15} /> Pencatatan Keuangan & Bukti Transfer
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--tf-text-primary)] flex items-center gap-3">
            <span className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-500 inline-flex">
              <Wallet size={24} />
            </span>
            Catatan Keuangan FAZET
          </h1>
          <p className="text-xs sm:text-sm text-[var(--tf-text-muted)] mt-1 max-w-2xl leading-relaxed">
            Kelola pengeluaran harian (bensin, jajan, belanja), pemasukan, arsip foto bukti transfer, serta pantau limit anggaran dengan analisis AI cerdas.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleAskFinancialAi}
            disabled={aiLoading}
            icon={aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            className="rounded-2xl text-xs font-bold"
          >
            Analisis AI
          </Button>

          <Button
            size="sm"
            onClick={() => handleOpenAdd('expense')}
            className="bg-rose-600 hover:bg-rose-700 text-white rounded-2xl shadow-xs text-xs font-bold"
            icon={<ArrowDownRight size={15} />}
          >
            + Catat Pengeluaran
          </Button>

          <Button
            size="sm"
            onClick={() => handleOpenAdd('income')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-xs text-xs font-bold"
            icon={<ArrowUpRight size={15} />}
          >
            + Catat Pemasukan
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={exportCsv}
            icon={<Download size={14} />}
            className="rounded-2xl text-xs"
            title="Ekspor ke format Excel / CSV"
          >
            Unduh CSV
          </Button>
        </div>
      </header>

      {/* AI Financial Advisor Panel */}
      {aiAdvice && (
        <div className="rounded-3xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/80 dark:bg-indigo-950/30 p-4">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2 text-xs font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
              <Sparkles size={15} /> Analisis & Saran Penghematan FAZET AI ({currentMonthLabel})
            </div>
            <button
              type="button"
              onClick={() => setAiAdvice(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={15} />
            </button>
          </div>
          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-line">
            {aiAdvice}
          </p>
        </div>
      )}

      {/* 1-Click Quick Expense Bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] px-4 py-3 shadow-xs">
        <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-600 dark:text-amber-400 mr-1">
          <Zap size={14} /> Catat Cepat 1-Klik:
        </span>
        {QUICK_EXPENSE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            disabled={!!quickBusyId}
            onClick={() => handleQuickPreset(preset)}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 hover:border-rose-400 hover:bg-rose-50/60 dark:hover:bg-rose-950/30 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition disabled:opacity-50"
          >
            {quickBusyId === preset.id ? (
              <Loader2 size={12} className="animate-spin text-rose-500" />
            ) : null}
            <span>{preset.label}</span>
            <span className="text-[11px] font-extrabold text-rose-600 dark:text-rose-400">
              Rp {(preset.amount / 1000).toFixed(0)}rb
            </span>
          </button>
        ))}
      </div>

      {/* 2. Overview KPI Cards */}
      <FinanceOverviewCards summary={summary} monthLabel={currentMonthLabel} />

      {/* 3. Budget Limit Progress Tracker */}
      <BudgetProgressBar summary={summary} onOpenBudgetModal={() => setBudgetModalOpen(true)} />

      {/* 4. Filter & Search Control Bar */}
      <Card className="p-3.5 sm:p-4 rounded-3xl border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] backdrop-blur-md shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={15} />
            </span>
            <input
              type="text"
              value={filter.searchQuery}
              onChange={(e) => setFilter((prev) => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Cari transaksi, bensin, jajan, toko, merchant..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl border border-[var(--tf-border)] bg-[var(--tf-bg-subtle)] text-[var(--tf-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Periode Bulan */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border border-[var(--tf-border)] bg-[var(--tf-bg-subtle)] text-xs">
              <Calendar size={13} className="text-slate-400 shrink-0" />
              <select
                value={filter.month}
                onChange={(e) => setFilter((prev) => ({ ...prev, month: e.target.value }))}
                className="bg-transparent text-[var(--tf-text-primary)] focus:outline-none text-xs font-semibold cursor-pointer"
              >
                {monthOptions.map((opt) => (
                  <option key={opt.val} value={opt.val}>
                    {opt.label}
                  </option>
                ))}
                <option value="all">Semua Riwayat</option>
              </select>
            </div>

            {/* Filter Kategori */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border border-[var(--tf-border)] bg-[var(--tf-bg-subtle)] text-xs">
              <Tag size={13} className="text-slate-400 shrink-0" />
              <select
                value={filter.category}
                onChange={(e) => setFilter((prev) => ({ ...prev, category: e.target.value }))}
                className="bg-transparent text-[var(--tf-text-primary)] focus:outline-none text-xs font-semibold cursor-pointer max-w-[130px] truncate"
              >
                <option value="all">Semua Kategori</option>
                <optgroup label="Pengeluaran">
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Pemasukan">
                  {INCOME_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Filter Workspace (Milik Siapa) */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border border-[var(--tf-border)] bg-[var(--tf-bg-subtle)] text-xs">
              <select
                value={filter.workspace}
                onChange={(e) => setFilter((prev) => ({ ...prev, workspace: e.target.value as any }))}
                className="bg-transparent text-[var(--tf-text-primary)] focus:outline-none text-xs font-semibold cursor-pointer"
              >
                <option value="all">Semua Akun</option>
                <option value="fathur">Fathur</option>
                <option value="mazet">Mazet</option>
                <option value="joint">Bersama ❤️</option>
              </select>
            </div>

            {/* Filter Tipe Transaksi */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border border-[var(--tf-border)] bg-[var(--tf-bg-subtle)] text-xs">
              <select
                value={filter.type}
                onChange={(e) => setFilter((prev) => ({ ...prev, type: e.target.value as any }))}
                className="bg-transparent text-[var(--tf-text-primary)] focus:outline-none text-xs font-semibold cursor-pointer"
              >
                <option value="all">Semua Tipe</option>
                <option value="expense">Pengeluaran</option>
                <option value="income">Pemasukan</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={refresh}
              className="p-2 rounded-2xl hover:bg-[var(--tf-border)] text-[var(--tf-text-muted)] transition-colors"
              title="Perbarui Data"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>
      </Card>

      {/* 5. Main View Tabs (Riwayat Transaksi vs Grafik Analisis) */}
      <div className="flex items-center justify-between border-b border-[var(--tf-border)] pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'transactions'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-[var(--tf-text-muted)] hover:bg-[var(--tf-bg-subtle)]'
            }`}
          >
            <ListOrdered size={15} /> Riwayat Transaksi ({transactions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-[var(--tf-text-muted)] hover:bg-[var(--tf-bg-subtle)]'
            }`}
          >
            <PieChart size={15} /> Analisis & Grafik
          </button>
        </div>

        <span className="text-[11px] font-mono text-[var(--tf-text-muted)] hidden sm:inline">
          {currentMonthLabel}
        </span>
      </div>

      {/* 6. Active Tab Content */}
      {activeTab === 'transactions' ? (
        <TransactionList
          transactions={transactions}
          onEdit={handleEdit}
          onDelete={deleteTransaction}
          onViewReceipt={handleViewReceipt}
          onAddNew={() => handleOpenAdd('expense')}
        />
      ) : (
        <FinanceCharts
          categoryStats={summary.categoryStats}
          transactions={allTransactions}
          totalExpense={summary.monthlyExpense}
        />
      )}

      {/* 7. Modals */}
      <TransactionFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={async (data) => {
          if (editingTransaction) {
            await updateTransaction(editingTransaction.id, data);
          } else {
            await addTransaction(data);
          }
        }}
        initialData={editingTransaction}
        defaultType={formDefaultType}
      />

      <ReceiptViewerModal
        isOpen={receiptViewerOpen}
        onClose={() => setReceiptViewerOpen(false)}
        transaction={viewingReceiptTx}
      />

      <BudgetSettingsModal
        isOpen={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        budget={budget}
        workspaceId={workspaceId}
        month={filter.month === 'all' ? new Date().toISOString().slice(0, 7) : filter.month}
        onSave={saveBudget}
      />
    </div>
  );
}
