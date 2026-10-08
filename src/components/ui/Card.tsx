import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';
import RandomMotion from './RandomMotion';

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
    <RandomMotion
      {...props}
      className={cn(
        'relative rounded-[var(--tf-radius-card)] border border-[var(--tf-border)] text-[var(--tf-text-primary)] transition-[transform,box-shadow,border-color] duration-[var(--tf-dur-base)] ease-[var(--tf-ease)] block',
        'before:absolute before:inset-0 before:pointer-events-none before:rounded-[var(--tf-radius-card)] before:shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] dark:before:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]',
        variants[variant],
        interactive && 'cursor-pointer hover:-translate-y-[3px] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)]',
        className,
      )}
    >
      <div className="relative z-10 h-full">{children}</div>
    </RandomMotion>
  );
}

export { Card };
