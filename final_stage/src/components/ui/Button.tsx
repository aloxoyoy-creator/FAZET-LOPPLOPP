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
  primary: 'bg-[var(--tf-primary)] text-white hover:bg-[var(--tf-primary-hover)] shadow-[var(--tf-shadow-raised)]',
  secondary: 'bg-[var(--tf-bg-subtle)] text-[var(--tf-text-primary)] border border-[var(--tf-border)] hover:opacity-90',
  soft: 'bg-[var(--tf-primary-subtle)] text-[var(--tf-primary)] hover:opacity-90',
  ghost: 'bg-transparent text-[var(--tf-text-secondary)] border border-[var(--tf-border)] hover:bg-[var(--tf-bg-subtle)] hover:text-[var(--tf-text-primary)]',
  danger: 'bg-[var(--tf-danger)] text-white hover:opacity-90',
  outline: 'bg-[var(--tf-bg-surface)] text-[var(--tf-primary)] border border-[var(--tf-primary)] hover:bg-[var(--tf-primary-subtle)]',
};

const sizes: Record<NonNullable<Props['size']>, string> = {
  sm: 'min-h-[36px] px-3 py-1.5 text-xs gap-1.5 rounded-[var(--tf-radius-sm)]',
  md: 'min-h-[44px] px-4 py-2 text-sm gap-2 rounded-[var(--tf-radius-md)]',
  lg: 'min-h-[48px] px-6 py-3 text-base gap-2.5 rounded-[var(--tf-radius-lg)]',
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
        'inline-flex items-center justify-center font-semibold transition-all duration-[var(--tf-dur-fast)] ease-[var(--tf-ease)] select-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-ring',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
    >
      {busy ? <LoaderCircle className="animate-spin shrink-0" size={16} /> : (iconLeft ?? icon)}
      <span className="truncate">{children}</span>
      {!busy && iconRight}
    </button>
  );
}

export { Button };
