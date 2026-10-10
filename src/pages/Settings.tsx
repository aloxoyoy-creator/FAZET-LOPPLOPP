import { useEffect, useMemo, useState } from 'react';
import { Check, LayoutGrid, Monitor, Palette, PanelLeft, RotateCcw, Save, Sparkles, Smartphone, SlidersHorizontal, Type, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSettings, saveSettings } from '../services/settingsService';
import { useToast } from '../components/ui/Toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { ACCENTS, AMBIENCES, FONT_SCALES, RADII, applyThemePrefs, isAccent, isAmbience, isDashboardLayout, isDashboardTheme, isFontScale, isHandedness, isMobileNavMode, isRadius, isSidebarMode, loadThemePrefs, saveThemePrefs, type Ambience, type DashboardLayout, type DashboardTheme, type FontScale, type Handedness, type MobileNavMode, type Radius, type SidebarMode } from '../lib/themePrefs';
import { useAppConfig } from '../context/AppConfigContext';

type ThemeMode = 'system' | 'light' | 'dark';
type Density = 'compact' | 'comfortable' | 'spacious';

const THEMES: Array<{ id: DashboardTheme; name: string; description: string; swatch: string[]; mood: string }> = [
  { id: 'paper-ink', name: 'Paper Ink', description: 'Krem kertas, tinta hijau, aksen merah pena.', swatch: ['#f9f6f0', '#123329', '#bf3626'], mood: 'Editorial' },
  { id: 'midnight-study', name: 'Midnight Study', description: 'Biru-ungu malam dengan glow fokus yang halus.', swatch: ['#0b0f19', '#6366f1', '#a855f7'], mood: 'Night' },
  { id: 'sakura-diary', name: 'Sakura Diary', description: 'Pink pastel lembut dengan rasa diary pribadi.', swatch: ['#fdf5f7', '#e11d48', '#f43f5e'], mood: 'Diary' },
  { id: 'lopp-duo', name: 'Lopp Duo', description: 'Indigo Fathur bertemu rose Mazet dalam satu ruang.', swatch: ['#4f46e5', '#db2777', '#e11d48'], mood: 'Together' },
  { id: 'matcha-focus', name: 'Matcha Focus', description: 'Hijau matcha tenang untuk sesi belajar panjang.', swatch: ['#f4f7f4', '#2d6a4f', '#936639'], mood: 'Calm' },
  { id: 'mono-minimal', name: 'Mono Minimal', description: 'Hitam-putih tegas untuk kepadatan data tinggi.', swatch: ['#ffffff', '#000000', '#666666'], mood: 'Minimal' },
];

const LAYOUTS: Array<{ id: DashboardLayout; name: string; description: string; icon: typeof LayoutGrid }> = [
  { id: 'focus', name: 'Romantis', description: 'Perjalanan Fathur ↔ Mazet, countdown hubungan, ulang tahun, dan My Minee.', icon: Type },
  { id: 'bento', name: 'Bento', description: 'Kartu asimetris untuk melihat banyak hal sekaligus.', icon: LayoutGrid },
  { id: 'timeline', name: 'Timeline', description: 'Agenda menjadi sumbu waktu vertikal.', icon: SlidersHorizontal },
  { id: 'duo', name: 'Duo', description: 'Fathur, ruang bersama, dan Mazet dalam satu layar.', icon: Smartphone },
];

export default function Settings() {
  const { user } = useAuth();
  const { push } = useToast();
  const appConfig = useAppConfig();
  const stored = loadThemePrefs();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [themeMode, setThemeMode] = useState<ThemeMode>(stored.mode);
  const [dashboardTheme, setDashboardTheme] = useState<DashboardTheme>(stored.dashboardTheme);
  const [dashboardLayout, setDashboardLayout] = useState<DashboardLayout>(stored.dashboardLayout);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>(stored.sidebarMode);
  const [handedness, setHandedness] = useState<Handedness>(stored.handedness);
  const [mobileNavMode, setMobileNavMode] = useState<MobileNavMode>(stored.mobileNavMode);
  const [accentColor, setAccentColor] = useState(stored.accent);
  const [radius, setRadius] = useState<Radius>(stored.radius);
  const [fontScale, setFontScale] = useState<FontScale>(stored.fontScale);
  const [ambience, setAmbience] = useState<Ambience>(stored.ambience);
  const [density, setDensity] = useState<Density>('comfortable');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [deadlineReminder, setDeadlineReminder] = useState(true);
  const [animations, setAnimations] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [showLiveBar, setShowLiveBar] = useState(true);
  const [showWatermark, setShowWatermark] = useState(true);
  const [weekStartsMonday, setWeekStartsMonday] = useState(true);

  const resolvedDark = useMemo(() => themeMode === 'dark' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches), [themeMode]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let active = true;
    const load = async () => {
      try {
        const data = await getSettings(user.id);
        if (!active || !data) return;
        setThemeMode(data.theme_mode === 'dark' || data.theme_mode === 'light' || data.theme_mode === 'system' ? data.theme_mode : 'system');
        if (isDashboardTheme(data.dashboard_theme)) setDashboardTheme(data.dashboard_theme);
        if (isDashboardLayout(data.dashboard_layout)) setDashboardLayout(data.dashboard_layout);
        if (isSidebarMode(data.sidebar_mode)) setSidebarMode(data.sidebar_mode);
        if (isHandedness(data.handedness)) setHandedness(data.handedness);
        if (isMobileNavMode(data.mobile_nav_mode)) setMobileNavMode(data.mobile_nav_mode);
        if (isAccent(data.accent_color)) setAccentColor(data.accent_color);
        if (isRadius(data.theme_radius)) setRadius(data.theme_radius);
        if (isFontScale(data.font_scale)) setFontScale(data.font_scale);
        if (isAmbience(data.ambience)) setAmbience(data.ambience);
        setDensity(data.density === 'compact' || data.density === 'spacious' ? data.density : 'comfortable');
        setEmailNotifications(Boolean(data.email_notifications ?? true));
        setDeadlineReminder(Boolean(data.deadline_reminder ?? true));
        setAnimations(Boolean(data.animations ?? true));
        setReducedMotion(Boolean(data.reduced_motion ?? false));
        setShowLiveBar(Boolean(data.show_live_bar ?? true));
        setShowWatermark(Boolean(data.show_watermark ?? true));
        setWeekStartsMonday(Boolean(data.week_starts_monday ?? true));
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Gagal memuat pengaturan.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    const prefs = saveThemePrefs({ dashboardTheme, dashboardLayout, sidebarMode, handedness, mobileNavMode, accent: accentColor, radius, fontScale, ambience, mode: themeMode });
    applyThemePrefs(prefs);
    document.documentElement.classList.toggle('dark', resolvedDark);
    document.documentElement.classList.toggle('reduce-motion', reducedMotion || !animations);
    document.documentElement.dataset.tfDensity = density;
    document.body.classList.toggle('compact-mode', density === 'compact');
    window.dispatchEvent(new Event('taskflow:theme-changed'));
  }, [dashboardTheme, dashboardLayout, sidebarMode, handedness, mobileNavMode, accentColor, radius, fontScale, ambience, themeMode, resolvedDark, reducedMotion, animations, density]);

  async function save() {
    if (!user) { setError('Sesi pengguna tidak ditemukan.'); return; }
    setSaving(true); setError('');
    try {
      const next = saveThemePrefs({ dashboardTheme, dashboardLayout, sidebarMode, handedness, mobileNavMode, accent: accentColor, radius, fontScale, ambience, mode: themeMode });
      await saveSettings(user.id, {
        email_notifications: emailNotifications,
        deadline_reminder: deadlineReminder,
        dark_mode: resolvedDark,
        compact_mode: density === 'compact',
        reduced_motion: reducedMotion,
        theme_mode: themeMode,
        accent_color: accentColor,
        density,
        theme_radius: radius,
        font_scale: fontScale,
        ambience,
        animations,
        show_live_bar: showLiveBar,
        show_watermark: showWatermark,
        week_starts_monday: weekStartsMonday,
        dashboard_theme: next.dashboardTheme,
        dashboard_layout: next.dashboardLayout,
        sidebar_mode: next.sidebarMode,
        handedness: next.handedness,
        mobile_nav_mode: next.mobileNavMode,
        card_order: next.cardOrder,
        hidden_cards: next.hiddenCards,
      });
      window.dispatchEvent(new Event('taskflow:settings-changed'));
      push({ tone: 'success', title: 'Studio tersimpan', message: 'Tema dan preferensi workspace berhasil disimpan.' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan pengaturan.';
      setError(message);
      push({ tone: 'error', title: 'Penyimpanan gagal', message });
    } finally { setSaving(false); }
  }

  async function reset() {
    const d = loadThemePrefs();
    setThemeMode('system'); setDashboardTheme('paper-ink'); setDashboardLayout('focus'); setSidebarMode('full'); setHandedness('right'); setMobileNavMode('drawer'); setAccentColor('redpen'); setRadius('soft'); setFontScale('normal'); setAmbience('none'); setDensity('comfortable'); setReducedMotion(false); setAnimations(true); setShowLiveBar(true); setShowWatermark(true); setWeekStartsMonday(true);
    saveThemePrefs({ ...d, mode: 'system', dashboardTheme: 'paper-ink', dashboardLayout: 'focus', sidebarMode: 'full', handedness: 'right', mobileNavMode: 'drawer', accent: 'redpen', radius: 'soft', fontScale: 'normal', ambience: 'none' });
    push({ tone: 'success', title: 'Studio direset', message: 'Default visual FAZET dipulihkan.' });
  }

  if (loading) return <div className="studio-page"><Card className="p-8"><div className="animate-pulse space-y-4"><div className="h-7 w-48 rounded bg-[var(--tf-bg-subtle)]" /><div className="h-24 rounded-[var(--tf-radius-card)] bg-[var(--tf-bg-subtle)]" /><div className="h-48 rounded-[var(--tf-radius-card)] bg-[var(--tf-bg-subtle)]" /></div></Card></div>;

  return (
    <div className="studio-page space-y-5 fade-up">
      <section className="flex flex-col gap-3 border-b border-[var(--tf-border)] pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div><div className="studio-eyebrow"><Sparkles size={13} /> FAZET Studio</div><h1 className="studio-page-title mt-1">Tema & tampilan workspace</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--tf-text-muted)]">Seluruh area setelah login mengikuti bahasa visual ini. Pengaturan halaman login sengaja dipisahkan.</p></div>
        <div className="flex gap-2"><Button variant="ghost" size="sm" icon={<RotateCcw size={14} />} onClick={() => void reset()}>Reset</Button><Button size="sm" icon={<Save size={14} />} isLoading={saving} onClick={() => void save()}>Simpan perubahan</Button></div>
      </section>

      {error && <div className="rounded-[var(--tf-radius-md)] border border-[var(--tf-danger)]/30 bg-[var(--tf-danger-bg)] px-4 py-3 text-xs text-[var(--tf-danger)]">{error}</div>}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_360px]">
        <div className="space-y-5">
          <Card className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3"><div><div className="studio-eyebrow"><Palette size={13} /> Visual language</div><h2 className="mt-1 text-lg font-semibold">6 tema dashboard</h2></div><Badge variant="primary">{dashboardTheme}</Badge></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {THEMES.map((theme) => { const selected = dashboardTheme === theme.id; return <button key={theme.id} type="button" onClick={() => setDashboardTheme(theme.id)} className={`text-left rounded-[var(--tf-radius-card)] border p-4 transition-all ${selected ? 'border-[var(--tf-primary)] bg-[var(--tf-primary-subtle)] shadow-[var(--tf-shadow-flat)]' : 'border-[var(--tf-border)] bg-[var(--tf-bg-surface)] hover:bg-[var(--tf-bg-subtle)]'}`}><div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold text-[var(--tf-text-primary)]">{theme.name}</span>{selected && <Check size={16} className="text-[var(--tf-primary)]" />}</div><div className="mt-3 flex gap-1.5">{theme.swatch.map((color) => <span key={color} className="h-6 w-6 rounded-full border border-black/10" style={{ background: color }} />)}</div><div className="mt-3 text-[10px] font-bold uppercase tracking-[.14em] text-[var(--tf-primary)]">{theme.mood}</div><p className="mt-1.5 text-[11px] leading-5 text-[var(--tf-text-muted)]">{theme.description}</p></button>; })}
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="studio-eyebrow"><LayoutGrid size={13} /> Dashboard composition</div><h2 className="mt-1 text-lg font-semibold">4 mode layout</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">{LAYOUTS.map(({ id, name, description, icon: Icon }) => <button key={id} type="button" onClick={() => setDashboardLayout(id)} className={`flex items-start gap-3 rounded-[var(--tf-radius-card)] border p-4 text-left ${dashboardLayout === id ? 'border-[var(--tf-primary)] bg-[var(--tf-primary-subtle)]' : 'border-[var(--tf-border)] hover:bg-[var(--tf-bg-subtle)]'}`}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--tf-radius-md)] bg-[var(--tf-bg-subtle)] text-[var(--tf-primary)]"><Icon size={17} /></span><span><span className="flex items-center gap-2 text-sm font-semibold">{name}{dashboardLayout === id && <Check size={14} className="text-[var(--tf-primary)]" />}</span><span className="mt-1 block text-[11px] leading-5 text-[var(--tf-text-muted)]">{description}</span></span></button>)}</div>
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="studio-eyebrow"><PanelLeft size={13} /> Navigation</div><h2 className="mt-1 text-lg font-semibold">Shell & mobile</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <SettingSelect label="Sidebar desktop" value={sidebarMode} onChange={(v) => setSidebarMode(v as SidebarMode)} options={[['full','Full'],['collapsed','Mini'],['hidden','Hide']]} />
              <SettingSelect label="Navigasi mobile" value={mobileNavMode} onChange={(v) => setMobileNavMode(v as MobileNavMode)} options={[['drawer','Drawer'],['bottom','Bottom Bar']]} />
              <SettingSelect label="Panel aksi" value={handedness} onChange={(v) => setHandedness(v as Handedness)} options={[['right','Kanan'],['left','Kiri']]} />
              <SettingSelect label="Kepadatan" value={density} onChange={(v) => setDensity(v as Density)} options={[['compact','Compact'],['comfortable','Comfort'],['spacious','Spacious']]} />
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="studio-eyebrow"><Type size={13} /> Detail styling</div><h2 className="mt-1 text-lg font-semibold">Radius, type & ambience</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2"><SettingSelect label="Radius" value={radius} onChange={(v) => setRadius(v as Radius)} options={RADII.map((x) => [x.id, x.label])} /><SettingSelect label="Ukuran huruf" value={fontScale} onChange={(v) => setFontScale(v as FontScale)} options={FONT_SCALES.map((x) => [x.id, x.label])} /><SettingSelect label="Ambience" value={ambience} onChange={(v) => setAmbience(v as Ambience)} options={AMBIENCES.map((x) => [x.id, x.label])} /><SettingSelect label="Accent override" value={accentColor} onChange={(v) => setAccentColor(v as typeof accentColor)} options={ACCENTS.map((x) => [x.id, x.label])} /></div>
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="studio-eyebrow"><Zap size={13} /> Perilaku</div><h2 className="mt-1 text-lg font-semibold">Kenyamanan penggunaan</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <ToggleRow label="Mode tema" value={themeMode} options={[['system','System'],['light','Light'],['dark','Dark']]} onChange={(v) => setThemeMode(v as ThemeMode)} />
              <ToggleRow label="Animasi" value={animations ? 'on' : 'off'} options={[['on','Aktif'],['off','Mati']]} onChange={(v) => setAnimations(v === 'on')} />
              <ToggleRow label="Reduce motion" value={reducedMotion ? 'on' : 'off'} options={[['on','Aktif'],['off','Mati']]} onChange={(v) => setReducedMotion(v === 'on')} />
              <ToggleRow label="Live status bar" value={showLiveBar ? 'on' : 'off'} options={[['on','Tampil'],['off','Sembunyikan']]} onChange={(v) => setShowLiveBar(v === 'on')} />
              <ToggleRow label="Watermark" value={showWatermark ? 'on' : 'off'} options={[['on','Tampil'],['off','Sembunyikan']]} onChange={(v) => setShowWatermark(v === 'on')} />
              <ToggleRow label="Awal minggu" value={weekStartsMonday ? 'monday' : 'sunday'} options={[['monday','Senin'],['sunday','Minggu']]} onChange={(v) => setWeekStartsMonday(v === 'monday')} />
            </div>
          </Card>

          <Card className="p-4 sm:p-5 border-[var(--tf-primary)] bg-[var(--tf-primary-subtle)]/50">
            <div className="studio-eyebrow text-[var(--tf-primary)]"><Sparkles size={13} /> Gaya Hidup & Romansa</div><h2 className="mt-1 text-lg font-semibold">Integrasi Lifestyle</h2>
            <p className="mt-1 text-xs text-[var(--tf-text-muted)]">Pengaturan ini tersimpan ke Workspace (AppConfig) dan berlaku untuk notifikasi kalian berdua.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" checked={appConfig.lifestyle.enableRomanticReminders} onChange={(e) => void appConfig.save('lifestyle', { ...appConfig.lifestyle, enableRomanticReminders: e.target.checked })} />
                <div>
                  <div className="text-sm font-semibold">Reminders Romantis</div>
                  <div className="text-[11px] text-[var(--tf-text-muted)]">Notifikasi manis di pagi, siang, dan malam.</div>
                </div>
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" checked={appConfig.lifestyle.isFasting} onChange={(e) => void appConfig.save('lifestyle', { ...appConfig.lifestyle, isFasting: e.target.checked })} />
                <div>
                  <div className="text-sm font-semibold">Mode Puasa</div>
                  <div className="text-[11px] text-[var(--tf-text-muted)]">Ganti notifikasi makan menjadi Sahur (Imsak -45m) & Berbuka (Maghrib).</div>
                </div>
              </label>
            </div>
          </Card>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <Card variant="glass" className="overflow-hidden p-0">
            <div className="border-b border-[var(--tf-border)] p-5"><div className="studio-eyebrow">Live preview</div><h2 className="mt-1 text-xl font-semibold">{THEMES.find((x) => x.id === dashboardTheme)?.name}</h2><p className="mt-1 text-xs text-[var(--tf-text-muted)]">Preview shell mengikuti kombinasi yang dipilih.</p></div>
            <div className="p-4"><div className="rounded-[var(--tf-radius-card)] border border-[var(--tf-border)] bg-[var(--tf-bg-subtle)] p-3"><div className="flex gap-2"><span className="h-2 w-16 rounded-full bg-[var(--tf-primary)]" /><span className="h-2 w-8 rounded-full bg-[var(--tf-border)]" /></div><div className="mt-4 grid gap-2"><div className="h-14 rounded-[var(--tf-radius-md)] border border-[var(--tf-border)] bg-[var(--tf-bg-surface)]" /><div className="grid grid-cols-2 gap-2"><div className="h-20 rounded-[var(--tf-radius-md)] border border-[var(--tf-border)] bg-[var(--tf-bg-surface)]" /><div className="h-20 rounded-[var(--tf-radius-md)] border border-[var(--tf-border)] bg-[var(--tf-bg-surface)]" /></div><div className="h-3 rounded-full bg-[var(--tf-primary-subtle)]" /></div></div></div>
            <div className="grid grid-cols-2 border-t border-[var(--tf-border)]"><PreviewStat label="Layout" value={dashboardLayout} /><PreviewStat label="Sidebar" value={sidebarMode} /><PreviewStat label="Mobile" value={mobileNavMode} /><PreviewStat label="Radius" value={radius} /></div>
          </Card>

          <Card className="p-5"><div className="studio-eyebrow"><Monitor size={13} /> Sinkronisasi</div><h3 className="mt-1 text-base font-semibold">Tersimpan setelah tombol Simpan</h3><p className="mt-2 text-xs leading-5 text-[var(--tf-text-muted)]">Preferensi Studio disimpan lokal agar pergantian tema instan, lalu disinkronkan ke tabel settings saat kamu menekan Simpan.</p><div className="mt-4 rounded-[var(--tf-radius-md)] bg-[var(--tf-primary-subtle)] p-3 text-[11px] text-[var(--tf-primary)]">Login tetap memakai halaman dan styling login existing.</div></Card>
        </aside>
      </div>
    </div>
  );
}

function SettingSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<[string, string]> }) {
  return <label className="block"><span className="label">{label}</span><select className="input" value={value} onChange={(e) => onChange(e.target.value)}>{options.map(([id, text]) => <option key={id} value={id}>{text}</option>)}</select></label>;
}

function ToggleRow({ label, value, options, onChange }: { label: string; value: string; options: Array<[string, string]>; onChange: (value: string) => void }) {
  return <div className="rounded-[var(--tf-radius-md)] border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] p-3"><div className="mb-2 text-xs font-semibold text-[var(--tf-text-primary)]">{label}</div><div className="grid grid-cols-2 gap-1 rounded-[var(--tf-radius-md)] bg-[var(--tf-bg-subtle)] p-1">{options.map(([id, text]) => <button key={id} type="button" onClick={() => onChange(id)} className={`min-h-9 rounded-[var(--tf-radius-sm)] px-2 text-[11px] font-semibold ${value === id ? 'bg-[var(--tf-bg-surface)] text-[var(--tf-primary)] shadow-sm' : 'text-[var(--tf-text-muted)]'}`}>{text}</button>)}</div></div>;
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return <div className="border-r border-t border-[var(--tf-border)] p-3 last:border-r-0"><div className="text-[9px] font-bold uppercase tracking-[.14em] text-[var(--tf-text-muted)]">{label}</div><div className="mt-1 truncate text-xs font-semibold text-[var(--tf-text-primary)]">{value}</div></div>;
}
