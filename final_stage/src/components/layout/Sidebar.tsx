import type { ComponentType } from 'react';
import { CalendarDays, GraduationCap, Heart, LogOut, MessageCircle, PanelLeftClose, PanelLeftOpen, Settings, ShieldCheck, Sparkles, UserRound, Users, ClipboardList, BookOpen, Megaphone, Activity, FolderOpen, Table2, Clock3, TrendingUp, MonitorPlay, KeyRound, ListChecks, Bell, StickyNote, Timer, BarChart3, Search, Tv, ShieldAlert, IdCard, CalendarClock } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace, WORKSPACES, type WorkspaceId } from '../../context/WorkspaceContext';
import { cn } from '../../lib/utils';

type NavIcon = ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;

type NavEntry = readonly [string, string, NavIcon];

const primary: readonly NavEntry[] = [
  ['/','Beranda',Sparkles],
  ['/chat','Ruang Kita',MessageCircle],
  ['/ai','FAZET AI',Sparkles],
  ['/my-minee','My Minee',Heart],
] as const;

const study: readonly NavEntry[] = [
  ['/schedule','Jadwal Sekolah',CalendarClock],
  ['/tutoring','Jadwal Les',GraduationCap],
  ['/calendar','Academic Timeline',CalendarDays],
  ['/tasks','Tugas',ClipboardList],
  ['/notes','Catatan',StickyNote],
  ['/focus','Focus Mode',Timer],
  ['/insights','Insights',BarChart3],
] as const;

const media: readonly NavEntry[] = [
  ['/timebox','TimeBox',Clock3],
  ['/mediabox','MediaBox & Watch Party',Tv],
] as const;

const account: readonly NavEntry[] = [
  ['/search','Pencarian',Search],
  ['/notifications','Notifikasi',Bell],
  ['/activity','Aktivitas & Perangkat',ShieldAlert],
  ['/profile','Profil',UserRound],
  ['/settings','Pengaturan',Settings],
] as const;

const admin: readonly NavEntry[] = [
  ['/admin','Operations Center',KeyRound],
  ['/admin/users','Users',Users],
  ['/admin/digital-cards','Kartu Digital',IdCard],
  ['/admin/tasks','Tasks',ClipboardList],
  ['/admin/task-workspace','Task Workspace',ListChecks],
  ['/admin/schedule','Schedule',Clock3],
  ['/admin/subjects','Subjects',BookOpen],
  ['/admin/teachers','Teachers',UserRound],
  ['/admin/announcements','Announcements',Megaphone],
  ['/admin/notifications','Notifications',Bell],
  ['/admin/focus-sessions','Focus Sessions',Clock3],
  ['/admin/analytics','Analytics',TrendingUp],
  ['/admin/audit-logs','Audit Logs',ShieldCheck],
  ['/admin/sessions','Sessions & Devices',MonitorPlay],
  ['/admin/broadcast','Broadcast Center',Megaphone],
  ['/admin/storage','Storage Manager',FolderOpen],
  ['/admin/data','Data Workspace',Table2],
  ['/admin/health','System Health',Activity],
  ['/admin/settings','System Settings',Settings],
] as const;

export default function Sidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  const { isAdmin, user, logout } = useAuth();
  const { workspaceId, workspace, switchWorkspace, hasSession } = useWorkspace();
  const showAdmin = isAdmin || user?.app_metadata?.role === 'admin' || user?.user_metadata?.role === 'admin';

  const linkClass = (isActive: boolean) => cn(
    'tf-nav-item focus-ring flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-semibold transition',
    isActive && 'is-active',
    collapsed && 'justify-center px-0',
  );

  const renderLinks = (items: readonly NavEntry[]) => items.map(([to, label, Icon]) => (
    <NavLink key={to} to={to} className={({ isActive }) => linkClass(isActive)} aria-label={label} title={collapsed ? label : undefined}>
      <Icon size={18} strokeWidth={1.9} />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  ));

  return (
    <aside className={cn('fazet-sidebar hidden lg:flex', collapsed ? 'fazet-sidebar--collapsed' : '')}>
      <div className="fazet-sidebar__rail">
        <div className={cn('fazet-sidebar__workspace', collapsed && 'justify-center')}>
          <div className="fazet-workspace-mark" data-workspace={workspaceId}>{workspaceId === 'mazet' ? 'M' : 'F'}</div>
          {!collapsed && <div className="min-w-0"><div className="truncate text-sm font-black" style={{ color: 'var(--tf-ink)' }}>{workspace.name}</div><div className="truncate text-[10px]" style={{ color: 'var(--tf-ink-muted)' }}>{workspace.schoolLabel}</div></div>}
          <button type="button" className="fazet-sidebar-toggle" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Buka menu' : 'Ciutkan menu'}>
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        <nav className="fazet-sidebar__nav" aria-label="Navigasi FAZET">
          {!collapsed && <div className="fazet-sidebar__label">Ruang utama</div>}
          {renderLinks(primary)}
          {!collapsed && <div className="fazet-sidebar__label mt-6">Belajar</div>}
          {renderLinks(study)}
          {!collapsed && <div className="fazet-sidebar__label mt-6">Media</div>}
          {renderLinks(media)}
          {!collapsed && <div className="fazet-sidebar__label mt-6">Akun</div>}
          {renderLinks(account)}

          {showAdmin && (
            <div className="mt-6">
              {!collapsed && <div className="fazet-sidebar__label">Admin</div>}
              <div className="space-y-1.5">{renderLinks(admin)}</div>
            </div>
          )}
        </nav>

        <div className="fazet-sidebar__bottom">
          <div className={cn('fazet-profile-switcher', collapsed && 'justify-center')}>
            <div className="flex min-w-0 items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full" style={{ background: 'var(--tf-accent-soft)', color: 'var(--tf-accent)' }}>
                <Heart size={15} />
              </div>
              {!collapsed && <div className="min-w-0"><div className="truncate text-[11px] font-bold" style={{ color: 'var(--tf-ink)' }}>Fathur ↔ Mazet</div><div className="text-[10px]" style={{ color: 'var(--tf-ink-muted)' }}>dua workspace</div></div>}
            </div>
          </div>

          {!collapsed && <div className="mt-2 grid grid-cols-2 gap-2">
            {(Object.keys(WORKSPACES) as WorkspaceId[]).map((id) => {
              const live = hasSession(id) || isAdmin;
              return <button key={id} type="button" disabled={!live} onClick={() => void switchWorkspace(id)} className={cn('fazet-workspace-switch', workspaceId === id && 'is-active')}>
                <span>{id === 'fathur' ? 'Fathur' : 'Mazet'}</span><small>{live ? 'aktif' : '—'}</small>
              </button>;
            })}
          </div>}

          <button type="button" onClick={() => void logout()} className={cn('fazet-signout', collapsed && 'justify-center')}>
            <LogOut size={16} />{!collapsed && <span>Keluar dari akun</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
