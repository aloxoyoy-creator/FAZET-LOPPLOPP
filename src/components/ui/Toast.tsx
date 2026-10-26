import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

type ToastTone = 'success' | 'error' | 'info' | 'danger' | 'warning';
type ToastItem = { id: number; tone: ToastTone; title: string; message?: string; description?: string };
type ToastContextValue = { push: (toast: Omit<ToastItem, 'id'>) => void };
const ToastContext = createContext<ToastContextValue | null>(null);
let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = ++toastId;
    setItems((current) => [...current, { ...toast, id }].slice(-4));
    window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 4200);
  }, []);
  const value = useMemo(() => ({ push }), [push]);
  return <ToastContext.Provider value={value}>
    {children}
    <div className="pointer-events-none fixed inset-x-4 top-4 z-[100] mx-auto flex max-w-md flex-col gap-2 sm:right-4 sm:left-auto sm:mx-0">
      {items.map((item) => <ToastView key={item.id} item={item} onClose={() => setItems((current) => current.filter((x) => x.id !== item.id))} />)}
    </div>
  </ToastContext.Provider>;
}

function ToastView({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const meta = {
    success: { Icon: CheckCircle2, wrap: 'border-[var(--tf-border)] bg-[var(--tf-bg-surface)]', icon: 'bg-[var(--tf-success-bg)] text-[var(--tf-success)]' },
    error: { Icon: CircleAlert, wrap: 'border-[var(--tf-border)] bg-[var(--tf-bg-surface)]', icon: 'bg-[var(--tf-danger-bg)] text-[var(--tf-danger)]' },
    danger: { Icon: CircleAlert, wrap: 'border-[var(--tf-border)] bg-[var(--tf-bg-surface)]', icon: 'bg-[var(--tf-danger-bg)] text-[var(--tf-danger)]' },
    warning: { Icon: CircleAlert, wrap: 'border-[var(--tf-border)] bg-[var(--tf-bg-surface)]', icon: 'bg-[var(--tf-warning-bg)] text-[var(--tf-warning)]' },
    info: { Icon: Info, wrap: 'border-[var(--tf-border)] bg-[var(--tf-bg-surface)]', icon: 'bg-[var(--tf-accent-soft)] text-[var(--tf-accent)]' },
  }[item.tone];
  const Icon = meta.Icon;
  const body = item.message || item.description;
  return <div className={cn('pointer-events-auto flex items-start gap-3 rounded-2xl border p-3.5 shadow-[var(--tf-shadow-floating)] backdrop-blur animate-in', meta.wrap)}>
    <div className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl', meta.icon)}><Icon size={16} /></div>
    <div className="min-w-0 flex-1"><p className="text-xs font-semibold text-[var(--tf-text-primary)]">{item.title}</p>{body && <p className="mt-0.5 text-[11px] leading-4 text-[var(--tf-text-muted)]">{body}</p>}</div>
    <button type="button" onClick={onClose} className="focus-ring rounded-lg p-1 text-[var(--tf-text-muted)] hover:bg-[var(--tf-bg-subtle)]" aria-label="Tutup notifikasi"><X size={14} /></button>
  </div>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
