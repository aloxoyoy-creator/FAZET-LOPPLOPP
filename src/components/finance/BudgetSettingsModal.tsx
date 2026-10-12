import { useState, useEffect } from 'react';
import { Target, Bell, AlertTriangle, ShieldCheck, Sparkles, Volume2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { formatRupiah } from '../../data/financeCategories';
import type { FinanceBudget } from '../../types/finance';
import { showSystemNotification, playNotificationSound } from '../../services/systemNotificationService';
import { useToast } from '../ui/Toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  budget: FinanceBudget | null;
  workspaceId: string;
  month: string;
  onSave: (budget: FinanceBudget) => Promise<void>;
}

export default function BudgetSettingsModal({
  isOpen,
  onClose,
  budget,
  workspaceId,
  month,
  onSave
}: Props) {
  const toast = useToast();
  const [limitStr, setLimitStr] = useState('');
  const [alertThreshold, setAlertThreshold] = useState(80);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (budget) {
      setLimitStr(budget.monthlyLimit > 0 ? String(Math.round(budget.monthlyLimit)) : '');
      setAlertThreshold(budget.alertThreshold || 80);
      setDailyReminder(budget.dailyReminderEnabled ?? true);
    } else {
      setLimitStr('');
      setAlertThreshold(80);
      setDailyReminder(true);
    }
  }, [budget, isOpen]);

  const handleLimitChange = (val: string) => {
    const raw = val.replace(/\D/g, '');
    setLimitStr(raw);
  };

  const addLimit = (amount: number) => {
    const cur = Number(limitStr) || 0;
    setLimitStr(String(cur + amount));
  };

  const handleTestNotification = () => {
    playNotificationSound('alert');
    void showSystemNotification(
      '⚠️ Uji Coba: Peringatan Budget FAZET',
      `Ini adalah contoh simulasi notifikasi otomatis saat pengeluaran bulananmu mencapai ${alertThreshold}% dari target.`,
      '/finance',
      { soundType: 'alert' }
    );
    toast.push({
      tone: 'info',
      title: 'Notifikasi Otomatis Diuji! 🔔',
      message: 'Bunyi alarm dan notifikasi sistem telah dikirimkan.'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        workspaceId,
        month,
        monthlyLimit: Number(limitStr) || 0,
        categoryLimits: budget?.categoryLimits || {},
        alertThreshold,
        dailyReminderEnabled: dailyReminder
      });
      onClose();
    } catch {
      // toast already handled
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pengaturan Budget & Notifikasi Otomatis" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Monthly Limit Field */}
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-[var(--tf-text-muted)] mb-1.5 flex items-center gap-1.5">
            <Target size={14} className="text-indigo-500" />
            Target Maksimal Pengeluaran Bulanan (Bulan {month})
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-[var(--tf-text-muted)]">
              Rp
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={limitStr ? Number(limitStr).toLocaleString('id-ID') : ''}
              onChange={(e) => handleLimitChange(e.target.value)}
              placeholder="Contoh: 1.500.000"
              className="w-full pl-14 pr-4 py-3 text-xl font-black font-mono rounded-2xl border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] text-[var(--tf-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Quick pills */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {[500000, 1000000, 1500000, 2000000, 3000000].map((quick) => (
              <button
                key={quick}
                type="button"
                onClick={() => setLimitStr(String(quick))}
                className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-xl bg-[var(--tf-bg-subtle)] hover:bg-[var(--tf-border)] border border-[var(--tf-border)] text-[var(--tf-text-secondary)] transition-colors active:scale-95"
              >
                {formatRupiah(quick)}
              </button>
            ))}
          </div>
        </div>

        {/* Ambang Batas Peringatan (Alert Threshold) */}
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-[var(--tf-text-muted)] mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-amber-500" />
              Batas Peringatan Otomatis (Alert Threshold)
            </span>
            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
              {alertThreshold}% Terpakai
            </span>
          </label>
          <p className="text-xs text-[var(--tf-text-muted)] mb-2 leading-relaxed">
            Sistem akan secara otomatis membunyikan alarm dan memunculkan notifikasi peringatan jika pengeluaran bulan ini menyentuh persentase ini.
          </p>
          <div className="grid grid-cols-4 gap-2">
            {[70, 75, 80, 90].map((th) => (
              <button
                key={th}
                type="button"
                onClick={() => setAlertThreshold(th)}
                className={`py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                  alertThreshold === th
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-[var(--tf-bg-subtle)] text-[var(--tf-text-muted)] border-[var(--tf-border)] hover:bg-[var(--tf-border)]'
                }`}
              >
                {th}%
              </button>
            ))}
          </div>
        </div>

        {/* Toggle Pengingat Harian & Test Button */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                <Bell size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--tf-text-primary)]">
                  Pengingat Catat Keuangan Harian
                </div>
                <div className="text-[11px] text-[var(--tf-text-muted)]">
                  Pengingat otomatis setiap malam (20:00 WIB)
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={dailyReminder}
              onChange={(e) => setDailyReminder(e.target.checked)}
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          <div className="pt-2 border-t border-indigo-200/30 dark:border-indigo-900/30 flex justify-end">
            <button
              type="button"
              onClick={handleTestNotification}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <Volume2 size={13} /> Uji Notifikasi Suara Sekarang →
            </button>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--tf-border)]">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6"
          >
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
