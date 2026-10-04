import { useEffect, useRef } from 'react';

export default function AnimatedBackground() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on desktop/devices with a pointer
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      return;
    }

    let ticking = false;
    const updateMousePosition = (e: MouseEvent) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (glowRef.current) {
            glowRef.current.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, var(--tf-primary-subtle), transparent 40%)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('mousemove', updateMousePosition, { passive: true });
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[var(--tf-bg)] transition-colors duration-700">
      
      {/* 
        Sembunyikan blob animasi di mobile (hidden md:block) karena 
        filter blur-100px sangat berat untuk GPU HP dan menyebabkan flickering. 
      */}
      <div className="hidden md:block absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--tf-primary)]/5 rounded-full blur-[80px] animate-blob will-change-transform" />
      <div className="hidden md:block absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-[var(--tf-primary)]/5 rounded-full blur-[80px] animate-blob animation-delay-2000 will-change-transform" />
      <div className="hidden md:block absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-[var(--tf-primary)]/5 rounded-full blur-[80px] animate-blob animation-delay-4000 will-change-transform" />
      
      {/* Cursor tracking glow - Also hidden on mobile since touch doesn't need a hover glow */}
      <div 
        ref={glowRef}
        className="hidden md:block absolute inset-0 transition-opacity duration-300 will-change-[background]"
      />
    </div>
  );
}
