import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';
import Button from './Button';
import { cn } from '../../lib/utils';

type Props = { title: string; description: string; action?: ReactNode; actionLabel?: string; onAction?: () => void; icon?: ReactNode; className?: string };
export default function EmptyState({ title, description, action, actionLabel, onAction, icon, className }: Props) {
  return <div className={cn('flex min-h-48 flex-col items-center justify-center rounded-[var(--tf-radius-card)] border border-dashed border-[var(--tf-border)] bg-[var(--tf-bg-surface)]/45 p-8 text-center', className)}>
    <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-[var(--tf-bg-subtle)] text-[var(--tf-text-muted)]">{icon ?? <Inbox size={22} />}</div>
    <h3 className="font-semibold text-[var(--tf-text-primary)]">{title}</h3>
    <p className="mt-1 max-w-sm text-sm text-[var(--tf-text-muted)]">{description}</p>
    {action ?? (actionLabel && onAction ? <Button size="sm" variant="soft" className="mt-4" onClick={onAction}>{actionLabel}</Button> : null)}
  </div>;
}
