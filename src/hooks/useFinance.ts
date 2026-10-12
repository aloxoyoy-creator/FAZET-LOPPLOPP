import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import type { FinanceTransaction, FinanceBudget, FinanceFilter, FinanceSummary } from '../types/finance';
import {
  getTransactions,
  addTransaction as apiAddTx,
  updateTransaction as apiUpdateTx,
  deleteTransaction as apiDeleteTx,
  getBudget as apiGetBudget,
  saveBudget as apiSaveBudget,
  calculateFinanceSummary,
  exportFinanceToCsv
} from '../services/financeService';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/Toast';

export function useFinance() {
  const { user, profile } = useAuth();
  const { workspaceId } = useWorkspace();
  const toast = useToast();

  const currentMonthStr = useMemo(() => new Date().toISOString().slice(0, 7), []);

  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [budget, setBudget] = useState<FinanceBudget | null>(null);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState<FinanceFilter>({
    month: currentMonthStr,
    type: 'all',
    category: 'all',
    workspace: 'all',
    searchQuery: ''
  });

  // Load transactions and budget
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [txList, budgetData] = await Promise.all([
        getTransactions(filter.workspace === 'all' ? undefined : filter.workspace),
        apiGetBudget(workspaceId, filter.month === 'all' ? currentMonthStr : filter.month)
      ]);
      setTransactions(txList);
      setBudget(budgetData);
    } catch (err) {
      console.warn('Gagal memuat data keuangan:', err);
    } finally {
      setLoading(false);
    }
  }, [filter.workspace, filter.month, workspaceId, currentMonthStr]);

  useEffect(() => {
    void loadData();

    // Subscribe to realtime changes in Supabase
    const channel = supabase
      .channel('finance_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'finance_transactions' },
        () => {
          void loadData();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadData]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Month filter
      if (filter.month !== 'all' && !tx.transactionDate.startsWith(filter.month)) {
        return false;
      }
      // Type filter
      if (filter.type !== 'all' && tx.type !== filter.type) {
        return false;
      }
      // Category filter
      if (filter.category !== 'all' && tx.category !== filter.category) {
        return false;
      }
      // Workspace filter
      if (filter.workspace !== 'all' && tx.workspaceId !== filter.workspace && tx.workspaceId !== 'joint') {
        return false;
      }
      // Search query
      if (filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase();
        const matchesDesc = tx.description.toLowerCase().includes(query);
        const matchesMerchant = (tx.merchant || '').toLowerCase().includes(query);
        const matchesCat = tx.categoryLabel.toLowerCase().includes(query);
        const matchesAmount = tx.amount.toString().includes(query);
        if (!matchesDesc && !matchesMerchant && !matchesCat && !matchesAmount) {
          return false;
        }
      }
      return true;
    });
  }, [transactions, filter]);

  // Summary computed for the selected month or current month
  const summary: FinanceSummary = useMemo(() => {
    const targetMonth = filter.month === 'all' ? currentMonthStr : filter.month;
    return calculateFinanceSummary(
      transactions,
      targetMonth,
      budget?.monthlyLimit || 0,
      budget?.alertThreshold || 80
    );
  }, [transactions, filter.month, currentMonthStr, budget]);

  // Handlers
  const handleAddTransaction = async (
    payload: Omit<FinanceTransaction, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const created = await apiAddTx(payload, {
        id: user?.id,
        name: profile?.name || 'Fathur'
      });
      setTransactions((prev) => [created, ...prev]);
      toast.push({
        tone: 'success',
        title: 'Transaksi Berhasil Dicatat! 💸',
        message: `${created.categoryLabel}: Rp ${Math.round(created.amount).toLocaleString('id-ID')}`
      });
      return created;
    } catch (err) {
      console.error(err);
      toast.push({
        tone: 'danger',
        title: 'Gagal Menyimpan Transaksi',
        message: 'Silakan periksa koneksi dan coba lagi.'
      });
      throw err;
    }
  };

  const handleUpdateTransaction = async (id: string, updates: Partial<FinanceTransaction>) => {
    try {
      await apiUpdateTx(id, updates);
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
      );
      toast.push({
        tone: 'success',
        title: 'Transaksi Diperbarui',
        message: 'Perubahan transaksi berhasil disimpan.'
      });
    } catch (err) {
      console.error(err);
      toast.push({
        tone: 'danger',
        title: 'Gagal Memperbarui Transaksi',
        message: 'Silakan periksa koneksi dan coba lagi.'
      });
      throw err;
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await apiDeleteTx(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast.push({
        tone: 'info',
        title: 'Transaksi Dihapus',
        message: 'Catatan transaksi telah dihapus.'
      });
    } catch (err) {
      console.error(err);
      toast.push({
        tone: 'danger',
        title: 'Gagal Menghapus Transaksi',
        message: 'Silakan periksa koneksi dan coba lagi.'
      });
      throw err;
    }
  };

  const handleSaveBudget = async (newBudget: FinanceBudget) => {
    try {
      await apiSaveBudget(newBudget);
      setBudget(newBudget);
      toast.push({
        tone: 'success',
        title: 'Batas Anggaran Disimpan! 🎯',
        message: `Limit bulanan diatur ke Rp ${Math.round(newBudget.monthlyLimit).toLocaleString('id-ID')}`
      });
    } catch (err) {
      console.error(err);
      toast.push({
        tone: 'danger',
        title: 'Gagal Menyimpan Budget',
        message: 'Silakan coba lagi beberapa saat lagi.'
      });
      throw err;
    }
  };

  const handleExportCsv = () => {
    const filename = `Laporan_Keuangan_FAZET_${filter.month === 'all' ? 'Semua' : filter.month}.csv`;
    exportFinanceToCsv(filteredTransactions, filename);
    toast.push({
      tone: 'success',
      title: 'Laporan Diunduh 📄',
      message: `File ${filename} berhasil dibuat.`
    });
  };

  return {
    transactions: filteredTransactions,
    allTransactions: transactions,
    loading,
    summary,
    budget,
    filter,
    setFilter,
    addTransaction: handleAddTransaction,
    updateTransaction: handleUpdateTransaction,
    deleteTransaction: handleDeleteTransaction,
    saveBudget: handleSaveBudget,
    exportCsv: handleExportCsv,
    refresh: loadData
  };
}
