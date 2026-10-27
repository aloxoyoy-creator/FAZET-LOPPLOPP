/**
 * Hourly Vibe engine — setiap jam punya suasana, warna, scene latar,
 * dan gaya animasi masuk halaman yang berbeda. 12 vibe diputar berdasarkan
 * jam (hour % 12) sehingga jam yang berurutan tidak pernah sama.
 */
export type VibeScene =
  | 'aurora' | 'bubbles' | 'stars' | 'waves' | 'confetti' | 'synth'
  | 'petals' | 'fireflies' | 'rain' | 'orbs' | 'sunrays' | 'emoji';

export type VibeEnter =
  | 'rise' | 'pop' | 'slide' | 'flip' | 'blur' | 'bounce'
  | 'swing' | 'skew' | 'drop' | 'spiral' | 'stretch' | 'glide';

export interface Vibe {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  colors: [string, string, string];
  scene: VibeScene;
  enter: VibeEnter;
  particles: string[]; // dipakai scene "emoji"/"confetti"/"petals"
}

export const VIBES: Vibe[] = [
  { id: 'midnight-aurora', name: 'Midnight Aurora', emoji: '🌌', tagline: 'Tenang, dalam, magis.', colors: ['#7c3aed', '#06b6d4', '#22d3ee'], scene: 'aurora', enter: 'blur', particles: [] },
  { id: 'bubble-pop', name: 'Bubble Pop', emoji: '🫧', tagline: 'Ringan & playful.', colors: ['#ec4899', '#8b5cf6', '#38bdf8'], scene: 'bubbles', enter: 'pop', particles: [] },
  { id: 'starlight', name: 'Starlight', emoji: '✨', tagline: 'Bersinar pelan-pelan.', colors: ['#f59e0b', '#6366f1', '#a5b4fc'], scene: 'stars', enter: 'rise', particles: [] },
  { id: 'ocean-chill', name: 'Ocean Chill', emoji: '🌊', tagline: 'Ngalir aja kayak ombak.', colors: ['#0ea5e9', '#14b8a6', '#67e8f9'], scene: 'waves', enter: 'glide', particles: [] },
  { id: 'party-mode', name: 'Party Mode', emoji: '🎉', tagline: 'Gas, semangat penuh!', colors: ['#f43f5e', '#facc15', '#22c55e'], scene: 'confetti', enter: 'bounce', particles: ['■', '●', '▲', '◆'] },
  { id: 'synthwave', name: 'Synthwave', emoji: '🕹️', tagline: 'Retro neon vibes.', colors: ['#ff2bd6', '#7c3aed', '#00e5ff'], scene: 'synth', enter: 'skew', particles: [] },
  { id: 'sakura', name: 'Sakura Breeze', emoji: '🌸', tagline: 'Lembut & manis.', colors: ['#f472b6', '#fb7185', '#fda4af'], scene: 'petals', enter: 'swing', particles: ['🌸', '🌸', '💮'] },
  { id: 'firefly', name: 'Firefly Night', emoji: '🪲', tagline: 'Kelip-kelip hangat.', colors: ['#a3e635', '#facc15', '#4ade80'], scene: 'fireflies', enter: 'drop', particles: [] },
  { id: 'rainy-lofi', name: 'Rainy Lo-Fi', emoji: '🌧️', tagline: 'Fokus ditemani hujan.', colors: ['#64748b', '#60a5fa', '#93c5fd'], scene: 'rain', enter: 'slide', particles: [] },
  { id: 'lava-lamp', name: 'Lava Lamp', emoji: '🫠', tagline: 'Santai, meleleh, groovy.', colors: ['#f97316', '#ef4444', '#c026d3'], scene: 'orbs', enter: 'stretch', particles: [] },
  { id: 'golden-hour', name: 'Golden Hour', emoji: '🌅', tagline: 'Hangat kayak senja.', colors: ['#fb923c', '#fbbf24', '#f472b6'], scene: 'sunrays', enter: 'spiral', particles: [] },
  { id: 'cozy-emoji', name: 'Cozy Mood', emoji: '🧸', tagline: 'Gemes & nyaman.', colors: ['#a78bfa', '#f9a8d4', '#fcd34d'], scene: 'emoji', enter: 'flip', particles: ['💜', '⭐', '🍓', '☁️', '🧸', '🎈'] },
];

export const vibeForHour = (hour: number): Vibe => VIBES[((hour % 12) + 12) % 12];

export const msUntilNextHour = (now = new Date()) =>
  (60 - now.getMinutes()) * 60_000 - now.getSeconds() * 1000 - now.getMilliseconds();
