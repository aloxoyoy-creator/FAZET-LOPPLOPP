import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

// Web Audio API Synth for high quality notification chimes
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      void audioCtx.resume();
    }
    return audioCtx;
  } catch (e) {
    console.warn('AudioContext not available:', e);
    return null;
  }
}

export type NotificationSoundType = 'prayer' | 'task' | 'reminder' | 'success' | 'alert';

export function playNotificationSound(type: NotificationSoundType = 'reminder') {
  // Check user sound preference
  if (typeof window !== 'undefined' && localStorage.getItem('fazet_sound_enabled') === 'false') {
    return;
  }

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  if (type === 'prayer') {
    // Serene oriental chime / bell arpeggio for prayer call
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.18);

      gain.gain.setValueAtTime(0, now + idx * 0.18);
      gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.18 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.18);
      osc.stop(now + idx * 0.18 + 1.3);
    });
  } else if (type === 'task') {
    // Sharp dual chime for task alert
    const notes = [587.33, 880]; // D5, A5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.12 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.7);
    });
  } else if (type === 'success') {
    // Triumphant cheerful chime
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.9);
    });
  } else if (type === 'alert') {
    // Two-tone warning
    [659.25, 523.25].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);

      gain.gain.setValueAtTime(0, now + idx * 0.15);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.15 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 0.45);
    });
  } else {
    // Default pleasant bell
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(830.61, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.85);
  }
}

// Ensure all dedicated channels exist on Android
let channelsCreated = false;
async function ensureChannelsExist() {
  if (!Capacitor.isNativePlatform() || channelsCreated) return;
  try {
    // 1. Channel Sholat & Ibadah (Highest Priority)
    await LocalNotifications.createChannel({
      id: 'fazet_prayer_channel',
      name: 'Waktu Sholat & Ibadah',
      description: 'Pengingat adzan tepat waktu dan persiapan ibadah 10 menit sebelumnya',
      importance: 5,
      visibility: 1,
      vibration: true,
      lights: true,
      lightColor: '#f59e0b',
    });

    // 2. Channel Tugas & Deadline
    await LocalNotifications.createChannel({
      id: 'fazet_task_channel',
      name: 'Deadline & Tugas Sekolah',
      description: 'Pemberitahuan tugas baru dan pengingat batas waktu pengumpulan tugas',
      importance: 4,
      visibility: 1,
      vibration: true,
      lights: true,
      lightColor: '#3b82f6',
    });

    // 3. Channel Default & Jadwal
    await LocalNotifications.createChannel({
      id: 'fazet_default_channel',
      name: 'Pemberitahuan Sistem & Jadwal',
      description: 'Agenda esok hari, jadwal sekolah/les, dan pengumuman umum',
      importance: 4,
      visibility: 1,
      vibration: true,
      lights: true,
      lightColor: '#6366f1',
    });

    channelsCreated = true;
  } catch (err) {
    console.warn('Failed to create notification channels:', err);
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
    if (!('Notification' in window)) return 'denied';
    return Notification.permission === 'default' ? 'prompt' : Notification.permission;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await LocalNotifications.requestPermissions();
      await ensureChannelsExist();
      return status.display === 'granted';
    } catch (error) {
      console.error('Failed to request capacitor notification permissions', error);
      return false;
    }
  } else {
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

export interface SystemNotificationOptions {
  title: string;
  body: string;
  actionUrl?: string;
  channelId?: 'fazet_prayer_channel' | 'fazet_task_channel' | 'fazet_default_channel';
  soundType?: NotificationSoundType;
  tag?: string;
  id?: number;
}

export async function showSystemNotification(
  title: string,
  body: string,
  actionUrl?: string,
  options?: Partial<SystemNotificationOptions>
) {
  const perm = await checkNotificationPermission();
  if (perm !== 'granted') return;

  const soundType = options?.soundType || (options?.channelId === 'fazet_prayer_channel' ? 'prayer' : options?.channelId === 'fazet_task_channel' ? 'task' : 'reminder');
  playNotificationSound(soundType);

  if (Capacitor.isNativePlatform()) {
    try {
      await ensureChannelsExist();
      const safeId = options?.id || Math.floor(Math.random() * 2147483647);
      const channelId = options?.channelId || 'fazet_default_channel';

      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: safeId,
            channelId,
            extra: { actionUrl: actionUrl || options?.actionUrl },
            actionTypeId: 'OPEN_APP'
          }
        ]
      });
    } catch (err: unknown) {
      console.error('Error showing local notification', err);
    }
  } else {
    // Web Desktop / Mobile Browser Notification
    try {
      const notification = new Notification(title, {
        body,
        icon: '/icon-192-maskable.png',
        badge: '/icon-192-maskable.png',
        tag: options?.tag || `fazet-${Date.now()}`
      });

      if (actionUrl || options?.actionUrl) {
        notification.onclick = () => {
          window.focus();
          window.location.href = actionUrl || options?.actionUrl || '/';
        };
      }
    } catch (err) {
      console.error('Error showing web notification, trying SW fallback', err);
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await registration.showNotification(title, {
            body,
            icon: '/icon-192-maskable.png',
            badge: '/icon-192-maskable.png',
            tag: options?.tag || `fazet-${Date.now()}`,
            data: { actionUrl: actionUrl || options?.actionUrl }
          });
        } catch (swErr) {
          console.error('SW Fallback failed', swErr);
        }
      }
    }
  }
}

export async function scheduleSystemNotification(
  title: string,
  body: string,
  date: Date,
  actionUrl?: string,
  notificationId?: number,
  channelId: 'fazet_prayer_channel' | 'fazet_task_channel' | 'fazet_default_channel' = 'fazet_default_channel',
  soundType: NotificationSoundType = 'reminder'
) {
  const perm = await checkNotificationPermission();
  if (perm !== 'granted') return;

  if (Capacitor.isNativePlatform()) {
    try {
      await ensureChannelsExist();
      const safeId = notificationId || Math.floor(Math.random() * 2147483647);

      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: safeId,
            channelId,
            extra: { actionUrl },
            schedule: { at: date },
            actionTypeId: 'OPEN_APP'
          }
        ]
      });
      console.log(`[Capacitor Notification] Scheduled: "${title}" at ${date.toLocaleString()}`);
    } catch (err) {
      console.error('Error scheduling local notification', err);
    }
  } else {
    // Web fallback using setTimeout if schedule is within 24 hours
    const delay = date.getTime() - Date.now();
    if (delay > 0 && delay < 86400000 * 2) {
      setTimeout(() => {
        void showSystemNotification(title, body, actionUrl, { channelId, soundType, id: notificationId });
      }, delay);
      console.log(`[Web Notification] Scheduled: "${title}" in ${(delay / 60000).toFixed(1)} mins`);
    }
  }
}

export async function cancelSystemNotification(notificationId: number) {
  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
    } catch (err) {
      console.warn('Error cancelling local notification:', err);
    }
  }
}
