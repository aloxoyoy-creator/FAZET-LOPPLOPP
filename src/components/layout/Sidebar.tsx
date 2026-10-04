import { useAppConfig } from '../../context/AppConfigContext';
import { useEffect, useMemo, useRef, useState, type ComponentType, type KeyboardEvent } from 'react';
import {
  Activity, BarChart3, Bell, BookOpen, CalendarClock, CalendarDays, ChevronDown, ClipboardList, FolderOpen,
  GraduationCap, Heart, IdCard, KeyRound, ListChecks, LogOut, Megaphone, MessageCircle, MonitorPlay,
  PanelLeftClose, PanelLeftOpen, Pin, PinOff, Search, Settings, ShieldAlert, ShieldCheck, Sparkles,
  StickyNote, Table2, Timer, TrendingUp, Tv, UserRound, Users, Clock3,
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace, WORKSPACES, type WorkspaceId } from '../../context/WorkspaceContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useTasks, useTaskStats } from '../../hooks/useTasks';
import { cn } from '../../lib/utils';
import '../../styles/sidebar.css';

type NavIcon = ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
type NavItem = { to: string; label: string; icon: NavIcon; end?: boolean };
type NavGroup = { id: string; label: string; items: NavItem[]; adminOnly?: boolean };

const GROUPS: NavGroup[] = [
  {
    id: 'main', label: 'Ruang utama', items: [
      { to: '/', label: 'Beranda', icon: Sparkles, end: true },
      { to: '/chat', label: 'Chat', icon: MessageCircle },
      { to: '/ai', label: 'FAZET AI', icon: Sparkles },
      { to: '/my-minee', label: 'My Minee', icon: Heart },
    ],
  },
  {
    id: 'study', label: 'Belajar', items: [
      { to: '/schedule', label: 'Jadwal Sekolah', icon: CalendarClock },
      { to: '/tutoring', label: 'Jadwal Les', icon: GraduationCap },
      { to: '/calendar', label: 'Academic Timeline', icon: CalendarDays },
      { to: '/tasks', label: 'Tugas', icon: ClipboardList },
      { to: '/notes', label: 'Catatan', icon: StickyNote },
      { to: '/focus', label: 'Focus Mode', icon: Timer },
      { to: '/insights', label: 'Insights', icon: BarChart3 },
    ],
  },
  {
    id: 'media', label: 'Media', items: [
      { to: '/timebox', label: 'TimeBox', icon: Clock3 },
      { to: '/mediabox', label: 'MediaBox & Watch Party', icon: Tv },
    ],
  },
  {
    id: 'account', label: 'Akun', items: [
      { to: '/search', label: 'Pencarian', icon: Search },
      { to: '/notifications', label: 'Notifikasi', icon: Bell },
      { to: '/activity', label: 'Aktivitas & Perangkat', icon: ShieldAlert },
      { to: '/profile', label: 'Profil', icon: UserRound },
      { to: '/settings', label: 'Pengaturan', icon: Settings },
    ],
  },
  {
    id: 'admin', label: 'Admin', adminOnly: true, items: [
      { to: '/admin', label: 'Operations Center', icon: KeyRound, end: true },
      { to: '/admin/users', label: 'Users', icon: Users },
      { to: '/admin/digital-cards', label: 'Kartu Digital', icon: IdCard },
      { to: '/admin/tasks', label: 'Tasks', icon: ClipboardList },
      { to: '/admin/task-workspace', label: 'Task Workspace', icon: ListChecks },
      { to: '/admin/schedule', label: 'Schedule', icon: Clock3 },
      { to: '/admin/subjects', label: 'Subjects', icon: BookOpen },
      { to: '/admin/teachers', label: 'Teachers', icon: UserRound },
      { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
      { to: '/admin/notifications', label: 'Notifications', icon: Bell },
      { to: '/admin/focus-sessions', label: 'Focus Sessions', icon: Clock3 },
      { to: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
      { to: '/admin/audit-logs', label: 'Audit Logs', icon: ShieldCheck },
      { to: '/admin/sessions', label: 'Sessions & Devices', icon: MonitorPlay },
      { to: '/admin/broadcast', label: 'Broadcast Center', icon: Megaphone },
      { to: '/admin/storage', label: 'Storage Manager', icon: FolderOpen },
      { to: '/admin/data', label: 'Data Workspace', icon: Table2 },
      { to: '/admin/health', label: 'System Health', icon: Activity },
      { to: '/admin/control', label: 'Kontrol Aplikasi', icon: KeyRound },
  { to: '/admin/settings', label: 'System Settings', icon: Settings },
    ],
  },
];

const PINS_KEY = 'fazet.nav.pins';
const CLOSED_KEY = 'fazet.nav.closed';

function readList(key: string, fallback: string[]): string[] {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : fallback;
  } catch {
    return fallback;
  }
}

function writeList(key: string, value: string[]) {
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage penuh / diblokir */ }
}

function groupOf(pathname: string, groups: NavGroup[]): string | null {
  let best: { id: string; len: number } | null = null;
  for (const g of groups) {
    for (const item of g.items) {
      const hit = item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`);
      if (hit && (!best || item.to.length > best.len)) best = { id: g.id, len: item.to.length };
    }
  }
  return best?.id ?? null;
}

export default function Sidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  const { isAdmin, user, logout } = useAuth();
  const { workspaceId, workspace, switchWorkspace, hasSession } = useWorkspace();
  const { unreadCount } = useNotifications();
  const { tasks } = useTasks();
  const stats = useTaskStats(tasks);
  const location = useLocation();
  const navigate = useNavigate();
  const filterRef = useRef<HTMLInputElement>(null);

  const { isPathEnabled } = useAppConfig();
  const showAdmin = isAdmin || user?.app_metadata?.role === 'admin' || user?.user_metadata?.role === 'admin';
  const groups = useMemo(() => GROUPS.filter((g) => !g.adminOnly || showAdmin).map((g) => g.adminOnly ? g : { ...g, items: g.items.filter((i) => isPathEnabled(i.to)) }), [showAdmin, isPathEnabled]);

  const [pins, setPins] = useState<string[]>(() => readList(PINS_KEY, []));
  const [closed, setClosed] = useState<string[]>(() => readList(CLOSED_KEY, ['admin']));
  const [query, setQuery] = useState('');

  const allItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const byPath = useMemo(() => new Map(allItems.map((i) => [i.to, i])), [allItems]);

  // Grup yang memuat halaman aktif selalu terbuka saat berpindah halaman.
  const activeGroup = groupOf(location.pathname, groups);
  useEffect(() => {
    if (!activeGroup) return;
    setClosed((prev) => {
      if (!prev.includes(activeGroup)) return prev;
      const next = prev.filter((id) => id !== activeGroup);
      writeList(CLOSED_KEY, next);
      return next;
    });
  }, [activeGroup]);

  // Pintasan "/" memfokuskan filter menu (kecuali sedang mengetik di kolom lain).
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)) return;
      if (collapsed || !filterRef.current || filterRef.current.offsetParent === null) return;
      e.preventDefault();
      filterRef.current.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [collapsed]);

  const togglePin = (to: string) => setPins((prev) => {
    const next = prev.includes(to) ? prev.filter((p) => p !== to) : [...prev, to];
    writeList(PINS_KEY, next);
    return next;
  });

  const toggleGroup = (id: string) => setClosed((prev) => {
    const next = prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id];
    writeList(CLOSED_KEY, next);
    return next;
  });

  const needle = query.trim().toLowerCase();
  const matches = useMemo(
    () => (needle ? allItems.filter((i) => i.label.toLowerCase().includes(needle)) : []),
    [needle, allItems],
  );

  const onFilterKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') { setQuery(''); e.currentTarget.blur(); }
    if (e.key === 'Enter' && matches[0]) { navigate(matches[0].to); setQuery(''); e.currentTarget.blur(); }
  };

  const openTasks = stats.pending + stats.inProgress + stats.overdue;
  const badgeFor = (to: string): { text: string; alert?: boolean; hint: string } | null => {
    if (to === '/notifications' && unreadCount > 0) return { text: unreadCount > 99 ? '99+' : String(unreadCount), alert: true, hint: `${unreadCount} belum dibaca` };
    if (to === '/tasks' && openTasks > 0) {
      return { text: String(openTasks), alert: stats.overdue > 0, hint: stats.overdue > 0 ? `${openTasks} aktif, ${stats.overdue} terlambat` : `${openTasks} aktif` };
    }
    return null;
  };

  const renderItem = (item: NavItem, opts: { pinnable?: boolean } = {}) => {
    const Icon = item.icon;
    const badge = badgeFor(item.to);
    const pinned = pins.includes(item.to);
    return (
      <li key={item.to} className="rail__row">
        <NavLink
          to={item.to}
          end={item.end}
          className={({ isActive }) => cn('rail__link focus-ring', isActive && 'is-active')}
          title={collapsed ? item.label + (badge ? ` · ${badge.hint}` : '') : undefined}
        >
          <Icon size={16} strokeWidth={1.7} className="rail__icon" />
          <span className="rail__text">{item.label}</span>
          {badge && (
            <span className={cn('rail__badge', badge.alert && 'is-alert')} title={badge.hint}>
              {badge.text}
              <span className="sr-only"> — {badge.hint}</span>
            </span>
          )}
        </NavLink>
        {opts.pinnable !== false && !collapsed && (
          <button
            type="button"
            className={cn('rail__pin focus-ring', pinned && 'is-pinned')}
            onClick={() => togglePin(item.to)}
            aria-pressed={pinned}
            aria-label={pinned ? `Lepas sematan ${item.label}` : `Sematkan ${item.label}`}
            title={pinned ? 'Lepas sematan' : 'Sematkan di atas'}
          >
            {pinned ? <PinOff size={13} strokeWidth={1.8} /> : <Pin size={13} strokeWidth={1.8} />}
          </button>
        )}
      </li>
    );
  };

  const pinnedItems = pins.map((p) => byPath.get(p)).filter((i): i is NavItem => Boolean(i));
  const initial = workspaceId === 'mazet' ? 'M' : 'F';
  const userName = (user?.user_metadata?.name as string | undefined) || user?.email?.split('@')[0] || 'Pengguna';

  return (
    <aside className={cn('fazet-sidebar rail hidden lg:flex bg-white/40 dark:bg-[#070b14]/50 backdrop-blur-2xl border-r border-white/20 dark:border-white/5 shadow-[4px_0_30px_rgba(0,0,0,0.03)]', collapsed && 'fazet-sidebar--collapsed rail--collapsed')}>
      <div className="rail__inner">
        <header className="rail__head">
          <div className="rail__mark" data-workspace={workspaceId} aria-hidden="true">{initial}</div>
          {!collapsed && (
            <div className="rail__id">
              <div className="rail__name">{workspace.name}</div>
              <div className="rail__sub">{workspace.schoolLabel}</div>
            </div>
          )}
          <button
            type="button"
            className="rail__collapse focus-ring"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Buka menu samping' : 'Ciutkan menu samping'}
            aria-expanded={!collapsed}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </header>

        {collapsed ? (
          <button type="button" className="rail__find-icon focus-ring" onClick={() => navigate('/search')} aria-label="Pencarian" title="Pencarian">
            <Search size={16} strokeWidth={1.7} />
          </button>
        ) : (
          <div className="rail__find">
            <Search size={14} strokeWidth={1.8} aria-hidden="true" />
            <input
              ref={filterRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onFilterKey}
              placeholder="Cari menu"
              aria-label="Cari menu"
              spellCheck={false}
              autoComplete="off"
            />
            <kbd aria-hidden="true">/</kbd>
          </div>
        )}

        <nav className="rail__nav" aria-label="Navigasi FAZET">
          {needle ? (
            <section aria-label="Hasil pencarian menu">
              {!collapsed && <h2 className="rail__label"><span>{matches.length ? `${matches.length} hasil` : 'Tidak ada hasil'}</span></h2>}
              <ul className="rail__list">{matches.map((i) => renderItem(i))}</ul>
              {!matches.length && !collapsed && (
                <button type="button" className="rail__fallback focus-ring" onClick={() => { navigate(`/search?q=${encodeURIComponent(query.trim())}`); setQuery(''); }}>
                  Cari “{query.trim()}” di seluruh data →
                </button>
              )}
            </section>
          ) : (
            <>
              {pinnedItems.length > 0 && (
                <section aria-label="Disematkan">
                  {collapsed ? <hr className="rail__rule" /> : <h2 className="rail__label"><span>Disematkan</span><b>{pinnedItems.length}</b></h2>}
                  <ul className="rail__list">{pinnedItems.map((i) => renderItem(i))}</ul>
                </section>
              )}
              {groups.map((g) => {
                const open = collapsed || !closed.includes(g.id);
                const panelId = `rail-group-${g.id}`;
                return (
                  <section key={g.id} aria-label={g.label} className="rail__group">
                    {collapsed ? <hr className="rail__rule" /> : (
                      <h2 className="rail__label">
                        <button type="button" className="rail__toggle focus-ring" onClick={() => toggleGroup(g.id)} aria-expanded={open} aria-controls={panelId}>
                          <span>{g.label}</span>
                          <ChevronDown size={13} strokeWidth={2} className={cn('rail__chev', !open && 'is-shut')} aria-hidden="true" />
                        </button>
                      </h2>
                    )}
                    <ul id={panelId} className="rail__list" hidden={!open}>{g.items.map((i) => renderItem(i))}</ul>
                  </section>
                );
              })}
            </>
          )}
        </nav>

        <footer className="rail__foot">
          <div className={cn('rail__ws', collapsed && 'is-stacked')} role="group" aria-label="Pindah workspace">
            {(Object.keys(WORKSPACES) as WorkspaceId[]).map((id) => {
              const live = hasSession(id) || isAdmin;
              const name = id === 'fathur' ? 'Fathur' : 'Mazet';
              return (
                <button
                  key={id}
                  type="button"
                  disabled={!live}
                  onClick={() => void switchWorkspace(id)}
                  className={cn('rail__ws-btn focus-ring', workspaceId === id && 'is-active')}
                  aria-pressed={workspaceId === id}
                  title={live ? `Buka workspace ${name}` : `${name}: belum login di perangkat ini`}
                >
                  {collapsed ? name[0] : name}
                </button>
              );
            })}
          </div>
          <div className="rail__me">
            {!collapsed && (
              <div className="rail__me-text">
                <div className="rail__me-name">{userName}</div>
                <div className="rail__me-mail">{user?.email}</div>
              </div>
            )}
            <button type="button" onClick={() => void logout()} className="rail__out focus-ring" aria-label="Keluar dari akun" title="Keluar dari akun">
              <LogOut size={15} strokeWidth={1.8} />
            </button>
          </div>
        </footer>
      </div>
    </aside>
  );
}

