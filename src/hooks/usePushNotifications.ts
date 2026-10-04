import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useWorkspace } from '../context/WorkspaceContext';

export function usePushNotifications() {
  const { workspaceId } = useWorkspace();
  const prayerCheckInterval = useRef<number | undefined>(undefined);

  useEffect(() => {
    // 1. Request Permission
    const requestPermission = async () => {
      if (!('Notification' in window)) return;
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    };
    
    void requestPermission();

    // Helper to send notification
    const sendNotification = async (title: string, options?: NotificationOptions) => {
      if (Notification.permission === 'granted') {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          await registration.showNotification(title, {
            icon: '/icon-192-maskable.png',
            badge: '/icon-192-maskable.png',
            ...(options as any)
          });
        } else {
          new Notification(title, options);
        }
      }
    };

    // 2. Realtime Listener for New Tasks
    const tasksSubscription = supabase
      .channel('public:tasks')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tasks' },
        (payload) => {
          const newTask = payload.new;
          // Notify for new tasks
          sendNotification('Ada Tugas Baru! 📝', {
            body: `Tugas "${newTask.title}" ditambahkan untuk deadline ${newTask.due_date}. Jangan lupa dikerjakan ya!`,
            tag: `task-${newTask.id}`
          });
        }
      )
      .subscribe();

    // 3. Prayer Times & Tomorrow Schedule Checker
    const checkScheduledEvents = async () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTimeString = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;

      // A. Check Tomorrow's Schedule (Remind at 20:00)
      if (currentHours === 20 && currentMinutes === 0) {
        const lastReminded = localStorage.getItem('last_schedule_reminder');
        const todayStr = now.toISOString().slice(0, 10);
        if (lastReminded !== todayStr) {
          sendNotification('Persiapan Besok! 🎒', {
            body: `Cek jadwal sekolah dan les untuk besok biar nggak ada yang ketinggalan.`,
            tag: 'tomorrow-schedule'
          });
          localStorage.setItem('last_schedule_reminder', todayStr);
        }
      }

      // B. Check Prayer Times
      try {
        const city = workspaceId === 'fathur' ? 'Tuban' : 'Tasikmalaya';
        const todayStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD local
        const cacheKey = `prayer_times_${city}_${todayStr}`;
        let timings = null;

        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          timings = JSON.parse(cached);
        } else {
          const dd = String(now.getDate()).padStart(2, '0');
          const mm = String(now.getMonth() + 1).padStart(2, '0');
          const yyyy = now.getFullYear();
          const res = await fetch(`https://api.aladhan.com/v1/timingsByCity/${dd}-${mm}-${yyyy}?city=${city}&country=Indonesia&method=11`);
          const data = await res.json();
          if (data.code === 200) {
            timings = data.data.timings;
            localStorage.setItem(cacheKey, JSON.stringify(timings));
          }
        }

        if (timings) {
          const sholatNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
          for (const sholat of sholatNames) {
            const time = timings[sholat];
            if (time === currentTimeString) {
              const lastNotified = localStorage.getItem(`notified_${sholat}_${todayStr}`);
              if (!lastNotified) {
                const label = sholat === 'Fajr' ? 'Subuh' : sholat === 'Dhuhr' ? 'Dzuhur' : sholat === 'Asr' ? 'Ashar' : sholat === 'Maghrib' ? 'Maghrib' : 'Isya';
                sendNotification(`Waktu Sholat ${label} 🕌`, {
                  body: `Waktu sholat ${label} untuk wilayah ${city} telah tiba. Yuk sholat!`,
                  tag: `sholat-${sholat}`
                });
                localStorage.setItem(`notified_${sholat}_${todayStr}`, 'true');
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to check prayer times for notification', err);
      }
    };

    // Run checker every minute
    prayerCheckInterval.current = window.setInterval(checkScheduledEvents, 60000);
    // Run once on mount
    void checkScheduledEvents();

    return () => {
      supabase.removeChannel(tasksSubscription);
      if (prayerCheckInterval.current) {
        clearInterval(prayerCheckInterval.current);
      }
    };
  }, [workspaceId]);
}
