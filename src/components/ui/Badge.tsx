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
    neutral: 'bg-[var(--tf-bg-subtle)] text-[var(--tf-text-secondary)] border border-[var(--tf-border)]',
    primary: 'bg-[var(--tf-accent-soft)] text-[var(--tf-accent)] border border-[var(--tf-accent)]/20',
    success: 'bg-[var(--tf-success-bg)] text-[var(--tf-success)] border border-[var(--tf-success)]/20',
    warning: 'bg-[var(--tf-warning-bg)] text-[var(--tf-warning)] border border-[var(--tf-warning)]/20',
    danger: 'bg-[var(--tf-danger-bg)] text-[var(--tf-danger)] border border-[var(--tf-danger)]/20',
    fathur: 'bg-[var(--tf-fathur-subtle)] text-[var(--tf-fathur)] border border-[var(--tf-fathur)]/20',
    mazet: 'bg-[var(--tf-mazet-subtle)] text-[var(--tf-mazet)] border border-[var(--tf-mazet)]/20',
  } as const;
  const toneMap = { blue: 'primary', green: 'success', amber: 'warning', red: 'danger', purple: 'mazet', slate: 'neutral' } as const;
  const mapped: keyof typeof styles = variant ?? toneMap[tone ?? 'slate'];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full whitespace-nowrap font-medium tracking-wide',
        size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-[11px]',
        styles[mapped],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Chip({
  label,
  active = false,
  count,
  icon,
  onClick,
  className,
}: {
  label: string;
  active?: boolean;
  count?: number;
  icon?: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 min-h-[34px] px-3.5 py-1.5 text-xs font-medium rounded-full transition-all select-none whitespace-nowrap cursor-pointer',
        active
          ? 'bg-[var(--tf-primary)] text-[var(--tf-bg-surface)] shadow-2xs'
          : 'bg-[var(--tf-bg-surface)] text-[var(--tf-text-secondary)] border border-[var(--tf-border)] hover:border-[var(--tf-accent)]/40 hover:text-[var(--tf-text-primary)]',
        className
      )}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            'ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-mono',
            active ? 'bg-white/20 text-current' : 'bg-[var(--tf-bg-subtle)] text-[var(--tf-text-muted)]'
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
