import { useAppConfig } from '../../context/AppConfigContext';
import {
  Award,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Settings,
  Sparkles,
  Target,
  UserRound,
  StickyNote,
  Timer,
  BarChart3,
  Search,
  Bell,
  ShieldAlert,
  Clock3,
  Tv,
  IdCard,
  Wallet,
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isTkaFeatureActive } from '../../data/tkaSchedule2026';

const primary = [
  { to: '/', label: 'Beranda', icon: Sparkles },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
  { to: '/tasks', label: 'Tugas', icon: ClipboardList },
  { to: '/schedule', label: 'Jadwal', icon: CalendarClock },
  { to: '/tka', label: 'TKA', icon: Target },
] as const;

const more = [
  { to: '/tka', label: 'TKA & Simulasi SNBT', icon: Target },
  { to: '/raport', label: 'Nilai Rapot', icon: Award },
  { to: '/ai', label: 'FAZET AI', icon: Sparkles },
  { to: '/finance', label: 'Keuangan', icon: Wallet },
  { to: '/my-minee', label: 'My Minee', icon: Heart },
  { to: '/lifestyle', label: 'Lifestyle', icon: Heart },
  { to: '/tutoring', label: 'Jadwal Les', icon: GraduationCap },
  { to: '/calendar', label: 'Timeline', icon: CalendarDays },
  { to: '/notes', label: 'Catatan', icon: StickyNote },
  { to: '/focus', label: 'Focus Mode', icon: Timer },
  { to: '/insights', label: 'Insights', icon: BarChart3 },
  { to: '/timebox', label: 'TimeBox', icon: Clock3 },
  { to: '/mediabox', label: 'MediaBox', icon: Tv },
  { to: '/search', label: 'Pencarian', icon: Search },
  { to: '/notifications', label: 'Notifikasi', icon: Bell },
  { to: '/activity', label: 'Aktivitas', icon: ShieldAlert },
  { to: '/profile', label: 'Profil', icon: UserRound },
  { to: '/settings', label: 'Pengaturan', icon: Settings },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { isPathEnabled } = useAppConfig();
  const tkaActive = isTkaFeatureActive();
  const extra = (
    isAdmin
      ? [
          ...more,
          { to: '/admin', label: 'Admin Center', icon: Settings },
          { to: '/admin/control', label: 'Kontrol Aplikasi', icon: Settings },
          { to: '/admin/token', label: 'Token Akses', icon: Settings },
          { to: '/admin/digital-cards', label: 'Kartu Digital', icon: IdCard },
        ]
      : more
  ).filter((i) => isPathEnabled(i.to) && (tkaActive || i.to !== '/tka'));

  const isMoreActive = extra.some(
    (item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
  );

  return (
    <>
      <nav className="mobile-nav safe-bottom" aria-label="Navigasi utama seluler">
        {primary
          .filter((i) => isPathEnabled(i.to) && (tkaActive || i.to !== '/tka'))
          .map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `mobile-nav__item ${isActive ? 'is-active' : ''}`}
            >
              <Icon size={17} strokeWidth={1.75} />
              <span>{label}</span>
            </NavLink>
          ))}
        <button
          type="button"
          className={`mobile-nav__item ${isMoreActive || open ? 'is-active' : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <MoreHorizontal size={18} strokeWidth={1.75} />
          <span>Lainnya</span>
        </button>
      </nav>
      {open && (
        <div
          className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-xs lg:hidden"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setOpen(false);
          }}
        >
          <div className="absolute inset-x-3 bottom-[calc(68px+env(safe-area-inset-bottom))] max-h-[72dvh] overflow-auto rounded-2xl border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] p-4 shadow-2xl flex flex-col gap-4">
            <div>
              <div className="mb-3 px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--tf-text-muted)]">
                Menu &amp; Ruang Pribadi
              </div>
              <div className="grid grid-cols-2 gap-2">
                {extra.map(({ to, label, icon: Icon }) => (
                  <button
                    key={to}
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      navigate(to);
                    }}
                    className="flex items-center gap-3 rounded-xl border border-[var(--tf-border)] bg-[var(--tf-bg-subtle)]/40 px-3 py-2.5 text-left text-xs font-medium text-[var(--tf-text-primary)] hover:border-[var(--tf-accent)]/40 hover:bg-[var(--tf-bg-subtle)] transition-all"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--tf-bg-surface)] border border-[var(--tf-border)] text-[var(--tf-accent)]">
                      <Icon size={15} strokeWidth={1.75} />
                    </span>
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
