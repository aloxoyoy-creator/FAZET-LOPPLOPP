import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

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
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: new Date().getTime(),
            schedule: { at: new Date(Date.now() + 100) }, // in 100ms
            actionTypeId: '',
            extra: { actionUrl }
          }
        ]
      });
    } catch (err) {
      console.error('Error showing local notification', err);
    }
  } else {
    // Web
    try {
      const notification = new Notification(title, {
        body,
        icon: '/pwa-192x192.png' // Pastikan file icon tersedia di public
      });

      if (actionUrl) {
        notification.onclick = () => {
          window.focus();
          // Idealnya kita memanggil navigate, tetapi karena ini ada di luar React context, 
          // ini cukup membokuskan jendela atau menggunakan event.
        };
      }
    } catch (err) {
      console.error('Error showing web notification', err);
    }
  }
}
