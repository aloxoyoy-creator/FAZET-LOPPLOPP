import { X } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  wide?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
};

export default function Modal({ open, isOpen, onClose, title = '', children, wide = false, maxWidth = 'md' }: Props) {
  const visible = isOpen ?? open ?? false;
  if (!visible) return null;
  const width = wide ? 'max-w-3xl' : ({ sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[maxWidth]);
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-3 sm:p-4 backdrop-blur-md transition-all duration-300 animate-in fade-in" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`fade-up w-full ${width} max-h-[92dvh] overflow-auto rounded-[var(--tf-radius-card)] border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] text-[var(--tf-text-primary)] shadow-[0_30px_80px_rgba(0,0,0,0.4)]`}>
        {title && <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[var(--tf-border)] bg-[color-mix(in_srgb,var(--tf-bg-surface)_94%,transparent)] px-4 py-3 backdrop-blur-md"><h2 className="font-semibold text-base">{title}</h2><button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-[var(--tf-radius-sm)] text-[var(--tf-text-muted)] hover:bg-[var(--tf-bg-subtle)]" aria-label="Tutup"><X size={17} /></button></div>}
        <div className="p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}
