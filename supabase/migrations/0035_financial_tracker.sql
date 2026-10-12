-- Migration 0035: Fitur Pencatat Keuangan & Bukti Transfer FAZET
-- Mendukung transaksi pengeluaran (Bensin, Jajan, dll), pemasukan, bukti transfer, dan sistem notifikasi limit budget

CREATE TABLE IF NOT EXISTS public.finance_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    user_name text NOT NULL DEFAULT '',
    workspace_id text NOT NULL DEFAULT 'fathur',
    type text NOT NULL CHECK (type IN ('expense', 'income', 'transfer')),
    amount numeric NOT NULL CHECK (amount >= 0),
    category text NOT NULL,
    category_label text NOT NULL DEFAULT '',
    description text NOT NULL,
    merchant text,
    payment_method text NOT NULL DEFAULT 'cash',
    transaction_date date NOT NULL DEFAULT current_date,
    transaction_time time NOT NULL DEFAULT current_time,
    receipt_url text,
    receipt_name text,
    tags text[] DEFAULT '{}',
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_finance_workspace_date 
ON public.finance_transactions(workspace_id, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_finance_user_date 
ON public.finance_transactions(user_id, transaction_date DESC);

-- Tabel Pengaturan Budget Bulanan & Ambang Batas Notifikasi
CREATE TABLE IF NOT EXISTS public.finance_budgets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    workspace_id text NOT NULL DEFAULT 'fathur',
    month text NOT NULL, -- Format: YYYY-MM
    monthly_limit numeric NOT NULL DEFAULT 0,
    category_limits jsonb DEFAULT '{}'::jsonb,
    alert_threshold integer DEFAULT 80, -- Persentase saat peringatan muncul (default 80%)
    daily_reminder_enabled boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT uq_finance_budget_workspace_month UNIQUE (workspace_id, month)
);

-- Row Level Security (RLS)
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_budgets ENABLE ROW LEVEL SECURITY;

-- Policies untuk finance_transactions
CREATE POLICY "View finance transactions" 
ON public.finance_transactions FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Insert finance transactions" 
ON public.finance_transactions FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Update finance transactions" 
ON public.finance_transactions FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Delete finance transactions" 
ON public.finance_transactions FOR DELETE 
TO authenticated 
USING (true);

-- Policies untuk finance_budgets
CREATE POLICY "View finance budgets" 
ON public.finance_budgets FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Manage finance budgets" 
ON public.finance_budgets FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
