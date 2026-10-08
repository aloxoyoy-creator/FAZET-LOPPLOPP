import { useState, useEffect } from 'react';
import { BellRing, Check, ExternalLink, BellDot, ShieldAlert, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useNotifications } from '../hooks/useNotifications';
import { markNotificationRead, markAllNotificationsRead } from '../services/notificationService';
import { formatDateTime } from '../lib/utils';
import { checkNotificationPermission, requestNotificationPermission } from '../services/systemNotificationService';
import { useAuth } from '../context/AuthContext';

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
            {unreadCount > 0 ? `Anda memiliki ${unreadCount} notifikasi baru.` : 'Tidak ada notifikasi baru.'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" icon={<Check size={16} />} onClick={handleMarkAllRead}>
            Tandai semua dibaca
          </Button>
        )}
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
          <div className="p-8">
            <EmptyState 
              title="Semua tenang dan aman" 
              description="Notifikasi tentang tugas, pengumuman sistem, dan deadline akan muncul di sini."
              icon={<ShieldAlert className="text-slate-300 dark:text-slate-600" size={48} />}
            />
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id} 
              className={`flex flex-col sm:flex-row gap-4 p-5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30 ${
                n.read ? 'bg-white dark:bg-[#0f1219]' : 'bg-blue-50/40 dark:bg-blue-900/10'
              }`}
            >
              <div className={`mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors ${
                n.read ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
              }`}>
                <BellRing size={18} />
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h3 className={`text-sm font-bold ${n.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                    {n.title}
                  </h3>
                  {!n.read && <Badge tone="blue" size="sm" className="animate-pulse">Baru</Badge>}
                </div>
                <p className={`text-sm leading-relaxed ${n.read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-600 dark:text-slate-300 font-medium'}`}>
                  {n.message}
                </p>
                <div className="mt-2 text-[11px] font-semibold tracking-wide uppercase text-slate-400 dark:text-slate-500">
                  {formatDateTime(n.createdAt)}
                </div>
              </div>

              <div className="flex flex-row sm:flex-col gap-2 shrink-0 mt-3 sm:mt-0">
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
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
