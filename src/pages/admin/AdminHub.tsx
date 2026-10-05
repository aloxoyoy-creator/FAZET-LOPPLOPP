import { useCallback, useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import Button from '../../components/ui/Button';
import {
  Activity, ArrowRight, CalendarHeart, CheckCircle2, Database, Eye, EyeOff, Gauge, Heart, KeyRound,
  LayoutDashboard, Megaphone, Palette, Power, Save, Search, ShieldCheck, Smartphone, Sparkles,
  ToggleRight, Trash2, Users, Wrench, Plus, Clock3, BookOpen, Bell, HardDrive, Settings2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
  FEATURES, DEFAULT_BRANDING, useAppConfig, type Birthday, type BrandingConfig,
} from '../../context/AppConfigContext';

type IconT = ComponentType<{ size?: number; className?: string }>;
type Section = 'overview' | 'features' | 'branding' | 'dashboard' | 'keys' | 'tools' | 'ai' | 'cleanup';
type SecretRow = { name: string; enabled: boolean; hint: string; updated_at: string };

const SECTIONS: { id: Section; label: string; desc: string; Icon: IconT }[] = [
  { id: 'overview', label: 'Ringkasan', desc: 'Status aplikasi saat ini', Icon: LayoutDashboard },
  { id: 'features', label: 'Fitur', desc: 'Nyalakan / matikan fitur', Icon: ToggleRight },
  { id: 'branding', label: 'Tampilan & Pengumuman', desc: 'Nama, banner, maintenance', Icon: Palette },
  { id: 'dashboard', label: 'Data Dashboard', desc: 'Tanggal jadian & ulang tahun', Icon: CalendarHeart },
  { id: 'keys', label: 'API Key', desc: 'AI & YouTube tanpa coding', Icon: KeyRound },
  { id: 'tools', label: 'Semua Alat Admin', desc: 'Pengguna, jadwal, sistem', Icon: Wrench },
  { id: 'ai', label: 'AI & Asisten', desc: 'Sifat dan respon AI', Icon: Sparkles },
  { id: 'cleanup', label: 'Perawatan Data', desc: 'Bersihkan cache, log, storage', Icon: Trash2 },
];

const KEY_PRESETS: { name: string; label: string; help: string }[] = [
  { name: 'GROQ_API_KEY', label: 'Groq', help: 'AI utama (cepat & gratis)' },
  { name: 'GEMINI_API_KEY', label: 'Gemini', help: 'AI Google' },
  { name: 'OPENROUTER_API_KEY', label: 'OpenRouter', help: 'AI cadangan multi-model' },
  { name: 'DEEPSEEK_API_KEY', label: 'DeepSeek', help: 'AI cadangan' },
  { name: 'YOUTUBE_API_KEY', label: 'YouTube', help: 'Pencarian video MediaBox' },
];

const TOOL_GROUPS: { title: string; items: { to: string; label: string; Icon: IconT }[] }[] = [
  { title: 'Pengguna & Keamanan', items: [
    { to: '/admin/users', label: 'Pengguna', Icon: Users },
    { to: '/admin/sessions', label: 'Sesi & Perangkat', Icon: Smartphone },
    { to: '/admin/audit-logs', label: 'Audit Log', Icon: ShieldCheck },
    { to: '/admin/digital-cards', label: 'Kartu Digital', Icon: ShieldCheck },
  ] },
  { title: 'Akademik & Konten', items: [
    { to: '/admin/schedule', label: 'Jadwal Sekolah', Icon: Clock3 },
    { to: '/admin/tutoring-schedule', label: 'Jadwal Les (Fathur)', Icon: BookOpen },
    { to: '/admin/tasks', label: 'Tugas', Icon: Gauge },
    { to: '/admin/task-workspace', label: 'Task Workspace', Icon: Database },
    { to: '/admin/subjects', label: 'Mata Pelajaran', Icon: BookOpen },
    { to: '/admin/teachers', label: 'Guru', Icon: Users },
    { to: '/admin/announcements', label: 'Pengumuman', Icon: Megaphone },
    { to: '/admin/notifications', label: 'Notifikasi', Icon: Bell },
    { to: '/admin/broadcast', label: 'Broadcast', Icon: Megaphone },
  ] },
  { title: 'Sistem & Data', items: [
    { to: '/admin/health', label: 'Kesehatan Sistem', Icon: Activity },
    { to: '/admin/analytics', label: 'Analitik', Icon: Activity },
    { to: '/admin/focus-sessions', label: 'Sesi Fokus', Icon: Gauge },
    { to: '/admin/my-minee', label: 'Galeri My Minee', Icon: Heart },
    { to: '/admin/storage', label: 'Storage', Icon: HardDrive },
    { to: '/admin/data', label: 'Data Workspace', Icon: Database },
    { to: '/admin/settings', label: 'Pengaturan Sistem', Icon: Settings2 },
  ] },
];

const TONES: Record<NonNullable<BrandingConfig['bannerTone']>, string> = {
  info: 'border-sky-400/30 bg-sky-500/10 text-sky-700 dark:text-sky-200',
  success: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200',
  warning: 'border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-200',
  danger: 'border-rose-400/30 bg-rose-500/10 text-rose-700 dark:text-rose-200',
};

const inputCls = 'w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 dark:border-slate-700 dark:bg-slate-900/60';

function Panel({ title, desc, children, action }: { title: string; desc?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/60 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-white">{title}</h2>
          {desc && <p className="mt-1 text-xs leading-5 text-slate-500">{desc}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Toggle({ on, onChange, disabled }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={on} disabled={disabled} onClick={() => onChange(!on)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${on ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-6' : 'left-1'}`} />
    </button>
  );
}

function SaveBtn({ onClick, busy, children = 'Simpan' }: { onClick: () => void; busy?: boolean; children?: ReactNode }) {
  return (
    <button type="button" onClick={onClick} disabled={busy}
      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110 disabled:opacity-60">
      <Save size={15} /> {busy ? 'Menyimpan…' : children}
    </button>
  );
}

function Stat({ label, value, Icon, tone }: { label: string; value: ReactNode; Icon: IconT; tone: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
      <div className={`grid h-9 w-9 place-items-center rounded-xl ${tone}`}><Icon size={17} /></div>
      <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{value}</div>
      <div className="text-xs font-semibold text-slate-500">{label}</div>
    </div>
  );
}

export default function AdminHub() {
  const { user } = useAuth();
  const { disabled, dashboard, branding, ai, save } = useAppConfig();
  const [section, setSection] = useState<Section>('overview');
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const flash = (ok: boolean, msg: string) => { setToast({ ok, msg }); if (ok) confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } }); window.setTimeout(() => setToast(null), 2600); };
  const run = async (fn: () => Promise<void>, ok: string) => {
    setBusy(true);
    try { await fn(); flash(true, ok); } catch (e) { flash(false, `Gagal: ${(e as Error).message}`); } finally { setBusy(false); }
  };

  // ---------- Stats ----------
  const [stats, setStats] = useState({ users: 0, tasks: 0 });
  useEffect(() => {
    void (async () => {
      const [u, t] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('tasks').select('id', { count: 'exact', head: true }),
      ]);
      setStats({ users: u.count ?? 0, tasks: t.count ?? 0 });
    })();
  }, []);

  // ---------- Features ----------
  const [q, setQ] = useState('');
  const shownFeatures = FEATURES.filter((f) => f.label.toLowerCase().includes(q.toLowerCase()));
  const setDisabled = (next: string[]) => run(() => save('features', { disabled: next }), 'Fitur diperbarui');
  const toggleFeature = (id: string, on: boolean) =>
    setDisabled(on ? disabled.filter((d) => d !== id) : [...new Set([...disabled, id])]);

  // ---------- Branding ----------
  const [br, setBr] = useState<BrandingConfig>({ ...DEFAULT_BRANDING, ...branding });
  useEffect(() => { setBr({ ...DEFAULT_BRANDING, ...branding }); }, [branding]);

  // ---------- AI ----------
  const [aiCfg, setAiCfg] = useState(ai);
  useEffect(() => { setAiCfg(ai); }, [ai]);

  // ---------- Dashboard ----------
  const [start, setStart] = useState(dashboard.relationshipStart);
  const [birthdays, setBirthdays] = useState<Birthday[]>(dashboard.birthdays);
  useEffect(() => { setStart(dashboard.relationshipStart); setBirthdays(dashboard.birthdays); }, [dashboard]);
  const pad = (n: number) => String(n).padStart(2, '0');
  const startValue = `${start.year}-${pad(start.month)}-${pad(start.day)}T${pad(start.hour)}:${pad(start.minute)}`;
  const onStartChange = (v: string) => {
    const m = v.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (m) setStart({ year: +m[1], month: +m[2], day: +m[3], hour: +m[4], minute: +m[5] });
  };
  const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const saveDashboard = () => run(() => save('dashboard', {
    relationshipStart: start,
    birthdays: birthdays.map((b) => ({ ...b, label: `${b.day} ${MONTHS[(b.month - 1 + 12) % 12]}` })),
  }), 'Data dashboard tersimpan');

  // ---------- API keys ----------
  const [secrets, setSecrets] = useState<SecretRow[]>([]);
  const [keyName, setKeyName] = useState(KEY_PRESETS[0].name);
  const [keyValue, setKeyValue] = useState('');
  const [reveal, setReveal] = useState(false);
  const loadSecrets = useCallback(async () => {
    const { data } = await supabase.rpc('admin_list_secrets');
    setSecrets((data as SecretRow[]) || []);
  }, []);
  useEffect(() => { void loadSecrets(); }, [loadSecrets]);
  const saveSecret = () => run(async () => {
    const clean = keyName.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    if (!clean || !keyValue.trim()) throw new Error('Nama dan nilai key wajib diisi');
    const { error } = await supabase.from('app_secrets').upsert(
      { name: clean, value: keyValue.trim(), enabled: true, updated_at: new Date().toISOString() }, { onConflict: 'name' });
    if (error) throw new Error(error.message);
    setKeyValue(''); await loadSecrets();
  }, 'API key tersimpan aman di server');
  const toggleSecret = (n: string, enabled: boolean) => run(async () => {
    const { error } = await supabase.from('app_secrets').update({ enabled }).eq('name', n);
    if (error) throw new Error(error.message); await loadSecrets();
  }, enabled ? 'Key diaktifkan' : 'Key dinonaktifkan');
  const deleteSecret = (n: string) => {
    if (!confirm(`Hapus ${n}?`)) return;
    void run(async () => {
      const { error } = await supabase.from('app_secrets').delete().eq('name', n);
      if (error) throw new Error(error.message); await loadSecrets();
    }, 'Key dihapus');
  };

  const activeFeatures = FEATURES.length - disabled.filter((d) => FEATURES.some((f) => f.id === d)).length;
  const current = useMemo(() => SECTIONS.find((s) => s.id === section)!, [section]);

  return (
    <div className="fade-up space-y-5">
      {/* Hero */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest">
              <Sparkles size={12} /> Admin Command Center
            </div>
            <h1 className="mt-3 text-2xl font-black sm:text-3xl">Kendalikan {branding.appName || 'FAZET'} dari mana saja</h1>
            <p className="mt-1 text-sm text-white/80">Semua perubahan langsung tersinkron real-time ke semua perangkat • {user?.email}</p>
          </div>
          <div className="flex gap-2">
            <span className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${branding.maintenance ? 'bg-amber-400 text-amber-950' : 'bg-emerald-400 text-emerald-950'}`}>
              <Power size={14} /> {branding.maintenance ? 'MODE PERAWATAN' : 'APLIKASI ONLINE'}
            </span>
          </div>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        {/* Nav */}
        <nav className="flex gap-2 overflow-x-auto lg:sticky lg:top-4 lg:flex-col lg:self-start">
          {SECTIONS.map(({ id, label, desc, Icon }) => {
            const active = id === section;
            return (
              <button key={id} type="button" onClick={() => setSection(id)}
                className={`flex min-w-max items-center gap-3 rounded-2xl border p-3 text-left transition lg:min-w-0 ${active
                  ? 'border-indigo-400/60 bg-indigo-50 shadow-sm dark:border-indigo-500/40 dark:bg-indigo-500/10'
                  : 'border-transparent hover:border-slate-200 hover:bg-white/60 dark:hover:border-slate-800 dark:hover:bg-slate-900/50'}`}>
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}><Icon size={17} /></span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold">{label}</span>
                  <span className="hidden truncate text-[11px] text-slate-500 lg:block">{desc}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <main key={current.id} className="page-transition min-w-0 space-y-5">
          {section === 'overview' && (
            <>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat label="Pengguna" value={stats.users} Icon={Users} tone="bg-sky-500/15 text-sky-600" />
                <Stat label="Tugas" value={stats.tasks} Icon={Gauge} tone="bg-violet-500/15 text-violet-600" />
                <Stat label="Fitur aktif" value={`${activeFeatures}/${FEATURES.length}`} Icon={ToggleRight} tone="bg-emerald-500/15 text-emerald-600" />
                <Stat label="API key aktif" value={secrets.filter((s) => s.enabled).length} Icon={KeyRound} tone="bg-amber-500/15 text-amber-600" />
              </div>
              <Panel title="Aksi cepat" desc="Hal yang paling sering kamu ubah.">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                    <div><div className="text-sm font-bold">Mode perawatan</div><div className="text-xs text-slate-500">Kunci aplikasi untuk semua selain admin</div></div>
                    <Toggle on={!!branding.maintenance} disabled={busy} onChange={(v) => void run(() => save('branding', { ...br, maintenance: v }), v ? 'Mode perawatan AKTIF' : 'Aplikasi kembali online')} />
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                    <div><div className="text-sm font-bold">Banner pengumuman</div><div className="truncate text-xs text-slate-500">{branding.announcement || '—'}</div></div>
                    <Toggle on={branding.announcementVisible} disabled={busy} onChange={(v) => void run(() => save('branding', { ...br, announcementVisible: v }), v ? 'Banner ditampilkan' : 'Banner disembunyikan')} />
                  </div>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {SECTIONS.slice(1).map((s) => (
                    <button key={s.id} type="button" onClick={() => setSection(s.id)} className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-left text-sm font-semibold transition hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800">
                      <s.Icon size={15} /> <span className="flex-1">{s.label}</span> <ArrowRight size={14} className="text-slate-400" />
                    </button>
                  ))}
                </div>
              </Panel>
            </>
          )}

          {section === 'features' && (
            <Panel title="Fitur aplikasi" desc="Fitur yang dimatikan otomatis hilang dari menu dan halamannya terkunci untuk semua pengguna — langsung, tanpa refresh."
              action={<div className="flex gap-2">
                <button type="button" disabled={busy} onClick={() => void setDisabled([])} className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">Nyalakan semua</button>
                <button type="button" disabled={busy} onClick={() => void setDisabled(FEATURES.map((f) => f.id))} className="rounded-lg bg-rose-500/15 px-3 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-300">Matikan semua</button>
              </div>}>
              <div className="relative mb-4">
                <Search size={15} className="absolute left-3 top-3 text-slate-400" />
                <input className={`${inputCls} pl-9`} placeholder="Cari fitur…" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {shownFeatures.map((f) => {
                  const on = !disabled.includes(f.id);
                  return (
                    <div key={f.id} className={`flex items-center justify-between gap-3 rounded-2xl border p-3.5 transition ${on ? 'border-slate-200 dark:border-slate-800' : 'border-rose-300/50 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20'}`}>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold">{f.label}</div>
                        <div className="truncate text-[11px] text-slate-500">{on ? 'Aktif' : 'Nonaktif'} • {f.paths.join(', ')}</div>
                      </div>
                      <Toggle on={on} disabled={busy} onChange={(v) => void toggleFeature(f.id, v)} />
                    </div>
                  );
                })}
              </div>
            </Panel>
          )}

          {section === 'branding' && (
            <>
              <Panel title="Identitas aplikasi" desc="Nama dan tagline yang tampil di header aplikasi.">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-bold">Nama aplikasi<input className={`${inputCls} mt-1`} value={br.appName} onChange={(e) => setBr({ ...br, appName: e.target.value })} /></label>
                  <label className="text-xs font-bold">Tagline<input className={`${inputCls} mt-1`} value={br.tagline ?? ''} onChange={(e) => setBr({ ...br, tagline: e.target.value })} /></label>
                </div>
              </Panel>

              <Panel title="Banner pengumuman" desc="Muncul di atas setiap halaman untuk semua pengguna.">
                <div className="space-y-3">
                  <textarea rows={2} className={inputCls} value={br.announcement} placeholder="Tulis pengumuman…" onChange={(e) => setBr({ ...br, announcement: e.target.value })} />
                  <div className="flex flex-wrap items-center gap-2">
                    {(Object.keys(TONES) as (keyof typeof TONES)[]).map((tone) => (
                      <button key={tone} type="button" onClick={() => setBr({ ...br, bannerTone: tone })}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-bold capitalize ${TONES[tone]} ${br.bannerTone === tone ? 'ring-2 ring-indigo-400' : ''}`}>{tone}</button>
                    ))}
                    <div className="ml-auto flex items-center gap-2 text-xs font-bold">Tampilkan <Toggle on={br.announcementVisible} onChange={(v) => setBr({ ...br, announcementVisible: v })} /></div>
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pratinjau</div>
                  <div className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-center text-sm font-semibold ${TONES[br.bannerTone ?? 'info']} ${br.announcementVisible ? '' : 'opacity-40'}`}>
                    <Megaphone size={15} /> {br.announcement || 'Belum ada teks'}
                  </div>
                </div>
              </Panel>

              <Panel title="Mode perawatan" desc="Saat aktif, semua pengguna selain admin hanya melihat pesan di bawah.">
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-300/50 bg-amber-50/60 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                  <div className="flex items-center gap-3"><Wrench size={18} className="text-amber-600" /><span className="text-sm font-bold">{br.maintenance ? 'Perawatan AKTIF' : 'Aplikasi normal'}</span></div>
                  <Toggle on={!!br.maintenance} onChange={(v) => setBr({ ...br, maintenance: v })} />
                </div>
                <textarea rows={2} className={`${inputCls} mt-3`} value={br.maintenanceMessage ?? ''} onChange={(e) => setBr({ ...br, maintenanceMessage: e.target.value })} />
              </Panel>

              <div className="flex justify-end"><SaveBtn busy={busy} onClick={() => void run(() => save('branding', br), 'Tampilan & pengumuman tersimpan')}>Simpan semua perubahan</SaveBtn></div>
            </>
          )}

          {section === 'dashboard' && (
            <Panel title="Data dashboard" desc="Dipakai oleh timer & countdown di Dashboard (zona waktu WIB)."
              action={<SaveBtn busy={busy} onClick={() => void saveDashboard()} />}>
              <label className="block text-xs font-bold">Tanggal & jam mulai hubungan
                <input type="datetime-local" className={`${inputCls} mt-1`} value={startValue} onChange={(e) => onStartChange(e.target.value)} />
              </label>
              <div className="mt-5 text-xs font-bold">Ulang tahun</div>
              <div className="mt-2 space-y-2">
                {birthdays.map((b, i) => (
                  <div key={b.key} className="grid grid-cols-[1fr_120px_80px_auto] items-center gap-2">
                    <input className={inputCls} value={b.name} placeholder="Nama" onChange={(e) => setBirthdays(birthdays.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                    <select className={inputCls} value={b.month} onChange={(e) => setBirthdays(birthdays.map((x, j) => j === i ? { ...x, month: +e.target.value } : x))}>
                      {MONTHS.map((m, idx) => <option key={m} value={idx + 1}>{m}</option>)}
                    </select>
                    <input className={inputCls} type="number" min={1} max={31} value={b.day} onChange={(e) => setBirthdays(birthdays.map((x, j) => j === i ? { ...x, day: +e.target.value || 1 } : x))} />
                    <button type="button" aria-label="Hapus" className="grid h-10 w-10 place-items-center rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30" onClick={() => setBirthdays(birthdays.filter((_, j) => j !== i))}><Trash2 size={16} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setBirthdays([...birthdays, { key: `b${Date.now()}`, name: 'Nama', month: 1, day: 1, label: '' }])}
                  className="inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 hover:border-indigo-400 dark:border-slate-700 dark:text-slate-300"><Plus size={14} /> Tambah ulang tahun</button>
              </div>
            </Panel>
          )}

          {section === 'keys' && (
            <>
              <Panel title="Tambah / ganti API key" desc="Disimpan di server dan tidak bisa dibaca kembali dari browser. Hanya 4 karakter terakhir yang tampil.">
                <div className="flex flex-wrap gap-2">
                  {KEY_PRESETS.map((p) => (
                    <button key={p.name} type="button" onClick={() => setKeyName(p.name)} title={p.help}
                      className={`rounded-xl border px-3 py-2 text-left text-xs transition ${keyName === p.name ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-200 dark:border-slate-800'}`}>
                      <div className="font-bold">{p.label}</div><div className="text-[10px] text-slate-500">{p.help}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-[220px_1fr_auto]">
                  <input className={`${inputCls} font-mono`} value={keyName} onChange={(e) => setKeyName(e.target.value)} placeholder="NAMA_KEY" />
                  <div className="relative">
                    <input className={`${inputCls} pr-10 font-mono`} type={reveal ? 'text' : 'password'} value={keyValue} onChange={(e) => setKeyValue(e.target.value)} placeholder="Tempel API key di sini" />
                    <button type="button" onClick={() => setReveal(!reveal)} className="absolute right-3 top-2.5 text-slate-400">{reveal ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  </div>
                  <SaveBtn busy={busy} onClick={() => void saveSecret()} />
                </div>
              </Panel>
              <Panel title="Key tersimpan">
                {secrets.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700">Belum ada API key.</div> : (
                  <div className="space-y-2">
                    {secrets.map((s) => (
                      <div key={s.name} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                        <span className={`grid h-9 w-9 place-items-center rounded-xl ${s.enabled ? 'bg-emerald-500/15 text-emerald-600' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'}`}>{s.enabled ? <CheckCircle2 size={16} /> : <KeyRound size={16} />}</span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-mono text-sm font-bold">{s.name}</div>
                          <div className="text-[11px] text-slate-500">{s.hint} • {new Date(s.updated_at).toLocaleString('id-ID')}</div>
                        </div>
                        <Toggle on={s.enabled} disabled={busy} onChange={(v) => void toggleSecret(s.name, v)} />
                        <button type="button" aria-label="Hapus" onClick={() => deleteSecret(s.name)} className="grid h-9 w-9 place-items-center rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"><Trash2 size={15} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            </>
          )}

          
          {section === 'ai' && (
            <>
              <Panel title="Karakter & Sifat AI" desc="Atur bagaimana FAZET AI merespon dan berinteraksi dengan kamu dan pengguna lain.">
                <label className="block text-xs font-bold">Nama Panggilan AI
                  <input className={inputCls + ' mt-1'} value={aiCfg?.personalityName || ''} onChange={(e) => setAiCfg({...aiCfg, personalityName: e.target.value})} placeholder="Contoh: FAZET AI" />
                </label>
                <label className="block mt-4 text-xs font-bold">Gaya Sapaan
                  <select className={inputCls + ' mt-1'} value={aiCfg?.greetingStyle || 'friendly'} onChange={(e) => setAiCfg({...aiCfg, greetingStyle: e.target.value as any})}>
                    <option value="friendly">Ramah & Sahabat (Friendly)</option>
                    <option value="formal">Sopan & Formal</option>
                    <option value="romantic">Romantis & Manis</option>
                    <option value="sassy">Sarkas & Gaul (Sassy)</option>
                  </select>
                </label>
                <label className="block mt-4 text-xs font-bold">System Prompt (Instruksi Utama)
                  <textarea rows={4} className={inputCls + ' mt-1'} value={aiCfg?.systemPrompt || ''} onChange={(e) => setAiCfg({...aiCfg, systemPrompt: e.target.value})} placeholder="Kamu adalah asisten Fathur..." />
                </label>
                <label className="block mt-4 text-xs font-bold">Tingkat Kreativitas: {Math.round((aiCfg?.creativityLevel || 0.7) * 100)}%
                  <input type="range" min="0" max="1" step="0.1" className="mt-2 w-full" value={aiCfg?.creativityLevel || 0.7} onChange={(e) => setAiCfg({...aiCfg, creativityLevel: parseFloat(e.target.value)})} />
                </label>
              </Panel>
              <div className="flex justify-end"><SaveBtn busy={busy} onClick={() => void run(() => save('ai_config', aiCfg), 'Pengaturan AI tersimpan')}>Simpan AI</SaveBtn></div>
            </>
          )}

          {section === 'cleanup' && (
            <Panel title="Pembersihan Data" desc="Aksi berbahaya untuk menghapus cache, log lama, atau pesan chat yang sudah usang.">
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <div>
                    <div className="font-bold">Bersihkan Cache Frontend</div>
                    <div className="text-xs text-slate-500">Hapus LocalStorage dan Reload Halaman</div>
                  </div>
                  <Button variant="ghost" onClick={() => { localStorage.clear(); window.location.reload(); }}>Bersihkan</Button>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/30 dark:bg-rose-950/20">
                  <div>
                    <div className="font-bold text-rose-700 dark:text-rose-400">Hapus Chat Lama (&gt; 30 Hari)</div>
                    <div className="text-xs text-rose-600/70 dark:text-rose-400/70">Aksi ini tidak bisa dibatalkan!</div>
                  </div>
                  <Button variant="danger" disabled={busy} onClick={async () => { setBusy(true); await supabase.from('messages').delete().lt('created_at', new Date(Date.now() - 30*24*60*60*1000).toISOString()); setToast({ msg: 'Chat lama dihapus', ok: true }); setTimeout(() => setToast(null), 3000); setBusy(false); }}>Hapus</Button>
                </div>
              </div>
            </Panel>
          )}
{section === 'tools' && (
            <div className="grid gap-5 xl:grid-cols-3">
              {TOOL_GROUPS.map((g) => (
                <Panel key={g.title} title={g.title}>
                  <div className="space-y-2">
                    {g.items.map(({ to, label, Icon }) => (
                      <Link key={to} to={to} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:-translate-y-0.5 hover:border-indigo-300 dark:border-slate-800">
                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800"><Icon size={16} /></span>
                        <span className="flex-1 truncate text-sm font-semibold">{label}</span>
                        <ArrowRight size={15} className="text-slate-400" />
                      </Link>
                    ))}
                  </div>
                </Panel>
              ))}
            </div>
          )}
        </main>
      </div>

      {toast && (
        <div className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl px-4 py-3 text-sm font-bold text-white shadow-2xl ${toast.ok ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
