import { useState, useEffect, ReactNode } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { clearAppCaches } from '../../lib/utils';

export default function PullToRefresh({ children }: { children: ReactNode }) {
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const pullThreshold = 80;

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        setStartY(e.touches[0].clientY);
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || isRefreshing) return;
      const y = e.touches[0].clientY;
      if (y > startY) {
        // Prevent default scrolling when pulling down at the very top
        if (e.cancelable) e.preventDefault();
        setCurrentY(y - startY);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;
      setIsPulling(false);
      
      if (currentY > pullThreshold && !isRefreshing) {
        setIsRefreshing(true);
        // Execute refresh & clear cache
        await clearAppCaches();
        window.location.reload();
      } else {
        setCurrentY(0);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [startY, currentY, isPulling, isRefreshing]);

  const height = isRefreshing ? pullThreshold : Math.min(currentY, pullThreshold);
  const rotation = Math.min(currentY * 2, 360);

  return (
    <div className="relative">
      {/* Pull indicator */}
      <div 
        className="absolute w-full flex justify-center items-end overflow-hidden transition-all duration-200"
        style={{ height: `${height}px`, top: `-${height}px` }}
      >
        <div className="flex items-center justify-center p-4 text-blue-500">
          {isRefreshing ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <div 
              className="bg-white dark:bg-slate-800 rounded-full shadow-md p-2 transition-transform"
              style={{ transform: `rotate(${rotation}deg)`, opacity: Math.min(currentY / pullThreshold, 1) }}
            >
              <RefreshCw size={20} />
            </div>
          )}
        </div>
      </div>
      
      <div 
        className="transition-transform duration-200" 
        style={{ transform: `translateY(${height}px)` }}
      >
        {children}
      </div>
    </div>
  );
}
