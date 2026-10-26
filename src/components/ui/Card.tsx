import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import RandomMotion from './RandomMotion';
import { HTMLMotionProps } from 'framer-motion';

type Props = HTMLMotionProps<"div"> & {
  children: ReactNode;
  variant?: 'flat' | 'raised' | 'glass' | 'outline';
  interactive?: boolean;
};

export default function Card({ children, className, variant = 'raised', interactive = false, ...props }: Props) {
  const variants = {
    flat: 'bg-[var(--tf-bg-surface)] shadow-none',
    raised: 'bg-[var(--tf-bg-surface)] shadow-[var(--tf-shadow-raised)]',
    glass: 'bg-[color-mix(in_srgb,var(--tf-bg-surface)_86%,transparent)] backdrop-blur-xl shadow-[var(--tf-shadow-floating)]',
    outline: 'bg-transparent border border-[var(--tf-border)] shadow-none',
  };
  return (
    <RandomMotion
      {...props}
      className={cn(
        'relative rounded-[var(--tf-radius-card)] border border-[var(--tf-border)] text-[var(--tf-text-primary)] transition-[transform,box-shadow,border-color] duration-200 ease-[var(--tf-ease)] block',
        variants[variant],
        interactive && 'cursor-pointer hover:-translate-y-[2px] hover:border-[var(--tf-accent)]/45 hover:shadow-[var(--tf-shadow-floating)]',
        className,
      )}
    >
      <div className="relative z-10 h-full">{children}</div>
    </RandomMotion>
  );
}

export { Card };
