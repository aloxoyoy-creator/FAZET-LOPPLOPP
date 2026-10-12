import { supabase } from '../lib/supabase';
import type { FinanceTransaction, FinanceBudget, FinanceSummary, CategoryStat } from '../types/finance';
import { getCategoryById, formatRupiah } from '../data/financeCategories';
import { showSystemNotification, playNotificationSound } from './systemNotificationService';
import { createNotification } from './notificationService';

const LOCAL_TX_KEY = 'fazet_finance_transactions';
const LOCAL_BUDGET_KEY = 'fazet_finance_budgets';
const DAILY_REMINDER_ID = 882001; // Unique ID for daily finance notification

// LocalStorage Helper
function getLocalTransactions(): FinanceTransaction[] {
  try {
    const raw = localStorage.getItem(LOCAL_TX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalTransactions(items: FinanceTransaction[]) {
  try {
    localStorage.setItem(LOCAL_TX_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Gagal menyimpan transaksi ke localStorage:', err);
  }
}

function getLocalBudgets(): Record<string, FinanceBudget> {
  try {
    const raw = localStorage.getItem(LOCAL_BUDGET_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalBudget(budget: FinanceBudget) {
  try {
    const all = getLocalBudgets();
    const key = `${budget.workspaceId}_${budget.month}`;
    all[key] = budget;
    localStorage.setItem(LOCAL_BUDGET_KEY, JSON.stringify(all));
  } catch (err) {
    console.warn('Gagal menyimpan budget ke localStorage:', err);
  }
}

// Map database row to TypeScript interface
function mapRowToTx(row: Record<string, unknown>): FinanceTransaction {
  return {
    id: String(row.id),
    userId: row.user_id ? String(row.user_id) : undefined,
    userName: String(row.user_name || ''),
    workspaceId: (row.workspace_id as FinanceTransaction['workspaceId']) || 'fathur',
    type: (row.type as FinanceTransaction['type']) || 'expense',
    amount: Number(row.amount) || 0,
    category: String(row.category || 'lainnya'),
    categoryLabel: String(row.category_label || ''),
    description: String(row.description || ''),
    merchant: row.merchant ? String(row.merchant) : undefined,
    paymentMethod: String(row.payment_method || 'cash'),
    transactionDate: String(row.transaction_date || new Date().toISOString().slice(0, 10)),
    transactionTime: String(row.transaction_time || '12:00').slice(0, 5),
    receiptUrl: row.receipt_url ? String(row.receipt_url) : undefined,
    receiptName: row.receipt_name ? String(row.receipt_name) : undefined,
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    notes: row.notes ? String(row.notes) : undefined,
    createdAt: row.created_at ? String(row.created_at) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
}

// Compress receipt image before upload (to max 1280px, ~200-300KB)
export async function compressReceiptImage(file: File): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1280;
        const MAX_HEIGHT = 1280;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context tidak tersedia'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, dataUrl });
            } else {
              reject(new Error('Gagal mengompresi gambar bukti transfer'));
            }
          },
          'image/jpeg',
          0.82
        );
      };
      img.onerror = () => reject(new Error('Gagal memuat gambar bukti transfer'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.readAsDataURL(file);
  });
}

// Upload receipt image with automatic Supabase storage and Base64 fallback
export async function uploadReceipt(file: File, userId?: string): Promise<{ url: string; name: string }> {
  const { blob, dataUrl } = await compressReceiptImage(file);
  const fileName = `receipt_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

  // Try Supabase Storage upload
  try {
    const uid = userId || 'public';
    const filePath = `${uid}/${fileName}`;
    const { error } = await supabase.storage
      .from('task-files')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (!error) {
      const { data } = supabase.storage.from('task-files').getPublicUrl(filePath);
      if (data?.publicUrl) {
        return { url: data.publicUrl, name: file.name };
      }
    }
  } catch (storageErr) {
    console.warn('Supabase storage upload fallback to local dataUrl:', storageErr);
  }

  // Graceful fallback to dataUrl
  return { url: dataUrl, name: file.name };
}

// Fetch all transactions
export async function getTransactions(workspaceFilter?: string): Promise<FinanceTransaction[]> {
  try {
    let query = supabase
      .from('finance_transactions')
      .select('*')
      .order('transaction_date', { ascending: false })
      .order('transaction_time', { ascending: false });

    if (workspaceFilter && workspaceFilter !== 'all') {
      query = query.or(`workspace_id.eq.${workspaceFilter},workspace_id.eq.joint`);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Error fetching transactions from Supabase, using local fallback:', error.message);
      return getLocalTransactions();
    }

    const mapped = (data || []).map(mapRowToTx);
    saveLocalTransactions(mapped);
    return mapped;
  } catch (err) {
    console.warn('Offline or Supabase fetch failed, returning cached transactions:', err);
    return getLocalTransactions();
  }
}

// Add transaction with automatic notification & budget limit checks
export async function addTransaction(
  payload: Omit<FinanceTransaction, 'id' | 'createdAt' | 'updatedAt'>,
  user?: { id?: string; name?: string }
): Promise<FinanceTransaction> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const categoryInfo = getCategoryById(payload.category);

  const newTx: FinanceTransaction = {
    ...payload,
    id,
    userId: user?.id || payload.userId,
    userName: user?.name || payload.userName || 'Pengguna',
    categoryLabel: categoryInfo.name,
    createdAt: now,
    updatedAt: now
  };

  // 1. Optimistic local cache update
  const localList = getLocalTransactions();
  const updatedLocal = [newTx, ...localList.filter((t) => t.id !== id)];
  saveLocalTransactions(updatedLocal);

  // 2. Insert to Supabase
  try {
    const { data, error } = await supabase
      .from('finance_transactions')
      .insert({
        id: newTx.id,
        user_id: newTx.userId,
        user_name: newTx.userName,
        workspace_id: newTx.workspaceId,
        type: newTx.type,
        amount: newTx.amount,
        category: newTx.category,
        category_label: newTx.categoryLabel,
        description: newTx.description,
        merchant: newTx.merchant || null,
        payment_method: newTx.paymentMethod,
        transaction_date: newTx.transactionDate,
        transaction_time: newTx.transactionTime,
        receipt_url: newTx.receiptUrl || null,
        receipt_name: newTx.receiptName || null,
        tags: newTx.tags || [],
        notes: newTx.notes || null,
      })
      .select('*')
      .single();

    if (!error && data) {
      newTx.createdAt = String(data.created_at);
    }
  } catch (dbErr) {
    console.warn('Supabase insert warning, saved locally:', dbErr);
  }

  // 3. Automated Notifications & Budget Limit Checks
  const currentMonth = newTx.transactionDate.slice(0, 7);
  const budget = await getBudget(newTx.workspaceId, currentMonth);

  // Compute total expenses for current month
  const monthlyExpense = updatedLocal
    .filter(
      (t) =>
        t.type === 'expense' &&
        t.transactionDate.startsWith(currentMonth) &&
        (newTx.workspaceId === 'joint' || t.workspaceId === newTx.workspaceId || t.workspaceId === 'joint')
    )
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Check budget limit alert
  if (budget && budget.monthlyLimit > 0 && newTx.type === 'expense') {
    const percentUsed = (monthlyExpense / budget.monthlyLimit) * 100;
    const threshold = budget.alertThreshold || 80;

    if (percentUsed >= 100) {
      // Over-budget alert
      const alertTitle = '🚨 Batas Anggaran Terlampaui!';
      const alertBody = `Pengeluaran bulan ini sudah mencapai ${formatRupiah(monthlyExpense)} (${percentUsed.toFixed(0)}% dari limit ${formatRupiah(budget.monthlyLimit)}). Saatnya berhemat! 🛑`;
      
      void showSystemNotification(alertTitle, alertBody, '/finance', {
        soundType: 'alert',
        channelId: 'fazet_default_channel'
      });

      if (user?.id) {
        void createNotification({
          userId: user.id,
          title: alertTitle,
          message: alertBody,
          type: 'system',
          actionUrl: '/finance'
        }).catch(() => {});
      }
    } else if (percentUsed >= threshold) {
      // Warning approaching limit
      const warnTitle = '⚠️ Pengeluaran Mendekati Limit!';
      const warnBody = `Pengeluaran bulan ini sudah mencapai ${percentUsed.toFixed(0)}% (${formatRupiah(monthlyExpense)} dari batas ${formatRupiah(budget.monthlyLimit)}).`;
      
      void showSystemNotification(warnTitle, warnBody, '/finance', {
        soundType: 'alert',
        channelId: 'fazet_default_channel'
      });

      if (user?.id) {
        void createNotification({
          userId: user.id,
          title: warnTitle,
          message: warnBody,
          type: 'system',
          actionUrl: '/finance'
        }).catch(() => {});
      }
    } else {
      // Normal transaction recorded chime
      playNotificationSound('success');
    }
  } else {
    // Normal transaction chime
    playNotificationSound('success');
  }

  return newTx;
}

// Update transaction
export async function updateTransaction(id: string, updates: Partial<FinanceTransaction>): Promise<void> {
  // Update local
  const localList = getLocalTransactions();
  const updatedList = localList.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
  saveLocalTransactions(updatedList);

  // Update DB
  try {
    const dbPayload: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };
    if (updates.type) dbPayload.type = updates.type;
    if (updates.amount !== undefined) dbPayload.amount = updates.amount;
    if (updates.category) {
      dbPayload.category = updates.category;
      dbPayload.category_label = getCategoryById(updates.category).name;
    }
    if (updates.description) dbPayload.description = updates.description;
    if (updates.merchant !== undefined) dbPayload.merchant = updates.merchant || null;
    if (updates.paymentMethod) dbPayload.payment_method = updates.paymentMethod;
    if (updates.transactionDate) dbPayload.transaction_date = updates.transactionDate;
    if (updates.transactionTime) dbPayload.transaction_time = updates.transactionTime;
    if (updates.receiptUrl !== undefined) dbPayload.receipt_url = updates.receiptUrl || null;
    if (updates.receiptName !== undefined) dbPayload.receipt_name = updates.receiptName || null;
    if (updates.tags) dbPayload.tags = updates.tags;
    if (updates.notes !== undefined) dbPayload.notes = updates.notes || null;
    if (updates.workspaceId) dbPayload.workspace_id = updates.workspaceId;

    await supabase.from('finance_transactions').update(dbPayload).eq('id', id);
  } catch (err) {
    console.warn('Gagal sinkronisasi update transaksi ke Supabase:', err);
  }
}

// Delete transaction
export async function deleteTransaction(id: string): Promise<void> {
  const localList = getLocalTransactions();
  saveLocalTransactions(localList.filter((t) => t.id !== id));

  try {
    await supabase.from('finance_transactions').delete().eq('id', id);
  } catch (err) {
    console.warn('Gagal menghapus transaksi di Supabase:', err);
  }
}

// Fetch Budget
export async function getBudget(workspaceId: string, month: string): Promise<FinanceBudget | null> {
  const localBudgets = getLocalBudgets();
  const local = localBudgets[`${workspaceId}_${month}`] || localBudgets[`fathur_${month}`];

  try {
    const { data, error } = await supabase
      .from('finance_budgets')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('month', month)
      .maybeSingle();

    if (!error && data) {
      const budget: FinanceBudget = {
        id: String(data.id),
        userId: data.user_id ? String(data.user_id) : undefined,
        workspaceId: String(data.workspace_id),
        month: String(data.month),
        monthlyLimit: Number(data.monthly_limit) || 0,
        categoryLimits: (data.category_limits as Record<string, number>) || {},
        alertThreshold: Number(data.alert_threshold) || 80,
        dailyReminderEnabled: Boolean(data.daily_reminder_enabled),
        createdAt: data.created_at ? String(data.created_at) : undefined,
        updatedAt: data.updated_at ? String(data.updated_at) : undefined,
      };
      saveLocalBudget(budget);
      return budget;
    }
  } catch (err) {
    console.warn('Supabase fetch budget failed, using local cache:', err);
  }

  return local || {
    workspaceId,
    month,
    monthlyLimit: 0,
    categoryLimits: {},
    alertThreshold: 80,
    dailyReminderEnabled: true
  };
}

// Save Budget
export async function saveBudget(budget: FinanceBudget): Promise<void> {
  saveLocalBudget(budget);

  try {
    await supabase
      .from('finance_budgets')
      .upsert({
        workspace_id: budget.workspaceId,
        month: budget.month,
        monthly_limit: budget.monthlyLimit,
        category_limits: budget.categoryLimits || {},
        alert_threshold: budget.alertThreshold || 80,
        daily_reminder_enabled: budget.dailyReminderEnabled ?? true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'workspace_id,month' });
  } catch (err) {
    console.warn('Gagal menyimpan budget ke Supabase:', err);
  }
}

// Calculate Summary
export function calculateFinanceSummary(
  transactions: FinanceTransaction[],
  targetMonth: string,
  budgetLimit: number = 0,
  alertThreshold: number = 80
): FinanceSummary {
  const todayStr = new Date().toISOString().slice(0, 10);
  let totalBalance = 0;
  let monthlyIncome = 0;
  let monthlyExpense = 0;
  let todayExpense = 0;

  const categoryMap = new Map<string, { amount: number; count: number }>();

  transactions.forEach((tx) => {
    // All time balance calculation
    if (tx.type === 'income') {
      totalBalance += tx.amount;
    } else if (tx.type === 'expense') {
      totalBalance -= tx.amount;
    }

    // Monthly calculation
    if (tx.transactionDate.startsWith(targetMonth)) {
      if (tx.type === 'income') {
        monthlyIncome += tx.amount;
      } else if (tx.type === 'expense') {
        monthlyExpense += tx.amount;

        const current = categoryMap.get(tx.category) || { amount: 0, count: 0 };
        categoryMap.set(tx.category, {
          amount: current.amount + tx.amount,
          count: current.count + 1
        });
      }
    }

    // Today expense
    if (tx.transactionDate === todayStr && tx.type === 'expense') {
      todayExpense += tx.amount;
    }
  });

  const categoryStats: CategoryStat[] = Array.from(categoryMap.entries())
    .map(([catId, data]) => {
      const cat = getCategoryById(catId);
      return {
        category: catId,
        label: cat.name,
        color: cat.color,
        bgColor: cat.bgColor,
        amount: data.amount,
        count: data.count,
        percentage: monthlyExpense > 0 ? (data.amount / monthlyExpense) * 100 : 0
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const budgetUsedPercent = budgetLimit > 0 ? (monthlyExpense / budgetLimit) * 100 : 0;
  const budgetRemaining = Math.max(0, budgetLimit - monthlyExpense);
  const isOverBudget = budgetLimit > 0 && monthlyExpense > budgetLimit;
  const isNearBudgetLimit = budgetLimit > 0 && budgetUsedPercent >= alertThreshold && !isOverBudget;

  return {
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    todayExpense,
    netSavings: monthlyIncome - monthlyExpense,
    monthlyLimit: budgetLimit,
    budgetUsedPercent,
    budgetRemaining,
    isOverBudget,
    isNearBudgetLimit,
    categoryStats
  };
}

// Export Transactions to CSV
export function exportFinanceToCsv(transactions: FinanceTransaction[], filename = 'laporan_keuangan_fazet.csv') {
  const headers = ['Tanggal', 'Waktu', 'Tipe', 'Kategori', 'Keterangan', 'Merchant/Tempat', 'Nominal (Rp)', 'Metode Pembayaran', 'Workspace', 'Bukti Transfer/Struk'];
  
  const rows = transactions.map((t) => [
    t.transactionDate,
    t.transactionTime,
    t.type === 'expense' ? 'Pengeluaran' : t.type === 'income' ? 'Pemasukan' : 'Transfer',
    `"${t.categoryLabel.replace(/"/g, '""')}"`,
    `"${t.description.replace(/"/g, '""')}"`,
    `"${(t.merchant || '-').replace(/"/g, '""')}"`,
    t.amount,
    `"${t.paymentMethod.toUpperCase()}"`,
    t.workspaceId.toUpperCase(),
    t.receiptUrl ? `"${t.receiptUrl}"` : '-'
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
