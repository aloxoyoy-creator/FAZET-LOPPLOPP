import { useAppConfig } from '../../context/AppConfigContext';
import { Award, CalendarClock, CalendarDays, ClipboardList, GraduationCap, Heart, MessageCircle, MoreHorizontal, Settings, Sparkles, UserRound, StickyNote, Timer, BarChart3, Search, Bell, ShieldAlert, Clock3, Tv, IdCard } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const primary = [
  { to: '/', label: 'Beranda', icon: Sparkles },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
  { to: '/tasks', label: 'Tugas', icon: ClipboardList },
  { to: '/schedule', label: 'Jadwal', icon: CalendarClock },
] as const;

const more = [
  { to: '/ai', label: 'FAZET AI', icon: Sparkles },
  { to: '/my-minee', label: 'My Minee', icon: Heart },
  { to: '/tutoring', label: 'Jadwal Les', icon: GraduationCap },
  { to: '/raport', label: 'Nilai Rapot', icon: Award },
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
  const extra = (isAdmin ? [...more, { to: '/admin', label: 'Admin Center', icon: Settings }, { to: '/admin/control', label: 'Kontrol Aplikasi', icon: Settings }, { to: '/admin/digital-cards', label: 'Kartu Digital', icon: IdCard }] : more).filter((i) => isPathEnabled(i.to));
  const isMoreActive = extra.some((item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`));

  return <>
    <nav className="mobile-nav safe-bottom" aria-label="Navigasi utama seluler">
      {primary.filter((i) => isPathEnabled(i.to)).map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `mobile-nav__item ${isActive ? 'is-active' : ''}`}><Icon size={18} /><span>{label}</span></NavLink>)}
      <button type="button" className={`mobile-nav__item ${isMoreActive || open ? 'is-active' : ''}`} onClick={() => setOpen((v) => !v)} aria-expanded={open}><MoreHorizontal size={19} /><span>Lainnya</span></button>
    </nav>
    {open && <div className="fixed inset-0 z-[70] bg-slate-950/40 backdrop-blur-sm lg:hidden" onMouseDown={(event) => { if (event.currentTarget === event.target) setOpen(false); }}>
      <div className="absolute inset-x-3 bottom-[calc(68px+env(safe-area-inset-bottom))] max-h-[72dvh] overflow-auto rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-2 px-2 py-1 text-[10px] font-black uppercase tracking-[.18em] text-slate-400">Ruang pribadi</div>
        <div className="grid grid-cols-2 gap-2">
          {extra.map(({ to, label, icon: Icon }) => <button key={to} type="button" onClick={() => { setOpen(false); navigate(to); }} className="flex items-center gap-3 rounded-2xl border border-slate-100 px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300"><Icon size={17} /></span><span>{label}</span></button>)}
        </div>
      </div>
    </div>}
  </>;
}

