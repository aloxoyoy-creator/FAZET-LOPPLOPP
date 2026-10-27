import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { VIBES, msUntilNextHour, vibeForHour, type Vibe } from './vibes';
import '../../styles/hourly-vibe.css';

interface VibeCtx { vibe: Vibe; next: Vibe; minutesLeft: number; shuffle: () => void; isPreview: boolean; reset: () => void; }
const Ctx = createContext<VibeCtx | null>(null);
export const useVibe = () => useContext(Ctx);

const rand = (seed: number) => { const x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x); };

/** Latar animasi sesuai scene vibe aktif. */
function VibeScene({ vibe }: { vibe: Vibe }) {
  const count = vibe.scene === 'rain' ? 46 : vibe.scene === 'stars' ? 60 : vibe.scene === 'aurora' || vibe.scene === 'sunrays' || vibe.scene === 'synth' ? 0 : 22;
  const items = useMemo(
    () => Array.from({ length: count }, (_, i) => {
      const r1 = rand(i + 1), r2 = rand(i + 101), r3 = rand(i + 211);
      return {
        key: i,
        style: {
          '--x': `${(r1 * 100).toFixed(2)}%`,
          '--y': `${(r2 * 100).toFixed(2)}%`,
          '--s': (0.5 + r3 * 1.2).toFixed(2),
          '--d': `${(r2 * -20).toFixed(2)}s`,
          '--t': `${(6 + r1 * 14).toFixed(2)}s`,
          '--c': vibe.colors[i % 3],
        } as CSSProperties,
        glyph: vibe.particles.length ? vibe.particles[i % vibe.particles.length] : '',
      };
    }),
    [vibe, count],
  );

  return (
    <div className={`vibe-scene vibe-scene--${vibe.scene}`} aria-hidden="true">
      <div className="vibe-scene__wash" />
      {vibe.scene === 'aurora' && (<><i className="vibe-aurora a1" /><i className="vibe-aurora a2" /><i className="vibe-aurora a3" /></>)}
      {vibe.scene === 'sunrays' && <i className="vibe-sunrays" />}
      {vibe.scene === 'synth' && (<><i className="vibe-synth-sun" /><i className="vibe-synth-grid" /></>)}
      {vibe.scene === 'waves' && (<><i className="vibe-wave w1" /><i className="vibe-wave w2" /><i className="vibe-wave w3" /></>)}
      {items.map((it) => (
        <span key={it.key} className="vibe-p" style={it.style}>{it.glyph}</span>
      ))}
    </div>
  );
}

/** Splash singkat saat vibe berganti. */
function VibeSplash({ vibe }: { vibe: Vibe }) {
  const [show, setShow] = useState(true);
  useEffect(() => { setShow(true); const t = setTimeout(() => setShow(false), 2600); return () => clearTimeout(t); }, [vibe.id]);
  if (!show) return null;
  return (
    <div className="vibe-splash" key={vibe.id}>
      <span className="vibe-splash__emoji">{vibe.emoji}</span>
      <div>
        <div className="vibe-splash__label">Vibe jam ini</div>
        <div className="vibe-splash__name">{vibe.name}</div>
        <div className="vibe-splash__tag">{vibe.tagline}</div>
      </div>
    </div>
  );
}

export function HourlyVibeProvider({ children }: { children: ReactNode }) {
  const [hour, setHour] = useState(() => new Date().getHours());
  const [preview, setPreview] = useState<number | null>(null);
  const [minutesLeft, setMinutesLeft] = useState(() => Math.ceil(msUntilNextHour() / 60000));

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const schedule = () => {
      t = setTimeout(() => { setHour(new Date().getHours()); setPreview(null); schedule(); }, msUntilNextHour() + 50);
    };
    schedule();
    const iv = setInterval(() => setMinutesLeft(Math.ceil(msUntilNextHour() / 60000)), 30_000);
    return () => { clearTimeout(t); clearInterval(iv); };
  }, []);

  const vibe = preview !== null ? VIBES[preview] : vibeForHour(hour);
  const idx = VIBES.indexOf(vibe);
  const next = vibeForHour(hour + 1);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.vibe = vibe.id;
    root.dataset.vibeEnter = vibe.enter;
    root.style.setProperty('--vibe-a', vibe.colors[0]);
    root.style.setProperty('--vibe-b', vibe.colors[1]);
    root.style.setProperty('--vibe-c', vibe.colors[2]);
  }, [vibe]);

  const value = useMemo<VibeCtx>(() => ({
    vibe, next, minutesLeft, isPreview: preview !== null,
    shuffle: () => setPreview((idx + 1) % VIBES.length),
    reset: () => setPreview(null),
  }), [vibe, next, minutesLeft, preview, idx]);

  return (
    <Ctx.Provider value={value}>
      <VibeScene vibe={vibe} />
      <VibeSplash vibe={vibe} />
      {children}
    </Ctx.Provider>
  );
}

/** Pill di header: tampilkan vibe aktif + hitung mundur, klik = coba vibe lain. */
export function VibeBadge() {
  const ctx = useVibe();
  if (!ctx) return null;
  const { vibe, next, minutesLeft, shuffle, isPreview, reset } = ctx;
  return (
    <button
      type="button"
      onClick={shuffle}
      onContextMenu={(e) => { e.preventDefault(); reset(); }}
      className="vibe-badge"
      title={`${vibe.tagline}\nBerikutnya: ${next.emoji} ${next.name} dalam ${minutesLeft} menit\nKlik: coba vibe lain • Klik kanan: kembali ke vibe jam ini`}
    >
      <span className="vibe-badge__emoji">{vibe.emoji}</span>
      <span className="vibe-badge__name">{vibe.name}</span>
      <span className="vibe-badge__time">{isPreview ? 'preview' : `${minutesLeft}m`}</span>
    </button>
  );
}

/** Bungkus konten halaman agar animasi masuk berganti sesuai vibe. */
export function VibePage({ routeKey, children }: { routeKey: string; children: ReactNode }) {
  const ctx = useVibe();
  return (
    <div key={`${routeKey}-${ctx?.vibe.id}`} className={`vibe-page vibe-enter--${ctx?.vibe.enter ?? 'rise'}`}>
      {children}
    </div>
  );
}
