import { useState, useEffect } from 'react';
import { 
  BellRing, Check, ExternalLink, BellDot, ShieldAlert, X, 
  AlertTriangle, CheckSquare, MessageSquare, AtSign, Focus, 
  Megaphone, Calendar, Trophy, Settings, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const iconProps = { size: 18 };
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

  return (
    <PullToRefresh>
      <div className="mx-auto max-w-3xl space-y-6 fade-up pb-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--tf-border)] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl text-blue-600 dark:text-blue-400">
                <BellRing size={20} />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Notifikasi</h1>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {unreadCount > 0 ? `Anda memiliki ${unreadCount} notifikasi baru.` : 'Semua notifikasi sudah dibaca.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {permissionStatus === 'granted' && (
              <Button variant="soft" size="sm" icon={<BellRing size={16} />} onClick={() => {
                import('../services/systemNotificationService').then(({ showSystemNotification }) => {
                  showSystemNotification("Tes Notifikasi", "Halo! Notifikasi sistem Anda berfungsi dengan baik 🎉");
                });
              }}>
                Test Push
              </Button>
            )}
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" icon={<Check size={16} />} onClick={handleMarkAllRead}>
                Tandai semua dibaca
              </Button>
            )}
          </div>
        </div>

        {/* Permission Banner */}
        {permissionStatus !== 'granted' && !hideBanner && (
          <Card className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-900/50 p-5">
            <button 
              onClick={() => setHideBanner(true)} 
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={16} />
            </button>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-2xl text-blue-600 dark:text-blue-400 shrink-0">
                <BellDot size={24} className="animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Aktifkan Notifikasi Sistem</h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                  Jangan lewatkan pengingat deadline tugas, jadwal les, dan jadwal sholat. 
                  Izinkan aplikasi untuk mengirim notifikasi push langsung ke perangkat Anda.
                </p>
              </div>
              <Button 
                className="w-full sm:w-auto shrink-0 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
                onClick={handleRequestPermission}
              >
                Izinkan Akses
              </Button>
            </div>
          </Card>
        )}

        {/* Notification List */}
        <Card className="overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60 shadow-sm border-slate-200/60 dark:border-slate-800/60 p-0">
          {notifications.length === 0 ? (
            <div className="p-12">
              <EmptyState 
                title="Semua tenang dan aman" 
                description="Tarik ke bawah (pull-to-refresh) untuk memuat ulang dan membersihkan cache."
                icon={<ShieldAlert className="text-slate-300 dark:text-slate-600" size={56} />}
              />
            </div>
          ) : (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className={`group flex flex-col sm:flex-row gap-4 p-5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30 relative overflow-hidden ${
                  n.read ? 'bg-white dark:bg-[#0f1219]' : 'bg-blue-50/20 dark:bg-blue-900/10'
                }`}
              >
                {!n.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                )}

                <div className={`mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-2xl transition-colors ${getNotificationColorClass(n.type, n.read)}`}>
                  {getNotificationIcon(n.type, n.read)}
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className={`text-sm font-bold ${n.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                      {n.title}
                    </h3>
                  </div>
                  <p className={`text-sm leading-relaxed ${n.read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-600 dark:text-slate-300 font-medium'}`}>
                    {n.message}
                  </p>
                  <div className="mt-2.5 flex items-center gap-3">
                    <div className="text-[11px] font-semibold tracking-wide uppercase text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {formatDateTime(n.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col gap-2 shrink-0 mt-3 sm:mt-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  {n.actionUrl && (
                    <Button size="sm" variant={n.read ? "ghost" : "primary"} className={!n.read ? "shadow-sm" : ""} icon={<ExternalLink size={14} />} onClick={() => nav(n.actionUrl!)}>
                      Buka
                    </Button>
                  )}
                  {!n.read && (
                    <Button size="sm" variant="outline" icon={<Check size={14} />} onClick={() => markNotificationRead(n.id)}>
                      Tandai dibaca
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30" icon={<Trash2 size={14} />} onClick={() => deleteNotification(n.id)}>
                    Hapus
                  </Button>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </PullToRefresh>
  );
}
