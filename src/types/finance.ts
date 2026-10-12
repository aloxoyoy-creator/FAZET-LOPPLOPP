export type TransactionType = 'expense' | 'income' | 'transfer';

export type FinanceWorkspace = 'fathur' | 'mazet' | 'joint';

export interface FinanceTransaction {
  id: string;
  userId?: string;
  userName?: string;
  workspaceId: FinanceWorkspace;
  type: TransactionType;
  amount: number;
  category: string;
  categoryLabel: string;
  description: string;
  merchant?: string;
  paymentMethod: string;
  transactionDate: string; // YYYY-MM-DD
  transactionTime: string; // HH:mm
  receiptUrl?: string;     // URL file bukti transfer / gambar nota
  receiptName?: string;
  tags?: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FinanceBudget {
  id?: string;
  userId?: string;
  workspaceId: string;
  month: string; // YYYY-MM
  monthlyLimit: number;
  categoryLimits?: Record<string, number>;
  alertThreshold: number; // e.g. 80 (80%)
  dailyReminderEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FinanceCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  textColor: string;
  bgColor: string;
  type: 'expense' | 'income' | 'both';
  examples?: string;
}

export interface PaymentMethodOption {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'ewallet' | 'card' | 'other';
  badgeColor: string;
}

export interface CategoryStat {
  category: string;
  label: string;
  color: string;
  bgColor: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface FinanceSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  todayExpense: number;
  netSavings: number;
  monthlyLimit: number;
  budgetUsedPercent: number;
  budgetRemaining: number;
  isOverBudget: boolean;
  isNearBudgetLimit: boolean;
  categoryStats: CategoryStat[];
}

export interface FinanceFilter {
  month: string; // 'YYYY-MM' or 'all'
  type: 'all' | 'expense' | 'income';
  category: string; // 'all' or specific category
  workspace: 'all' | FinanceWorkspace;
  searchQuery: string;
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
}
