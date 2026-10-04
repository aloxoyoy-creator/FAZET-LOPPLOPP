import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

type Props = {
  children: ReactNode;
  tone?: 'blue' | 'green' | 'amber' | 'red' | 'slate' | 'purple';
  variant?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'fathur' | 'mazet';
  size?: 'sm' | 'md';
  className?: string;
};

export default function Badge({ children, tone, variant, size = 'md', className }: Props) {
  const styles = {
    neutral: 'bg-[var(--tf-bg-subtle)] text-[var(--tf-text-secondary)]',
    primary: 'bg-[var(--tf-primary-subtle)] text-[var(--tf-primary)]',
    success: 'bg-[var(--tf-success-bg)] text-[var(--tf-success)]',
    warning: 'bg-[var(--tf-warning-bg)] text-[var(--tf-warning)]',
    danger: 'bg-[var(--tf-danger-bg)] text-[var(--tf-danger)]',
    fathur: 'bg-[var(--tf-fathur-subtle)] text-[var(--tf-fathur)]',
    mazet: 'bg-[var(--tf-mazet-subtle)] text-[var(--tf-mazet)]',
  } as const;
  const toneMap = { blue: 'primary', green: 'success', amber: 'warning', red: 'danger', purple: 'mazet', slate: 'neutral' } as const;
  const mapped: keyof typeof styles = variant ?? toneMap[tone ?? 'slate'];
  return <span className={cn('inline-flex items-center gap-1.5 rounded-full whitespace-nowrap font-semibold', size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs', styles[mapped], className)}>{children}</span>;
}

export function Chip({ label, active = false, count, icon, onClick, className }: { label: string; active?: boolean; count?: number; icon?: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick} className={cn('inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 text-xs font-semibold rounded-full transition-all select-none whitespace-nowrap', active ? 'bg-[var(--tf-primary)] text-white shadow-sm' : 'bg-[var(--tf-bg-subtle)] text-[var(--tf-text-secondary)] border border-[var(--tf-border)] hover:text-[var(--tf-text-primary)]', className)}>
      {icon}
      <span>{label}</span>
      {count !== undefined && <span className={cn('ml-1 rounded-full px-1.5 text-[10px]', active ? 'bg-white/20' : 'bg-[var(--tf-bg-surface)] text-[var(--tf-text-muted)]')}>{count}</span>}
    </button>
  );
}
