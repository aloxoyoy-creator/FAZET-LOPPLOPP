/**
 * FAZET LOPP LOPP — Studio preferences.
 *
 * The six dashboard themes and four dashboard layouts are sourced from the
 * FAZET LOPP LOPP V2 design reference. Login is deliberately NOT controlled
 * by these dashboard settings.
 */

export type Accent =
  | 'redpen' | 'ledger' | 'ochre' | 'forest'
  | 'fathur' | 'mazet' | 'lopp' | 'sakura' | 'ocean' | 'sunset' | 'midnight' | 'matcha' | 'lavender' | 'mono';
export type Radius = 'sharp' | 'soft' | 'round';
export type FontScale = 'small' | 'normal' | 'large';
export type Ambience = 'none' | 'aurora' | 'grain' | 'stars';

export type DashboardTheme =
  | 'paper-ink'
  | 'midnight-study'
  | 'sakura-diary'
  | 'lopp-duo'
  | 'matcha-focus'
  | 'mono-minimal';

export type DashboardLayout = 'focus' | 'bento' | 'timeline' | 'duo';
export type SidebarMode = 'full' | 'collapsed' | 'hidden';
export type Handedness = 'right' | 'left';
export type MobileNavMode = 'drawer' | 'bottom';

export interface AccentDef { id: Accent; label: string; hint: string; swatch: string; swatch2?: string }
export const ACCENTS: AccentDef[] = [
  { id: 'redpen', label: 'Red Pen', hint: 'Klasik editorial', swatch: '#C1392B' },
  { id: 'ledger', label: 'Ledger Blue', hint: 'Tenang & rapi', swatch: '#33556F' },
  { id: 'ochre', label: 'Ochre', hint: 'Hangat stabilo', swatch: '#B8790F' },
  { id: 'forest', label: 'Forest Ink', hint: 'Hijau tinta', swatch: '#2F5D4F' },
  { id: 'fathur', label: 'Fathur', hint: 'Biru indigo', swatch: '#3B5BDB' },
  { id: 'mazet', label: 'Mazet', hint: 'Rose lembut', swatch: '#D6336C' },
  { id: 'lopp', label: 'Lopp Lopp', hint: 'Perpaduan berdua', swatch: '#7048E8', swatch2: '#E64980' },
  { id: 'sakura', label: 'Sakura', hint: 'Pink pastel', swatch: '#E8799A' },
  { id: 'ocean', label: 'Ocean', hint: 'Biru laut', swatch: '#0C8599' },
  { id: 'sunset', label: 'Sunset', hint: 'Jingga senja', swatch: '#E8590C' },
  { id: 'midnight', label: 'Midnight', hint: 'Ungu malam', swatch: '#5F3DC4' },
  { id: 'matcha', label: 'Matcha', hint: 'Hijau segar', swatch: '#5C940D' },
  { id: 'lavender', label: 'Lavender', hint: 'Ungu muda', swatch: '#9775FA' },
  { id: 'mono', label: 'Mono', hint: 'Hitam-putih minimal', swatch: '#343A40' },
];

export const RADII: Array<{ id: Radius; label: string; hint: string }> = [
  { id: 'sharp', label: 'Tajam', hint: 'Sudut kotak' },
  { id: 'soft', label: 'Lembut', hint: 'Seimbang' },
  { id: 'round', label: 'Bulat', hint: 'Sangat membulat' },
];

export const FONT_SCALES: Array<{ id: FontScale; label: string; hint: string }> = [
  { id: 'small', label: 'Kecil', hint: '94%' },
  { id: 'normal', label: 'Normal', hint: '100%' },
  { id: 'large', label: 'Besar', hint: '108%' },
];

export const AMBIENCES: Array<{ id: Ambience; label: string; hint: string }> = [
  { id: 'none', label: 'Polos', hint: 'Tanpa efek' },
  { id: 'aurora', label: 'Aurora', hint: 'Cahaya lembut' },
  { id: 'grain', label: 'Grain', hint: 'Tekstur kertas' },
  { id: 'stars', label: 'Bintang', hint: 'Langit malam' },
];

export const VALID_DASHBOARD_THEMES: DashboardTheme[] = [
  'paper-ink', 'midnight-study', 'sakura-diary', 'lopp-duo', 'matcha-focus', 'mono-minimal',
];
export const VALID_DASHBOARD_LAYOUTS: DashboardLayout[] = ['focus', 'bento', 'timeline', 'duo'];

export const DEFAULT_CARD_ORDER = [
  'clock', 'agenda', 'tasks', 'streak', 'schedule', 'chat', 'minee', 'ai', 'stats', 'shortcuts',
];

export interface ThemePrefs {
  accent: Accent;
  radius: Radius;
  fontScale: FontScale;
  ambience: Ambience;
  mode: 'system' | 'light' | 'dark';
  dashboardTheme: DashboardTheme;
  dashboardLayout: DashboardLayout;
  sidebarMode: SidebarMode;
  handedness: Handedness;
  mobileNavMode: MobileNavMode;
  hiddenCards: string[];
  cardOrder: string[];
}

export const DEFAULT_PREFS: ThemePrefs = {
  accent: 'redpen',
  radius: 'soft',
  fontScale: 'normal',
  ambience: 'none',
  mode: 'system',
  dashboardTheme: 'paper-ink',
  dashboardLayout: 'focus',
  sidebarMode: 'full',
  handedness: 'right',
  mobileNavMode: 'drawer',
  hiddenCards: [],
  cardOrder: [...DEFAULT_CARD_ORDER],
};

const LEGACY_KEY = 'fazet:theme-prefs:v2';
const STUDIO_KEY = 'fazet_theme_prefs';

export const isAccent = (v: unknown): v is Accent => ACCENTS.some((a) => a.id === v);
export const isRadius = (v: unknown): v is Radius => v === 'sharp' || v === 'soft' || v === 'round';
export const isFontScale = (v: unknown): v is FontScale => v === 'small' || v === 'normal' || v === 'large';
export const isAmbience = (v: unknown): v is Ambience => v === 'none' || v === 'aurora' || v === 'grain' || v === 'stars';
export const isDashboardTheme = (v: unknown): v is DashboardTheme => VALID_DASHBOARD_THEMES.includes(v as DashboardTheme);
export const isDashboardLayout = (v: unknown): v is DashboardLayout => VALID_DASHBOARD_LAYOUTS.includes(v as DashboardLayout);
export const isSidebarMode = (v: unknown): v is SidebarMode => v === 'full' || v === 'collapsed' || v === 'hidden';
export const isHandedness = (v: unknown): v is Handedness => v === 'left' || v === 'right';
export const isMobileNavMode = (v: unknown): v is MobileNavMode => v === 'drawer' || v === 'bottom';

function readStored(): Partial<ThemePrefs> {
  if (typeof window === 'undefined') return {};
  for (const key of [STUDIO_KEY, LEGACY_KEY]) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw) as Partial<ThemePrefs>;
    } catch {
      // Try the other format.
    }
  }
  return {};
}

export function loadThemePrefs(): ThemePrefs {
  const raw = readStored();
  const legacyAccent = isAccent(raw.accent) ? raw.accent : DEFAULT_PREFS.accent;
  const darkMode = raw.mode === 'dark' || (raw.mode === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // The design reference is dashboard-first. Legacy accent settings are still
  // accepted so old saved preferences do not disappear.
  return {
    accent: legacyAccent,
    radius: isRadius(raw.radius) ? raw.radius : DEFAULT_PREFS.radius,
    fontScale: isFontScale(raw.fontScale) ? raw.fontScale : DEFAULT_PREFS.fontScale,
    ambience: isAmbience(raw.ambience) ? raw.ambience : DEFAULT_PREFS.ambience,
    mode: raw.mode === 'light' || raw.mode === 'dark' || raw.mode === 'system' ? raw.mode : DEFAULT_PREFS.mode,
    dashboardTheme: isDashboardTheme(raw.dashboardTheme) ? raw.dashboardTheme : DEFAULT_PREFS.dashboardTheme,
    dashboardLayout: isDashboardLayout(raw.dashboardLayout) ? raw.dashboardLayout : DEFAULT_PREFS.dashboardLayout,
    sidebarMode: isSidebarMode(raw.sidebarMode) ? raw.sidebarMode : DEFAULT_PREFS.sidebarMode,
    handedness: isHandedness(raw.handedness) ? raw.handedness : DEFAULT_PREFS.handedness,
    mobileNavMode: isMobileNavMode(raw.mobileNavMode) ? raw.mobileNavMode : DEFAULT_PREFS.mobileNavMode,
    hiddenCards: Array.isArray(raw.hiddenCards) ? raw.hiddenCards.filter((x): x is string => typeof x === 'string') : [],
    cardOrder: Array.isArray(raw.cardOrder) && raw.cardOrder.length ? raw.cardOrder.filter((x): x is string => typeof x === 'string') : [...DEFAULT_CARD_ORDER],
  };
}

export function saveThemePrefs(patch: Partial<ThemePrefs>): ThemePrefs {
  const next = { ...loadThemePrefs(), ...patch };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STUDIO_KEY, JSON.stringify(next));
      localStorage.setItem(LEGACY_KEY, JSON.stringify({
        accent: next.accent,
        radius: next.radius,
        fontScale: next.fontScale,
        ambience: next.ambience,
        mode: next.mode,
      }));
    } catch {
      // Ignore unavailable storage.
    }
    applyThemePrefs(next);
  }
  return next;
}

export function resolveDark(mode: ThemePrefs['mode']): boolean {
  if (typeof window === 'undefined') return mode === 'dark';
  return mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

/**
 * Apply only the dashboard/workspace theme attributes. Login intentionally
 * remains outside `.app-shell` and its own existing auth styles stay intact.
 */
export function applyThemePrefs(p: ThemePrefs = loadThemePrefs()) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.tfAccent = p.accent;
  root.dataset.tfRadius = p.radius;
  root.dataset.tfFont = p.fontScale;
  root.dataset.tfAmbience = p.ambience;
  root.dataset.tfDashboardTheme = p.dashboardTheme;
  root.dataset.tfDashboardLayout = p.dashboardLayout;
  root.dataset.tfSidebar = p.sidebarMode;
  root.dataset.tfHandedness = p.handedness;
  root.dataset.tfMobileNav = p.mobileNavMode;
  root.classList.toggle('dark', resolveDark(p.mode));
  window.dispatchEvent(new Event('taskflow:theme-changed'));
}

export function syncStudioToShell(shell: HTMLElement, prefs: ThemePrefs = loadThemePrefs()) {
  shell.dataset.tfTheme = prefs.dashboardTheme;
  shell.dataset.tfLayout = prefs.dashboardLayout;
  shell.dataset.tfSidebar = prefs.sidebarMode;
  shell.dataset.tfHandedness = prefs.handedness;
  shell.dataset.tfMobileNav = prefs.mobileNavMode;
  shell.dataset.tfFont = prefs.fontScale;
}

export function dashboardThemeLabel(theme: DashboardTheme): string {
  return {
    'paper-ink': 'Paper Ink',
    'midnight-study': 'Midnight Study',
    'sakura-diary': 'Sakura Diary',
    'lopp-duo': 'Lopp Duo',
    'matcha-focus': 'Matcha Focus',
    'mono-minimal': 'Mono Minimal',
  }[theme];
}
