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
      
      // Fix: id in LocalNotifications must be Int32. new Date().getTime() exceeds Int32!
      const safeId = Math.floor(Math.random() * 2147483647);
      
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: safeId,
            schedule: { at: new Date(Date.now() + 500) }, // Schedule 500ms in future
            channelId: 'fazet_default_channel', // Use the channel we created
            actionTypeId: '',
            extra: { actionUrl }
          }
        ]
      });
    } catch (err) {
      console.error('Error showing local notification', err);
      alert("Error (LocalNotification): " + JSON.stringify(err));
    }
  } else {
    // Web
    try {
      // Remove missing icon path to prevent silent failures on some browsers
      const notification = new Notification(title, {
        body,
        icon: '/brand/fazet-icon.png' // Use fallback or let it be undefined if not exist
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
