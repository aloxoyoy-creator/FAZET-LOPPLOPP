type Props = { className?: string; variant?: 'text' | 'rectangular' | 'circular'; width?: string | number; height?: string | number };
export default function Skeleton({ className = '', variant = 'rectangular', width, height }: Props) {
  const radius = variant === 'circular' ? 'rounded-full' : variant === 'text' ? 'rounded-[var(--tf-radius-xs)] h-4' : 'rounded-[var(--tf-radius-md)]';
  return <div aria-hidden="true" className={`animate-pulse bg-[var(--tf-bg-subtle)] ${radius} ${className}`} style={{ width: typeof width === 'number' ? `${width}px` : width, height: typeof height === 'number' ? `${height}px` : height }} />;
}
