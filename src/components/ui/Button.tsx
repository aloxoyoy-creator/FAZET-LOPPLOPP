import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'soft' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  isLoading?: boolean;
  icon?: ReactNode;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
};

const variants: Record<NonNullable<Props['variant']>, string> = {
  primary: 'bg-[var(--tf-primary)] text-[var(--tf-bg-surface)] hover:bg-[var(--tf-primary-hover)] shadow-xs',
  secondary: 'bg-[var(--tf-bg-subtle)] text-[var(--tf-text-primary)] border border-[var(--tf-border)] hover:border-[var(--tf-accent)]/40 hover:bg-[var(--tf-bg-surface)]',
  soft: 'bg-[var(--tf-accent-soft)] text-[var(--tf-accent)] border border-[var(--tf-accent)]/20 hover:bg-[var(--tf-accent)]/18',
  ghost: 'bg-transparent text-[var(--tf-text-secondary)] border border-transparent hover:border-[var(--tf-border)] hover:bg-[var(--tf-bg-subtle)] hover:text-[var(--tf-text-primary)]',
  danger: 'bg-[var(--tf-danger)] text-white hover:opacity-90 shadow-xs',
  outline: 'bg-[var(--tf-bg-surface)] text-[var(--tf-text-primary)] border border-[var(--tf-border)] hover:border-[var(--tf-accent)]/50 hover:bg-[var(--tf-bg-subtle)]',
};

const sizes: Record<NonNullable<Props['size']>, string> = {
  sm: 'min-h-[34px] px-3.5 py-1.5 text-xs gap-1.5 rounded-[var(--tf-radius-control)]',
  md: 'min-h-[40px] px-4 py-2 text-xs sm:text-sm gap-2 rounded-[var(--tf-radius-control)]',
  lg: 'min-h-[46px] px-5 py-2.5 text-sm gap-2.5 rounded-[var(--tf-radius-card)]',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  isLoading = false,
  icon,
  iconLeft,
  iconRight,
  fullWidth = false,
  children,
  className,
  ...props
}: Props) {
  const busy = loading || isLoading;
  return (
    <button
      {...props}
      disabled={busy || props.disabled}
      className={cn(
        'inline-flex items-center justify-center font-medium tracking-[-0.01em] transition-all duration-200 ease-[var(--tf-ease)] select-none cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-ring active:scale-[0.99]',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
    >
      {busy ? <LoaderCircle className="animate-spin shrink-0" size={15} /> : (iconLeft ?? icon)}
      <span className="truncate">{children}</span>
      {!busy && iconRight}
    </button>
  );
}

export { Button };
