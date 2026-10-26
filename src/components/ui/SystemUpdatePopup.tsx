import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Tv,
  Brain,
  CheckSquare,
  Wallet,
  BellRing,
  CheckCircle2,
  ArrowUpRight,
  Layers,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createNotification } from '../../services/notificationService';
import { showSystemNotification, playNotificationSound } from '../../services/systemNotificationService';

export const SYSTEM_RELEASE_VERSION = 'v2.5.0';
const POPUP_SEEN_KEY = `fazet_system_update_popup_seen_${SYSTEM_RELEASE_VERSION}`;
const NOTIF_LOGGED_KEY = `fazet_system_update_notif_logged_${SYSTEM_RELEASE_VERSION}`;

export interface ReleaseFeatureItem {
  id: string;
  title: string;
  badge: string;
  desc: string;
  route: string;
  icon: typeof Tv;
}

export const RELEASE_FEATURES_V2_5: ReleaseFeatureItem[] = [
  {
    id: 'mediabox-v2',
    title: 'TimeBox / MediaBox v2 Total Redesign',
    badge: 'BARU • HUD MINIMALIS',
    desc: 'Sistem layar penuh baru dengan Idle Schedule Timeline 3-baris, Auto-hide HUD 5 detik, kontrol Previous/Play/Skip, Navigasi D-Pad Smart TV, & Multi-API Key Rotation.',
    route: '/timebox',
    icon: Tv,
  },
  {
    id: 'smart-notes-ai',
    title: 'Catatan Pintar & AI Studio',
    badge: 'UPGRADE AI',
    desc: 'Template catatan instan (Cornell, Ide & Riset, Jurnal), AI Summarize & Action Items 1-klik, dan ekspor Markdown (.md).',
    route: '/notes',
    icon: Brain,
  },
  {
    id: 'pro-tasks-ai',
    title: 'Manajemen Tugas & AI Prioritizer',
    badge: 'PRODUKTIVITAS',
    desc: 'Rekomendasi urutan prioritas tugas otomatis berbasis AI dan peluncur langsung sesi Fokus 25 menit dari setiap kartu tugas.',
    route: '/tasks',
    icon: CheckSquare,
  },
  {
    id: 'quick-finance',
    title: 'Quick Expense 1-Klik & Habit Tracker',
    badge: 'HARIAN',
    desc: 'Catat pengeluaran harian dalam 1 klik, pantau batas aman anggaran harian, serta widget Target & Kebiasaan Harian minimalis di Dashboard.',
    route: '/finance',
    icon: Wallet,
  },
  {
    id: 'notif-lifecycle',
    title: 'Pop-Up Update Sistem & Auto-Cleanup TKA',
    badge: 'SISTEM OTOMATIS',
    desc: 'Notifikasi pembaruan sistem real-time dan penghapusan otomatis seluruh modul TKA tepat saat memasuki hari Jumat.',
    route: '/notifications',
    icon: BellRing,
  },
];

export function triggerSystemUpdatePopup() {
  window.dispatchEvent(new CustomEvent('fazet:open-system-update-popup'));
}

export default function SystemUpdatePopup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [toastBannerVisible, setToastBannerVisible] = useState(false);

  // Listen for manual trigger from Notifications page or Header
  useEffect(() => {
    const handleOpen = () => {
      setOpen(true);
      setToastBannerVisible(false);
    };
    window.addEventListener('fazet:open-system-update-popup', handleOpen);
    return () => window.removeEventListener('fazet:open-system-update-popup', handleOpen);
  }, []);

  // Automatically trigger notification + minimalist popup once per release version
  useEffect(() => {
    const hasSeenPopup = localStorage.getItem(POPUP_SEEN_KEY) === 'true';
    const hasLoggedNotif = localStorage.getItem(NOTIF_LOGGED_KEY) === 'true';

    const timer = setTimeout(async () => {
      if (!hasSeenPopup) {
        setToastBannerVisible(true);
        playNotificationSound('success');
      }

      if (!hasLoggedNotif && user?.id) {
        localStorage.setItem(NOTIF_LOGGED_KEY, 'true');
        const title = `Pembaruan Sistem FAZET ${SYSTEM_RELEASE_VERSION} Aktif`;
        const message =
          `Sistem telah diupgrade dengan desain minimalis profesional:\n` +
          `• TimeBox / MediaBox v2 HUD + Idle Schedule Timeline & Multi-Key API Rotation\n` +
          `• Smart Notes AI Studio (Template Cornell, Ringkasan AI & Ekspor .md)\n` +
          `• Tugas AI Prioritizer & Habit Tracker Harian Minimalis\n` +
          `• Quick Expense 1-Klik & Pop-Up Info Update Sistem di Pusat Notifikasi`;

        try {
          await createNotification({
            userId: user.id,
            title,
            message,
            type: 'system',
            actionUrl: '/notifications',
          });
          await showSystemNotification(title, message, '/notifications', {
            channelId: 'fazet_default_channel',
            soundType: 'success',
          });
        } catch {
          // Ignore if offline
        }
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [user?.id]);

  const handleDismiss = () => {
    localStorage.setItem(POPUP_SEEN_KEY, 'true');
    setOpen(false);
    setToastBannerVisible(false);
  };

  const handleOpenFullModal = () => {
    localStorage.setItem(POPUP_SEEN_KEY, 'true');
    setToastBannerVisible(false);
    setOpen(true);
  };

  const handleNavigateFeature = (route: string) => {
    localStorage.setItem(POPUP_SEEN_KEY, 'true');
    setOpen(false);
    setToastBannerVisible(false);
    navigate(route);
  };

  return (
    <>
      {/* Minimalist Floating Notification Pill Banner (Top-Right) when new system update arrives */}
      <AnimatePresence>
        {toastBannerVisible && !open && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="fixed top-20 right-4 z-[95] w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-[#0b0f17]/95 backdrop-blur-xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.18)]"
          >
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950">
                <Sparkles size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Update Sistem {SYSTEM_RELEASE_VERSION}
                  </span>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    aria-label="Tutup"
                  >
                    <X size={14} />
                  </button>
                </div>
                <h4 className="mt-0.5 text-xs font-extrabold text-slate-900 dark:text-white">
                  Penambahan Sistem & MediaBox v2 Siap Digunakan
                </h4>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  TimeBox HUD baru, Smart Notes AI, Prioritas Tugas AI, & Habit Tracker minimalis telah ditambahkan.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenFullModal}
                    className="flex-1 rounded-xl bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 cursor-pointer"
                  >
                    Lihat Pembaruan
                  </button>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Mengerti
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimalist Full System Update Modal */}
      <AnimatePresence>
        {open && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md"
            onMouseDown={(e) => {
              if (e.currentTarget === e.target) handleDismiss();
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b0f17] shadow-2xl"
            >
              {/* Minimalist Header */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm">
                    <Layers size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        RELEASE {SYSTEM_RELEASE_VERSION}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={12} /> Aktif & Tersinkronisasi
                      </span>
                    </div>
                    <h2 className="mt-1 text-lg font-black tracking-tight text-slate-900 dark:text-white">
                      Pembaruan Sistem & Fitur Baru FAZET
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
                  aria-label="Tutup"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Feature List */}
              <div className="max-h-[62vh] space-y-2.5 overflow-y-auto p-5 sm:p-6">
                {RELEASE_FEATURES_V2_5.map((feat) => {
                  const Icon = feat.icon;
                  return (
                    <div
                      key={feat.id}
                      onClick={() => handleNavigateFeature(feat.route)}
                      className="group flex cursor-pointer items-start justify-between gap-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 p-3.5 transition-all hover:border-slate-400 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-900"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                          <Icon size={17} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                              {feat.title}
                            </h3>
                            <span className="rounded-md bg-slate-200/80 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                              {feat.badge}
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                            {feat.desc}
                          </p>
                        </div>
                      </div>

                      <div className="mt-1 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-900 dark:group-hover:text-white">
                        <ArrowUpRight size={16} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Minimalist Footer */}
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 px-5 py-3.5 sm:px-6">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Seluruh pembaruan telah tersinkronisasi ke perangkat ini.
                </span>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 cursor-pointer"
                >
                  Selesai & Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
