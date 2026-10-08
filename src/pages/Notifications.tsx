import { useState, useEffect } from 'react';
import { 
  BellRing, Check, ExternalLink, BellDot, ShieldAlert, X, 
  AlertTriangle, CheckSquare, MessageSquare, AtSign, Focus, 
  Megaphone, Calendar, Trophy, Settings, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useNotifications } from '../hooks/useNotifications';
import { markNotificationRead, markAllNotificationsRead, deleteNotification } from '../services/notificationService';
import { formatDateTime } from '../lib/utils';
import { checkNotificationPermission, requestNotificationPermission } from '../services/systemNotificationService';
import { useAuth } from '../context/AuthContext';
import PullToRefresh from '../components/ui/PullToRefresh';
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
  if (read) return "bg-slate-100 dark:bg-slate-800";
  switch (type) {
    case 'deadline':
    case 'security': return "bg-red-100 dark:bg-red-900/40";
    case 'comment': return "bg-teal-100 dark:bg-teal-900/40";
    case 'mention': return "bg-purple-100 dark:bg-purple-900/40";
    case 'focus': return "bg-indigo-100 dark:bg-indigo-900/40";
    case 'announcement': return "bg-pink-100 dark:bg-pink-900/40";
    case 'calendar': return "bg-orange-100 dark:bg-orange-900/40";
    case 'achievement': return "bg-yellow-100 dark:bg-yellow-900/40";
    case 'system': return "bg-slate-200 dark:bg-slate-700/50";
    default: return "bg-blue-100 dark:bg-blue-900/40";
  }
}

export default function Notifications() {
  const { user } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const nav = useNavigate();
  const [permissionStatus, setPermissionStatus] = useState<string>('granted');
  const [hideBanner, setHideBanner] = useState(false);

  useEffect(() => {
    checkNotificationPermission().then(setPermissionStatus);
  }, []);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionStatus(granted ? 'granted' : 'denied');
  };

  const handleMarkAllRead = async () => {
    if (user) {
      await markAllNotificationsRead(user.id);
    }
  };

  // Helper for staggered list animation
  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, x: -100, transition: { duration: 0.2 } }
  };

  return (
    <PullToRefresh>
      <div className="mx-auto max-w-3xl space-y-6 pb-24">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--tf-border)] pb-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <motion.div 
                whileHover={{ rotate: [0, -15, 15, -15, 15, 0] }}
                transition={{ duration: 0.5 }}
                className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl text-blue-600 dark:text-blue-400 cursor-default"
              >
                <BellRing size={20} />
              </motion.div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Notifikasi</h1>
            </div>
            <motion.p 
              key={unreadCount}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm font-medium text-slate-500 dark:text-slate-400"
            >
              {unreadCount > 0 ? `Anda memiliki ${unreadCount} notifikasi baru.` : 'Semua notifikasi sudah dibaca.'}
            </motion.p>
          </div>
          <div className="flex flex-wrap gap-2">
            {permissionStatus === 'granted' && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="soft" size="sm" icon={<BellRing size={16} />} onClick={() => {
                  import('../services/systemNotificationService').then(({ showSystemNotification }) => {
                    showSystemNotification("Tes Notifikasi", "Halo! Notifikasi sistem Anda berfungsi dengan baik 🎉");
                  });
                }}>
                  Test Push
                </Button>
              </motion.div>
            )}
            {unreadCount > 0 && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm" icon={<Check size={16} />} onClick={handleMarkAllRead}>
                  Tandai semua dibaca
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Permission Banner */}
        <AnimatePresence>
          {permissionStatus !== 'granted' && !hideBanner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0, overflow: 'hidden' }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Card className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-900/50 p-5">
                <button 
                  onClick={() => setHideBanner(true)} 
                  className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X size={16} />
                </button>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1], rotate: [0, -10, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                    className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-2xl text-blue-600 dark:text-blue-400 shrink-0"
                  >
                    <BellDot size={24} />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Aktifkan Notifikasi Sistem</h3>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                      Jangan lewatkan pengingat deadline tugas, jadwal les, dan jadwal sholat. 
                      Izinkan aplikasi untuk mengirim notifikasi push langsung ke perangkat Anda.
                    </p>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      className="w-full sm:w-auto shrink-0 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
                      onClick={handleRequestPermission}
                    >
                      Izinkan Akses
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification List */}
        <Card className="overflow-hidden shadow-sm border-slate-200/60 dark:border-slate-800/60 p-0 bg-transparent sm:bg-white sm:dark:bg-[#0f1219]">
          {notifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="p-12"
            >
              <EmptyState 
                title="Semua tenang dan aman" 
                description="Tarik ke bawah (pull-to-refresh) untuk memuat ulang dan membersihkan cache."
                icon={
                  <motion.div
                    animate={{ rotateY: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <ShieldAlert className="text-slate-300 dark:text-slate-600" size={56} />
                  </motion.div>
                }
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
                {notifications.map((n) => (
                  <motion.div 
                    key={n.id} 
                    layout
                    variants={itemVariants}
                    whileHover={{ x: 6, transition: { duration: 0.2 } }}
                    className={`group flex flex-col sm:flex-row gap-4 p-5 sm:rounded-none rounded-2xl border sm:border-0 border-slate-100 dark:border-slate-800/60 transition-colors relative overflow-hidden ${
                      n.read ? 'bg-white dark:bg-[#0f1219]' : 'bg-blue-50/30 dark:bg-blue-900/20 shadow-[inset_0_0_20px_rgba(59,130,246,0.03)]'
                    }`}
                  >
                    {!n.read && (
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: '100%' }}
                        className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]"
                      />
                    )}

                    <motion.div 
                      whileHover={{ rotate: n.type === 'calendar' ? 15 : n.type === 'achievement' ? [0, -10, 10, -10, 10, 0] : 0, scale: 1.1 }}
                      className={`mt-1 grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition-colors shadow-sm ${getNotificationColorClass(n.type, n.read)}`}
                    >
                      {getNotificationIcon(n.type, n.read)}
                    </motion.div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className={`text-[15px] font-bold ${n.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                          {n.title}
                        </h3>
                      </div>
                      <p className={`text-sm leading-relaxed ${n.read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-600 dark:text-slate-300 font-medium'}`}>
                        {n.message}
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-md">
                          {formatDateTime(n.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col gap-2 shrink-0 mt-3 sm:mt-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      {n.actionUrl && (
                        <motion.div whileTap={{ scale: 0.9 }}>
                          <Button size="sm" variant={n.read ? "ghost" : "primary"} className={`w-full ${!n.read ? "shadow-md shadow-blue-500/20" : ""}`} icon={<ExternalLink size={14} />} onClick={() => nav(n.actionUrl!)}>
                            Buka
                          </Button>
                        </motion.div>
                      )}
                      {!n.read && (
                        <motion.div whileTap={{ scale: 0.9 }}>
                          <Button size="sm" variant="outline" className="w-full" icon={<Check size={14} />} onClick={() => markNotificationRead(n.id)}>
                            Dibaca
                          </Button>
                        </motion.div>
                      )}
                      <motion.div whileTap={{ scale: 0.9 }}>
                        <Button size="sm" variant="ghost" className="w-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30" icon={<Trash2 size={14} />} onClick={() => deleteNotification(n.id)}>
                          Hapus
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </Card>
      </div>
    </PullToRefresh>
  );
}
