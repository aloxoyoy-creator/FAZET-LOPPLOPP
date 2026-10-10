import { useState, useEffect, useMemo } from 'react';
import { 
  BellRing, Check, ExternalLink, BellDot, ShieldAlert, X, 
  AlertTriangle, CheckSquare, MessageSquare, AtSign, Focus, 
  Megaphone, Calendar, Trophy, Settings, Trash2, Volume2, VolumeX,
  Sparkles, Clock, Compass, BookOpen, Filter, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useNotifications } from '../hooks/useNotifications';
import { 
  markNotificationRead, 
  markAllNotificationsRead, 
  deleteNotification, 
  deleteAllReadNotifications,
  createNotification 
} from '../services/notificationService';
import { formatDateTime } from '../lib/utils';
import { 
  checkNotificationPermission, 
  requestNotificationPermission, 
  showSystemNotification,
  playNotificationSound 
} from '../services/systemNotificationService';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import PullToRefresh from '../components/ui/PullToRefresh';
import ContinuousMotion from '../components/ui/ContinuousMotion';
import { PRAYER_WISDOM } from '../utils/jadwalSholat';
import type { Notification } from '../types';

function getNotificationIcon(type: Notification['type'], read: boolean) {
  const iconProps = { size: 20 };
  switch (type) {
    case 'deadline': return <AlertTriangle {...iconProps} className={read ? "text-red-400" : "text-red-500"} />;
    case 'task': return <CheckSquare {...iconProps} className={read ? "text-blue-400" : "text-blue-500"} />;
    case 'comment': return <MessageSquare {...iconProps} className={read ? "text-teal-400" : "text-teal-500"} />;
    case 'mention': return <AtSign {...iconProps} className={read ? "text-purple-400" : "text-purple-500"} />;
    case 'focus': return <Focus {...iconProps} className={read ? "text-indigo-400" : "text-indigo-500"} />;
    case 'announcement': return <Megaphone {...iconProps} className={read ? "text-pink-400" : "text-pink-500"} />;
    case 'security': return <ShieldAlert {...iconProps} className={read ? "text-red-400" : "text-red-600"} />;
    case 'calendar': return <Calendar {...iconProps} className={read ? "text-orange-400" : "text-orange-500"} />;
    case 'achievement': return <Trophy {...iconProps} className={read ? "text-yellow-400" : "text-yellow-500"} />;
    case 'system': return <Settings {...iconProps} className={read ? "text-slate-400" : "text-slate-500"} />;
    default: return <BellRing {...iconProps} className={read ? "text-slate-400" : "text-blue-500"} />;
  }
}

function getNotificationColorClass(type: Notification['type'], read: boolean) {
  if (read) return "bg-slate-100 dark:bg-slate-800 text-slate-500";
  switch (type) {
    case 'deadline':
    case 'security': return "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300";
    case 'comment': return "bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-300";
    case 'mention': return "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300";
    case 'focus': return "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300";
    case 'announcement': return "bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-300";
    case 'calendar': return "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300";
    case 'achievement': return "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-300";
    case 'system': return "bg-slate-200 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200";
    default: return "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300";
  }
}

type FilterTab = 'all' | 'unread' | 'task' | 'prayer' | 'academic';

export default function Notifications() {
  const { user } = useAuth();
  const { workspaceId } = useWorkspace();
  const { notifications, unreadCount } = useNotifications();
  const nav = useNavigate();
  const [permissionStatus, setPermissionStatus] = useState<string>('granted');
  const [hideBanner, setHideBanner] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('fazet_sound_enabled') !== 'false';
  });
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [testingCategory, setTestingCategory] = useState<string | null>(null);

  useEffect(() => {
    checkNotificationPermission().then(setPermissionStatus);
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('fazet_sound_enabled', String(next));
    if (next) {
      playNotificationSound('success');
    }
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionStatus(granted ? 'granted' : 'denied');
  };

  const handleMarkAllRead = async () => {
    if (user) {
      await markAllNotificationsRead(user.id);
    }
  };

  const handleClearRead = async () => {
    if (user) {
      await deleteAllReadNotifications(user.id);
    }
  };

  // Filtered list
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (activeTab === 'unread') return !item.read;
      if (activeTab === 'task') return item.type === 'task' || item.type === 'deadline';
      if (activeTab === 'prayer') return item.type === 'calendar' || item.title.toLowerCase().includes('sholat') || item.title.toLowerCase().includes('adzan');
      if (activeTab === 'academic') return item.type === 'calendar' || item.type === 'announcement' || item.type === 'focus';
      return true;
    });
  }, [notifications, activeTab]);

  // Interactive Test Dispatchers with Deep Details
  const handleTestPrayerNotification = async () => {
    setTestingCategory('prayer');
    const city = workspaceId === 'fathur' ? 'Tuban' : 'Tasikmalaya';
    const wisdom = PRAYER_WISDOM['Subuh'];
    const title = `🕌 Adzan Subuh (04:15 WIB) • Wilayah ${city}`;
    const body = `${wisdom.exactAdvice}\n${wisdom.hadith}\n📍 Arah Kiblat: 295° barat laut • Ambil air wudhu dan laksanakan shalat!`;

    await showSystemNotification(title, body, '/schedule', {
      channelId: 'fazet_prayer_channel',
      soundType: 'prayer'
    });

    if (user) {
      await createNotification({
        userId: user.id,
        title,
        message: body,
        type: 'calendar',
        actionUrl: '/schedule'
      });
    }
    setTestingCategory(null);
  };

  const handleTestTaskNotification = async () => {
    setTestingCategory('task');
    const title = `📝 Tugas Baru: [Matematika Peminatan] Turunan Fungsi Trigonometri`;
    const body = `📌 Guru: Pak Bambang, M.Pd\n⏰ Deadline: Besok (23:59 WIB)\n⚡ Prioritas: Tinggi 🔥\n💡 Ada 5 soal latihan essay bab 3. Selesaikan lebih awal agar tidak terburu-buru!`;

    await showSystemNotification(title, body, '/tasks', {
      channelId: 'fazet_task_channel',
      soundType: 'task'
    });

    if (user) {
      await createNotification({
        userId: user.id,
        title,
        message: body,
        type: 'deadline',
        actionUrl: '/tasks'
      });
    }
    setTestingCategory(null);
  };

  const handleTestTomorrowAgenda = async () => {
    setTestingCategory('agenda');
    const tomorrowDay = 'Senin';
    const title = `🎒 Agenda & Persiapan Besok (${tomorrowDay})`;
    const body = `Pukul 18:00 WIB. Besok ada 4 mata pelajaran: Fisika, Biologi, B. Indonesia, PJOK.\n⚠️ 1 Tugas jatuh tempo besok: Laporan Praktikum.\n🎒 Siapkan buku & seragam malam ini ya!`;

    await showSystemNotification(title, body, '/', {
      channelId: 'fazet_default_channel',
      soundType: 'reminder'
    });

    if (user) {
      await createNotification({
        userId: user.id,
        title,
        message: body,
        type: 'announcement',
        actionUrl: '/'
      });
    }
    setTestingCategory(null);
  };

  const handleTestFocusComplete = async () => {
    setTestingCategory('focus');
    const title = `🎉 Sesi Fokus 25 Menit Selesai!`;
    const body = `Kerja bagus! Kamu telah menyelesaikan 1 sesi Pomodoro (25 menit). Istirahatkan matamu sejenak 5 menit sebelum lanjut ya.`;

    await showSystemNotification(title, body, '/focus', {
      channelId: 'fazet_default_channel',
      soundType: 'success'
    });

    if (user) {
      await createNotification({
        userId: user.id,
        title,
        message: body,
        type: 'focus',
        actionUrl: '/focus'
      });
    }
    setTestingCategory(null);
  };

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 350, damping: 25 } },
    exit: { opacity: 0, x: -60, transition: { duration: 0.2 } }
  };

  return (
    <PullToRefresh>
      <div className="mx-auto max-w-4xl space-y-6 pb-24">
        {/* Header Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--tf-border)] pb-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ContinuousMotion intensity="high">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-2xl text-blue-600 dark:text-blue-400">
                  <BellRing size={22} />
                </div>
              </ContinuousMotion>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">Pusat Notifikasi</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Informasi detail sholat, tugas, dan agenda akademik</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                soundEnabled 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                  : 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700'
              }`}
              title="Atur suara notifikasi web"
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              <span>{soundEnabled ? 'Suara Aktif' : 'Senyap'}</span>
            </button>

            {unreadCount > 0 && (
              <Button variant="outline" size="sm" icon={<Check size={15} />} onClick={handleMarkAllRead}>
                Tandai semua dibaca
              </Button>
            )}

            {notifications.some(n => n.read) && (
              <Button variant="ghost" size="sm" icon={<Trash2 size={15} />} onClick={handleClearRead}>
                Bersihkan yang dibaca
              </Button>
            )}
          </div>
        </motion.div>

        {/* Permission Request Banner if not granted */}
        <AnimatePresence>
          {permissionStatus !== 'granted' && !hideBanner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, height: 0, overflow: 'hidden' }}
            >
              <Card className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800/50 p-5">
                <button 
                  onClick={() => setHideBanner(true)} 
                  className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={16} />
                </button>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-2xl text-amber-600 dark:text-amber-400 shrink-0">
                    <BellDot size={26} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Izin Notifikasi Sistem Belum Aktif</h3>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                      Agar notifikasi adzan sholat, tugas baru, dan pengingat deadline berbunyi tepat waktu saat aplikasi diminimize atau ditutup, izinkan notifikasi sekarang.
                    </p>
                  </div>
                  <Button 
                    className="w-full sm:w-auto shrink-0 bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20"
                    onClick={handleRequestPermission}
                  >
                    Izinkan Notifikasi HP / Web
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Notification Testing & Playground Card */}
        <Card className="p-5 border-blue-100 dark:border-blue-900/40 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50 dark:from-blue-950/20 dark:via-[#0f1219] dark:to-indigo-950/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm font-black text-slate-900 dark:text-white">Simulator Pengiriman Notifikasi Detail</h2>
            </div>
            <Badge variant="primary" size="sm">Coba Kirim & Dengar</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Klik tombol di bawah ini untuk menguji format detail notifikasi langsung ke bilah status HP / browser kamu:
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <button
              onClick={handleTestPrayerNotification}
              disabled={testingCategory !== null}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/80 dark:bg-amber-950/30 hover:bg-amber-100/80 transition-all text-center group cursor-pointer"
            >
              <Compass size={22} className="text-amber-600 dark:text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black text-amber-900 dark:text-amber-300">🕌 Adzan Sholat</span>
              <span className="text-[10px] text-amber-700/80 dark:text-amber-400/70 mt-0.5">Hadits, Waktu, & Doa</span>
            </button>

            <button
              onClick={handleTestTaskNotification}
              disabled={testingCategory !== null}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/80 dark:bg-blue-950/30 hover:bg-blue-100/80 transition-all text-center group cursor-pointer"
            >
              <CheckSquare size={22} className="text-blue-600 dark:text-blue-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black text-blue-900 dark:text-blue-300">📝 Tugas & Deadline</span>
              <span className="text-[10px] text-blue-700/80 dark:text-blue-400/70 mt-0.5">Mapel, Guru & Tenggat</span>
            </button>

            <button
              onClick={handleTestTomorrowAgenda}
              disabled={testingCategory !== null}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/80 dark:bg-indigo-950/30 hover:bg-indigo-100/80 transition-all text-center group cursor-pointer"
            >
              <BookOpen size={22} className="text-indigo-600 dark:text-indigo-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black text-indigo-900 dark:text-indigo-300">🎒 Agenda Besok (18:00)</span>
              <span className="text-[10px] text-indigo-700/80 dark:text-indigo-400/70 mt-0.5">Checklist Jadwal & Tas</span>
            </button>

            <button
              onClick={handleTestFocusComplete}
              disabled={testingCategory !== null}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/80 dark:bg-emerald-950/30 hover:bg-emerald-100/80 transition-all text-center group cursor-pointer"
            >
              <Focus size={22} className="text-emerald-600 dark:text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black text-emerald-900 dark:text-emerald-300">⏱️ Sesi Fokus</span>
              <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/70 mt-0.5">Pomodoro & Rehat</span>
            </button>
          </div>
        </Card>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70'
            }`}
          >
            <span>Semua</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold">
              {notifications.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('unread')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'unread'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70'
            }`}
          >
            <span>Belum Dibaca</span>
            {unreadCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-extrabold">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('task')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'task'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70'
            }`}
          >
            <CheckSquare size={13} />
            <span>Tugas & Deadline</span>
          </button>

          <button
            onClick={() => setActiveTab('prayer')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'prayer'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70'
            }`}
          >
            <Compass size={13} />
            <span>Sholat & Ibadah</span>
          </button>

          <button
            onClick={() => setActiveTab('academic')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'academic'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70'
            }`}
          >
            <BookOpen size={13} />
            <span>Akademik & Agenda</span>
          </button>
        </div>

        {/* Notifications List */}
        <Card className="overflow-hidden shadow-sm border-slate-200/70 dark:border-slate-800/70 p-0 bg-transparent sm:bg-white sm:dark:bg-[#0f1219]">
          {filteredNotifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center"
            >
              <EmptyState 
                title="Tidak ada notifikasi" 
                description="Semua pengingat telah dibaca atau belum ada notifikasi baru di kategori ini."
                icon={<ShieldAlert className="text-slate-300 dark:text-slate-600" size={50} />}
              />
            </motion.div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="divide-y divide-slate-100 dark:divide-slate-800/60 flex flex-col gap-2 sm:gap-0 sm:block"
            >
              <AnimatePresence>
                {filteredNotifications.map((n) => (
                  <motion.div 
                    key={n.id} 
                    layout
                    variants={itemVariants}
                    className={`group flex flex-col sm:flex-row gap-4 p-5 sm:rounded-none rounded-2xl border sm:border-0 border-slate-100 dark:border-slate-800/60 transition-colors relative overflow-hidden ${
                      n.read ? 'bg-white dark:bg-[#0f1219]' : 'bg-blue-50/40 dark:bg-blue-900/20 shadow-[inset_0_0_20px_rgba(59,130,246,0.03)]'
                    }`}
                  >
                    {!n.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
                    )}

                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-2xl shadow-sm ${getNotificationColorClass(n.type, n.read)}`}>
                        {getNotificationIcon(n.type, n.read)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className={`text-[15px] font-bold leading-snug ${n.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                            {n.title}
                          </h3>
                          {!n.read && (
                            <Badge variant="primary" size="sm">Baru</Badge>
                          )}
                        </div>

                        <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line ${n.read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-200 font-medium'}`}>
                          {n.message}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                          <span className="bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                            {formatDateTime(n.createdAt)}
                          </span>

                          <button 
                            onClick={() => setSelectedNotification(n)}
                            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold hover:underline ml-1"
                          >
                            <Info size={12} /> Detail Info
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row sm:flex-col gap-2 shrink-0 mt-3 sm:mt-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity justify-end">
                      {n.actionUrl && (
                        <Button 
                          size="sm" 
                          variant={n.read ? "ghost" : "primary"} 
                          icon={<ExternalLink size={14} />} 
                          onClick={() => nav(n.actionUrl!)}
                        >
                          Buka
                        </Button>
                      )}
                      {!n.read && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          icon={<Check size={14} />} 
                          onClick={() => markNotificationRead(n.id)}
                        >
                          Dibaca
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40" 
                        icon={<Trash2 size={14} />} 
                        onClick={() => deleteNotification(n.id)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </Card>

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedNotification && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-[#0f1219] rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
              >
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl ${getNotificationColorClass(selectedNotification.type, selectedNotification.read)}`}>
                      {getNotificationIcon(selectedNotification.type, selectedNotification.read)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Detail Notifikasi</h3>
                      <p className="text-xs text-slate-400 capitalize">{selectedNotification.type} notification</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedNotification(null)}
                    className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Judul</span>
                    <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {selectedNotification.title}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pesan Lengkap</span>
                    <div className="text-sm text-slate-700 dark:text-slate-300 mt-0.5 whitespace-pre-line bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                      {selectedNotification.message}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Waktu Diterima</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {formatDateTime(selectedNotification.createdAt)}
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Status Dibaca</span>
                      <span className={`font-bold ${selectedNotification.read ? 'text-slate-500' : 'text-blue-600'}`}>
                        {selectedNotification.read ? 'Sudah Dibaca' : 'Belum Dibaca'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {selectedNotification.actionUrl && (
                    <Button 
                      variant="primary"
                      icon={<ExternalLink size={15} />}
                      onClick={() => {
                        const url = selectedNotification.actionUrl!;
                        setSelectedNotification(null);
                        nav(url);
                      }}
                    >
                      Buka Halaman Terkait
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setSelectedNotification(null)}>
                    Tutup
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PullToRefresh>
  );
}
