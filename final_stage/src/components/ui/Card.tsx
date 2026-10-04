import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

type Props = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  variant?: 'flat' | 'raised' | 'glass' | 'outline';
  interactive?: boolean;
};

export default function Card({ children, className, variant = 'raised', interactive = false, ...props }: Props) {
  const variants = {
    flat: 'bg-[var(--tf-bg-surface)] shadow-[var(--tf-shadow-flat)]',
    raised: 'bg-[var(--tf-bg-surface)] shadow-[var(--tf-shadow-raised)]',
    glass: 'bg-[color-mix(in_srgb,var(--tf-bg-surface)_82%,transparent)] backdrop-blur-md shadow-[var(--tf-shadow-floating)]',
    outline: 'bg-transparent border border-[var(--tf-border)] shadow-none',
  };
  return (
    <section
      {...props}
      className={cn(
        'rounded-[var(--tf-radius-card)] border border-[var(--tf-border)] text-[var(--tf-text-primary)] transition-[transform,box-shadow,border-color] duration-[var(--tf-dur-base)] ease-[var(--tf-ease)]',
        variants[variant],
        interactive && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-[var(--tf-shadow-floating)]',
        className,
      )}
    >
      {children}
    </section>
  );
}

export { Card };
