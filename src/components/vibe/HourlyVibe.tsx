import React, { createContext, useContext, useEffect, useMemo, useState, useRef } from 'react';
import type { ReactNode } from 'react';
import {
  ATMOSPHERE_CYCLES,
  getAtmosphereForHour,
  msUntilNextCycle,
  type AtmosphereCycle,
} from './vibes';
import { Sparkles, Clock, Check, Moon, Sun, Sliders, RefreshCw, X } from 'lucide-react';
import '../../styles/hourly-vibe.css';

type IntensityMode = 'soft' | 'balanced' | 'cinematic';

interface ChronoContextType {
  atmosphere: AtmosphereCycle;
  isAuto: boolean;
  intensity: IntensityMode;
  minutesUntilNext: number;
  setAuto: (auto: boolean) => void;
  setAtmosphereId: (id: string) => void;
  setIntensity: (intensity: IntensityMode) => void;
  resetToCurrentHour: () => void;
  // Compatibility helpers
  vibe: AtmosphereCycle;
  next: AtmosphereCycle;
  minutesLeft: number;
  shuffle: () => void;
  isPreview: boolean;
  reset: () => void;
}

const ChronoContext = createContext<ChronoContextType | null>(null);

export const useChronoAtmosphere = () => {
  const ctx = useContext(ChronoContext);
  if (!ctx) {
    throw new Error('useChronoAtmosphere must be used within an HourlyVibeProvider');
  }
  return ctx;
};

// Compatibility hook
export const useVibe = () => useContext(ChronoContext);

/**
 * Latar Belakang Ambient Sinematik Mewah
 * Memadukan orbaura cairan lambat, micro-film grain, dan aksen spekular ultra-halus.
 */
function ChronoBackground({
  atmosphere,
  intensity,
}: {
  atmosphere: AtmosphereCycle;
  intensity: IntensityMode;
}) {
  const opacityMultiplier = intensity === 'soft' ? 0.6 : intensity === 'cinematic' ? 1.4 : 1.0;

  return (
    <div className="chrono-backdrop" aria-hidden="true">
      {/* Mesh Gradien Ambient Utama */}
      <div
        className="chrono-mesh"
        style={{
          opacity: Math.min(1, atmosphere.lighting.glowOpacity * opacityMultiplier * 1.5),
        }}
      >
        <div
          className="chrono-orb chrono-orb-1"
          style={{
            backgroundColor: atmosphere.colors.primary,
            filter: `blur(${atmosphere.lighting.glowBlur}px)`,
          }}
        />
        <div
          className="chrono-orb chrono-orb-2"
          style={{
            backgroundColor: atmosphere.colors.secondary,
            filter: `blur(${Math.round(atmosphere.lighting.glowBlur * 1.15)}px)`,
          }}
        />
        <div
          className="chrono-orb chrono-orb-3"
          style={{
            backgroundColor: atmosphere.colors.ambient,
            filter: `blur(${Math.round(atmosphere.lighting.glowBlur * 1.3)}px)`,
          }}
        />
      </div>

      {/* Horizon Ambient Wash */}
      <div
        className="chrono-horizon-wash"
        style={{
          background: `radial-gradient(100% 60% at 50% 0%, ${atmosphere.colors.surfaceTint}, transparent 75%)`,
        }}
      />

      {/* Subtly Textured Architectural Noise (Mencegah color banding) */}
      <div
        className="chrono-noise-layer"
        style={{ opacity: atmosphere.lighting.noiseOpacity }}
      />
    </div>
  );
}

export function HourlyVibeProvider({ children }: { children: ReactNode }) {
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());
  const [isAuto, setIsAuto] = useState(() => {
    try {
      const stored = localStorage.getItem('fazet.chrono.isAuto');
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  const [selectedId, setSelectedId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('fazet.chrono.manualId');
    } catch {
      return null;
    }
  });

  const [intensity, setIntensity] = useState<IntensityMode>(() => {
    try {
      const stored = localStorage.getItem('fazet.chrono.intensity') as IntensityMode;
      return stored || 'balanced';
    } catch {
      return 'balanced';
    }
  });

  const [minutesUntilNext, setMinutesUntilNext] = useState(() => {
    return Math.max(1, Math.ceil(msUntilNextCycle() / 60000));
  });

  // Pembaruan waktu otomatis
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const scheduleNextCheck = () => {
      const ms = msUntilNextCycle();
      timer = setTimeout(() => {
        setCurrentHour(new Date().getHours());
        setMinutesUntilNext(Math.max(1, Math.ceil(msUntilNextCycle() / 60000)));
        scheduleNextCheck();
      }, ms + 50);
    };

    scheduleNextCheck();

    const interval = setInterval(() => {
      setMinutesUntilNext(Math.max(1, Math.ceil(msUntilNextCycle() / 60000)));
    }, 45000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Tentukan siklus yang aktif
  const atmosphere = useMemo(() => {
    if (!isAuto && selectedId) {
      const found = ATMOSPHERE_CYCLES.find((c) => c.id === selectedId);
      if (found) return found;
    }
    return getAtmosphereForHour(currentHour);
  }, [isAuto, selectedId, currentHour]);

  const nextAtmosphere = useMemo(() => {
    return getAtmosphereForHour(currentHour + 2);
  }, [currentHour]);

  // Pasang CSS Variables elegan pada root dokumen
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.atmosphere = atmosphere.id;
    root.style.setProperty('--chrono-primary', atmosphere.colors.primary);
    root.style.setProperty('--chrono-secondary', atmosphere.colors.secondary);
    root.style.setProperty('--chrono-ambient', atmosphere.colors.ambient);
    root.style.setProperty('--chrono-surface-tint', atmosphere.colors.surfaceTint);

    // Harmonisasi warna aksen studio agar menyatu secara alami
    root.style.setProperty(
      '--tf-accent',
      `color-mix(in srgb, ${atmosphere.colors.primary} 75%, #4f46e5)`
    );
    root.style.setProperty(
      '--tf-accent-soft',
      `color-mix(in srgb, ${atmosphere.colors.primary} 12%, transparent)`
    );
  }, [atmosphere]);

  const handleSetAuto = (auto: boolean) => {
    setIsAuto(auto);
    try {
      localStorage.setItem('fazet.chrono.isAuto', JSON.stringify(auto));
    } catch {}
  };

  const handleSetAtmosphereId = (id: string) => {
    setIsAuto(false);
    setSelectedId(id);
    try {
      localStorage.setItem('fazet.chrono.isAuto', JSON.stringify(false));
      localStorage.setItem('fazet.chrono.manualId', id);
    } catch {}
  };

  const handleSetIntensity = (val: IntensityMode) => {
    setIntensity(val);
    try {
      localStorage.setItem('fazet.chrono.intensity', val);
    } catch {}
  };

  const handleResetToCurrent = () => {
    setIsAuto(true);
    setSelectedId(null);
    try {
      localStorage.setItem('fazet.chrono.isAuto', JSON.stringify(true));
      localStorage.removeItem('fazet.chrono.manualId');
    } catch {}
  };

  const currentIdx = ATMOSPHERE_CYCLES.findIndex((c) => c.id === atmosphere.id);

  const contextValue: ChronoContextType = useMemo(
    () => ({
      atmosphere,
      isAuto,
      intensity,
      minutesUntilNext,
      setAuto: handleSetAuto,
      setAtmosphereId: handleSetAtmosphereId,
      setIntensity: handleSetIntensity,
      resetToCurrentHour: handleResetToCurrent,
      // Compatibility
      vibe: atmosphere,
      next: nextAtmosphere,
      minutesLeft: minutesUntilNext,
      shuffle: () => {
        const nextIdx = (currentIdx + 1) % ATMOSPHERE_CYCLES.length;
        handleSetAtmosphereId(ATMOSPHERE_CYCLES[nextIdx].id);
      },
      isPreview: !isAuto,
      reset: handleResetToCurrent,
    }),
    [atmosphere, isAuto, intensity, minutesUntilNext, nextAtmosphere, currentIdx]
  );

  return (
    <ChronoContext.Provider value={contextValue}>
      <ChronoBackground atmosphere={atmosphere} intensity={intensity} />
      {children}
    </ChronoContext.Provider>
  );
}

/**
 * Chrono Capsule — Indikator Atmosfer Minimalis di Header
 * Didesain layaknya komplikasi jam mewah Swiss / Dynamic Island Raycast.
 */
export function ChronoCapsule() {
  const {
    atmosphere,
    isAuto,
    intensity,
    minutesUntilNext,
    setAuto,
    setAtmosphereId,
    setIntensity,
    resetToCurrentHour,
  } = useChronoAtmosphere();

  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('mousedown', handleDown);
    return () => window.removeEventListener('mousedown', handleDown);
  }, [isOpen]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="chrono-capsule-button"
        title="Pengaturan Atmosfer & Pencahayaan Waktu"
        aria-label="Atmosfer Ruang Kerja"
      >
        <span
          className="chrono-capsule-gem"
          style={{
            backgroundColor: atmosphere.colors.primary,
            boxShadow: `0 0 10px ${atmosphere.colors.primary}`,
          }}
        />
        <span className="chrono-capsule-name">{atmosphere.name}</span>
        <span className="chrono-capsule-tag">
          {isAuto ? `${minutesUntilNext}m` : 'Kustom'}
        </span>
      </button>

      {/* Popover Pengaturan Atmosfer Elegan */}
      {isOpen && (
        <div className="chrono-popover animate-chrono-scale">
          <div className="flex items-center justify-between border-b border-[var(--tf-border)] px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-[var(--chrono-primary)]" />
              <div className="text-xs font-semibold text-[var(--tf-text-primary)]">
                Atmosfer Ruang Kerja
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-[var(--tf-text-muted)] hover:bg-[var(--tf-bg-subtle)] hover:text-[var(--tf-text-primary)]"
            >
              <X size={14} />
            </button>
          </div>

          <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Status Aktif */}
            <div className="rounded-xl border border-[var(--tf-border)] bg-[var(--tf-bg-subtle)]/70 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-medium tracking-wide uppercase text-[var(--tf-text-muted)]">
                    Atmosfer Aktif
                  </div>
                  <div className="text-sm font-semibold text-[var(--tf-text-primary)] mt-0.5">
                    {atmosphere.name}
                  </div>
                </div>
                <div
                  className="h-7 w-7 rounded-lg border border-white/10 flex items-center justify-center shadow-inner"
                  style={{
                    background: `linear-gradient(135deg, ${atmosphere.colors.primary}, ${atmosphere.colors.secondary})`,
                  }}
                />
              </div>
              <p className="text-[11px] text-[var(--tf-text-secondary)] mt-2 leading-relaxed">
                {atmosphere.subtitle}
              </p>
            </div>

            {/* Mode Siklus Otomatis */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[var(--tf-text-muted)]" />
                <span className="text-xs font-medium text-[var(--tf-text-primary)]">
                  Sinkronisasi Otomatis 24 Jam
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isAuto) {
                    setAuto(false);
                  } else {
                    resetToCurrentHour();
                  }
                }}
                className={`h-5 w-9 rounded-full transition-colors relative cursor-pointer ${
                  isAuto ? 'bg-[var(--chrono-primary)]' : 'bg-[var(--tf-border)]'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                    isAuto ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Intensitas Pencahayaan */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sliders size={13} className="text-[var(--tf-text-muted)]" />
                <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--tf-text-muted)]">
                  Intensitas Ambient
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[var(--tf-bg-subtle)] border border-[var(--tf-border)] text-xs">
                {(['soft', 'balanced', 'cinematic'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setIntensity(mode)}
                    className={`py-1.5 rounded-lg font-medium transition-all cursor-pointer capitalize text-[11px] ${
                      intensity === mode
                        ? 'bg-[var(--tf-bg-surface)] text-[var(--tf-text-primary)] shadow-sm'
                        : 'text-[var(--tf-text-muted)] hover:text-[var(--tf-text-primary)]'
                    }`}
                  >
                    {mode === 'soft' ? 'Lembut' : mode === 'balanced' ? 'Seimbang' : 'Sinematik'}
                  </button>
                ))}
              </div>
            </div>

            {/* Galeri Atmosfer Horologis */}
            <div>
              <div className="text-[11px] font-semibold tracking-wider uppercase text-[var(--tf-text-muted)] mb-2">
                Pilih Suasana Horologis (12 Siklus)
              </div>
              <div className="grid grid-cols-2 gap-2">
                {ATMOSPHERE_CYCLES.map((cycle) => {
                  const isSelected = cycle.id === atmosphere.id;
                  return (
                    <button
                      key={cycle.id}
                      type="button"
                      onClick={() => setAtmosphereId(cycle.id)}
                      className={`group relative flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[var(--chrono-primary)] bg-[var(--chrono-primary)]/10 ring-1 ring-[var(--chrono-primary)]/30'
                          : 'border-[var(--tf-border)] bg-[var(--tf-bg-subtle)]/50 hover:bg-[var(--tf-bg-subtle)] hover:border-[var(--tf-border)]/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 w-full mb-1">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${cycle.colors.primary}, ${cycle.colors.secondary})`,
                          }}
                        />
                        <span className="text-[10px] font-mono font-medium text-[var(--tf-text-muted)] ml-auto">
                          {cycle.period}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-[var(--tf-text-primary)] truncate w-full">
                        {cycle.name}
                      </div>
                      {isSelected && (
                        <span className="absolute top-2 right-2 text-[var(--chrono-primary)]">
                          <Check size={12} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Backwards compatibility alias
export const VibeBadge = ChronoCapsule;

/**
 * Transisi Halaman Sinematik Halus (Apple HIG & Linear Easing)
 * Transisi halus tanpa efek putar/bouncing yang berlebihan.
 */
export function ChronoPageTransition({
  routeKey,
  children,
}: {
  routeKey: string;
  children: ReactNode;
}) {
  return (
    <div key={routeKey} className="chrono-page-reveal">
      {children}
    </div>
  );
}

// Backwards compatibility alias
export const VibePage = ChronoPageTransition;
