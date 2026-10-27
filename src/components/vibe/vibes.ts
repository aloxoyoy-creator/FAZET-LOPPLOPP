/**
 * FAZET Chrono-Atmosphere Engine
 * Mengatur estetika visual, pencahayaan ambient, gradien latar, dan dinamika gerak
 * berdasarkan siklus 24 jam dengan estetika minimalis, modern, dan mewah (Apple & Linear design philosophy).
 */

export interface AtmosphereCycle {
  id: string;
  name: string;
  subtitle: string;
  period: string; // e.g. "00:00 - 02:00"
  colors: {
    primary: string;     // Warna aksen utama (elegan & terukur)
    secondary: string;   // Warna aksen sekunder untuk kedalaman
    ambient: string;     // Warna ambient glow
    surfaceTint: string; // Subtle tint untuk glassmorphism
  };
  lighting: {
    glowBlur: number;
    glowOpacity: number;
    noiseOpacity: number;
  };
}

export const ATMOSPHERE_CYCLES: AtmosphereCycle[] = [
  {
    id: 'nocturne-obsidian',
    name: 'Nocturne Obsidian',
    subtitle: 'Keheningan malam dalam kedalaman ruang obsidian & starlight minimalis.',
    period: '00:00 - 02:00',
    colors: {
      primary: '#6366f1',    // Deep Indigo
      secondary: '#0ea5e9',  // Electric Cyan
      ambient: '#312e81',    // Midnight Navy
      surfaceTint: 'rgba(99, 102, 241, 0.05)',
    },
    lighting: { glowBlur: 140, glowOpacity: 0.22, noiseOpacity: 0.035 },
  },
  {
    id: 'astral-solitude',
    name: 'Astral Solitude',
    subtitle: 'Fokus kontemplatif dengan pendar violet kosmik yang tenang.',
    period: '02:00 - 04:00',
    colors: {
      primary: '#8b5cf6',    // Cosmic Violet
      secondary: '#38bdf8',  // Astral Blue
      ambient: '#4c1d95',    // Deep Purple
      surfaceTint: 'rgba(139, 92, 246, 0.05)',
    },
    lighting: { glowBlur: 150, glowOpacity: 0.20, noiseOpacity: 0.035 },
  },
  {
    id: 'dawn-aura',
    name: 'Dawn Aura',
    subtitle: 'Sentuhan fajar lembut bernuansa rose-gold dan lavender mist.',
    period: '04:00 - 06:00',
    colors: {
      primary: '#f43f5e',    // Rose Quartz
      secondary: '#a855f7',  // Soft Amethyst
      ambient: '#fb7185',    // Morning Blush
      surfaceTint: 'rgba(244, 63, 94, 0.04)',
    },
    lighting: { glowBlur: 130, glowOpacity: 0.24, noiseOpacity: 0.03 },
  },
  {
    id: 'morning-luminary',
    name: 'Morning Luminary',
    subtitle: 'Kejernihan pagi hari dengan aura arctic cyan yang segar dan energetik.',
    period: '06:00 - 08:00',
    colors: {
      primary: '#06b6d4',    // Arctic Cyan
      secondary: '#3b82f6',  // Azure Blue
      ambient: '#0891b2',    // Deep Cerulean
      surfaceTint: 'rgba(6, 182, 212, 0.05)',
    },
    lighting: { glowBlur: 130, glowOpacity: 0.26, noiseOpacity: 0.025 },
  },
  {
    id: 'nordic-focus',
    name: 'Nordic Focus',
    subtitle: 'Ketegasan presisi Scandinavian dengan sentuhan titanium dan icy slate.',
    period: '08:00 - 10:00',
    colors: {
      primary: '#3b82f6',    // Precision Blue
      secondary: '#10b981',  // Mint Sage
      ambient: '#1e40af',    // Deep Royal
      surfaceTint: 'rgba(59, 130, 246, 0.04)',
    },
    lighting: { glowBlur: 120, glowOpacity: 0.22, noiseOpacity: 0.025 },
  },
  {
    id: 'solarium-gold',
    name: 'Solarium Gold',
    subtitle: 'Kilau champagne hangat dan keemasan mewah di puncak produktivitas.',
    period: '10:00 - 12:00',
    colors: {
      primary: '#eab308',    // Champagne Gold
      secondary: '#f97316',  // Warm Amber
      ambient: '#ca8a04',    // Burnished Ochre
      surfaceTint: 'rgba(234, 179, 8, 0.04)',
    },
    lighting: { glowBlur: 140, glowOpacity: 0.25, noiseOpacity: 0.025 },
  },
  {
    id: 'zenith-pearl',
    name: 'Zenith Pearl',
    subtitle: 'Monolitik netral modern bernuansa platinum dan pearl luminance.',
    period: '12:00 - 14:00',
    colors: {
      primary: '#64748b',    // Slate Platinum
      secondary: '#0ea5e9',  // High Sky Blue
      ambient: '#334155',    // Graphite Tint
      surfaceTint: 'rgba(100, 116, 139, 0.05)',
    },
    lighting: { glowBlur: 120, glowOpacity: 0.20, noiseOpacity: 0.025 },
  },
  {
    id: 'botanical-sage',
    name: 'Botanical Sage',
    subtitle: 'Ketenangan mineral bumi berpadu emerald velvet dan deep forest.',
    period: '14:00 - 16:00',
    colors: {
      primary: '#10b981',    // Emerald Green
      secondary: '#06b6d4',  // Jade Teal
      ambient: '#065f46',    // Pine Depth
      surfaceTint: 'rgba(16, 185, 129, 0.05)',
    },
    lighting: { glowBlur: 135, glowOpacity: 0.22, noiseOpacity: 0.03 },
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour Dusk',
    subtitle: 'Kehangatan tembaga senja bernuansa velvet amber dan terakota lembut.',
    period: '16:00 - 18:00',
    colors: {
      primary: '#f97316',    // Amber Copper
      secondary: '#ec4899',  // Dusk Rose
      ambient: '#c2410c',    // Deep Terracotta
      surfaceTint: 'rgba(249, 115, 22, 0.05)',
    },
    lighting: { glowBlur: 150, glowOpacity: 0.28, noiseOpacity: 0.03 },
  },
  {
    id: 'dusk-horizon',
    name: 'Dusk Horizon',
    subtitle: 'Gradasi senja violet anggun menyambut ketenangan malam.',
    period: '18:00 - 20:00',
    colors: {
      primary: '#d946ef',    // Royal Fuchsia
      secondary: '#6366f1',  // Dusk Indigo
      ambient: '#86198f',    // Velvet Plum
      surfaceTint: 'rgba(217, 70, 239, 0.05)',
    },
    lighting: { glowBlur: 150, glowOpacity: 0.25, noiseOpacity: 0.035 },
  },
  {
    id: 'cyber-cobalt',
    name: 'Cyber Cobalt',
    subtitle: 'Nuansa sapphire neon futuristik nan ramping untuk sesi malam fokus.',
    period: '20:00 - 22:00',
    colors: {
      primary: '#2563eb',    // Cobalt Sapphire
      secondary: '#8b5cf6',  // Neon Iris
      ambient: '#1e3a8a',    // Ultra Deep Blue
      surfaceTint: 'rgba(37, 99, 235, 0.05)',
    },
    lighting: { glowBlur: 140, glowOpacity: 0.26, noiseOpacity: 0.035 },
  },
  {
    id: 'midnight-velvet',
    name: 'Midnight Velvet',
    subtitle: 'Keanggunan beludru malam dengan aksen ruby ember dan onyx gelap.',
    period: '22:00 - 24:00',
    colors: {
      primary: '#ec4899',    // Ruby Velvet
      secondary: '#6366f1',  // Midnight Indigo
      ambient: '#831843',    // Dark Wine
      surfaceTint: 'rgba(236, 72, 153, 0.04)',
    },
    lighting: { glowBlur: 160, glowOpacity: 0.22, noiseOpacity: 0.04 },
  },
];

/**
 * Mencari atmosfer berdasarkan jam saat ini (0 - 23).
 * Setiap interval 2 jam berganti secara natural dan mulus.
 */
export const getAtmosphereForHour = (hour: number): AtmosphereCycle => {
  const normalizedHour = ((hour % 24) + 24) % 24;
  const index = Math.floor(normalizedHour / 2);
  return ATMOSPHERE_CYCLES[index] || ATMOSPHERE_CYCLES[0];
};

/**
 * Menghitung milidetik tersisa sampai pergantian jam genap berikutnya.
 */
export const msUntilNextCycle = (now = new Date()): number => {
  const currentHour = now.getHours();
  const nextEvenHour = currentHour % 2 === 0 ? currentHour + 2 : currentHour + 1;
  const target = new Date(now);
  target.setHours(nextEvenHour, 0, 0, 0);
  return Math.max(1000, target.getTime() - now.getTime());
};

// Backwards compatibility alias
export type Vibe = AtmosphereCycle;
export const VIBES = ATMOSPHERE_CYCLES;
export const vibeForHour = (hour: number) => getAtmosphereForHour(hour);
export const msUntilNextHour = msUntilNextCycle;
