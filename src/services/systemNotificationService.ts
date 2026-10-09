import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

// Helper for Android Channels
let channelCreated = false;
async function ensureChannelExists() {
  if (!Capacitor.isNativePlatform() || channelCreated) return;
  try {
    await LocalNotifications.createChannel({
      id: 'fazet_default_channel',
      name: 'Pemberitahuan Sistem',
      description: 'Notifikasi jadwal, pengumuman, dan tugas',
      importance: 5, // High importance
      visibility: 1, // Public
      vibration: true,
    });
    channelCreated = true;
  } catch (err) {
    console.warn('Failed to create notification channel:', err);
  }
}

export async function checkNotificationPermission(): Promise<string> {
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await LocalNotifications.checkPermissions();
      return status.display;
    } catch (error) {
      console.warn('LocalNotifications checkPermissions error:', error);
      return 'denied';
    }
  } else {
    // Web
    if (!('Notification' in window)) return 'denied';
    return Notification.permission === 'default' ? 'prompt' : Notification.permission;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await LocalNotifications.requestPermissions();
      return status.display === 'granted';
    } catch (error) {
      console.error('Failed to request capacitor notification permissions', error);
      return false;
    }
  } else {
    // Web
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (err) {
      console.error('Failed to request web notification permissions', err);
      return false;
    }
  }
}

export async function showSystemNotification(title: string, body: string, actionUrl?: string) {
  const perm = await checkNotificationPermission();
  if (perm !== 'granted') return;

  if (Capacitor.isNativePlatform()) {
    try {
      await ensureChannelExists();
      
      const safeId = Math.floor(Math.random() * 2147483647);
      
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: safeId,
            channelId: 'fazet_default_channel',
            extra: { actionUrl }
          }
        ]
      });
    } catch (err: any) {
      console.error('Error showing local notification', err);
      // Fallback alert so user knows it failed
      alert("Gagal memunculkan notifikasi HP: " + (err.message || JSON.stringify(err)));
    }
  } else {
    // Web
    try {
      // Remove missing icon path to prevent silent failures on some browsers
      const notification = new Notification(title, {
        body
      });

      if (actionUrl) {
        notification.onclick = () => {
          window.focus();
          window.location.href = actionUrl;
        };
      }
    } catch (err) {
      console.error('Error showing web notification', err);
      try {
        // Fallback for browsers that require Service Worker for notifications (like mobile Chrome)
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, { body });
        });
      } catch (swErr) {
        console.error('SW Fallback failed', swErr);
      }
    }
  }
}

export async function scheduleSystemNotification(title: string, body: string, date: Date, actionUrl?: string, notificationId?: number) {
  const perm = await checkNotificationPermission();
  if (perm !== 'granted') return;

  if (Capacitor.isNativePlatform()) {
    try {
      await ensureChannelExists();
      
      const safeId = notificationId || Math.floor(Math.random() * 2147483647);
      
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: safeId,
            channelId: 'fazet_default_channel',
            extra: { actionUrl },
            schedule: { at: date }
          }
        ]
      });
      console.log(`Scheduled notification "${title}" at ${date.toLocaleString()}`);
    } catch (err: any) {
      console.error('Error scheduling local notification', err);
    }
  } else {
    // Fallback for Web: use setTimeout if the time is within the next 24 hours
    // (Note: this only works if the app remains open!)
    const delay = date.getTime() - Date.now();
    if (delay > 0) {
      console.log(`Scheduled web notification "${title}" for ${delay}ms from now`);
      setTimeout(() => {
        showSystemNotification(title, body, actionUrl);
      }, delay);
    }
  }
}

export async function cancelSystemNotification(notificationId: number) {
  if (Capacitor.isNativePlatform()) {
    await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
  }
}
