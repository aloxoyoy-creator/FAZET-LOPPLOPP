import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAppConfig } from '../context/AppConfigContext';
import {
  showSystemNotification,
  scheduleSystemNotification,
  cancelSystemNotification,
  requestNotificationPermission
} from '../services/systemNotificationService';
import { calculateOfflinePrayerTimes, PRAYER_WISDOM } from '../utils/jadwalSholat';
import { getWIBDateForDay } from '../utils/timeUtils';
import { getRandomMessage } from '../utils/romanticMessages';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

function generateStringId(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

const PRIORITY_LABELS: Record<string, string> = {
  urgent: 'Mendesak 🔥',
  high: 'Tinggi ⚡',
  medium: 'Sedang 📌',
  low: 'Santai 🍃'
};

export function usePushNotifications() {
  const { workspaceId } = useWorkspace();
  const { lifestyle } = useAppConfig();
  const schedulingRef = useRef(false);

  useEffect(() => {
    // 1. Request Permission proactively
    void requestNotificationPermission();

    // 2. Realtime Listener for New Tasks with RICH details
    const tasksSubscription = supabase
      .channel('public:tasks')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tasks' },
        (payload) => {
          const newTask = payload.new;
          if (newTask.workspace_id && newTask.workspace_id !== workspaceId) return;

          const priorityText = PRIORITY_LABELS[newTask.priority] || 'Normal';
          const subject = newTask.subject_name ? `[${newTask.subject_name}] ` : '';
          const dueFormatted = newTask.due_date ? `${newTask.due_date}${newTask.due_time ? ` pk ${newTask.due_time}` : ''}` : 'Belum ditentukan';

          // Immediate Detailed Notification
          void showSystemNotification(
            `📝 Tugas Baru: ${subject}${newTask.title}`,
            `📌 Mapel: ${newTask.subject_name || 'Umum'} • Prioritas: ${priorityText}\n⏰ Deadline: ${dueFormatted}\n💡 Segera buka detail tugas dan cicil pengerjaannya!`,
            `/tasks/${newTask.id}`,
            {
              channelId: 'fazet_task_channel',
              soundType: 'task',
              tag: `task-${newTask.id}`,
              id: generateStringId(`task-new-${newTask.id}`)
            }
          );

          // Schedule D-1 reminder (at 18:00 WIB the day before)
          if (newTask.due_date) {
            const dueDate = new Date(newTask.due_date);
            if (!isNaN(dueDate.getTime())) {
              // We need D-1 at 18:00 WIB. 
              // We can calculate how many days from now dueDate is.
              // But safer: get UTC time of due date, subtract 1 day, then get 18:00 WIB for that day.
              const dMinus1 = new Date(dueDate);
              dMinus1.setDate(dMinus1.getDate() - 1);
              const reminderDate = getWIBDateForDay(0, 18, 0, dMinus1);

              if (reminderDate > new Date()) {
                void scheduleSystemNotification(
                  `⚠️ H-1 Deadline Tugas: ${newTask.title}`,
                  `Tugas ${subject}jatuh tempo BESOK! Pastikan sudah selesai dan siap dikumpulkan.`,
                  reminderDate,
                  `/tasks/${newTask.id}`,
                  generateStringId(`task-remind-${newTask.id}`),
                  'fazet_task_channel',
                  'alert'
                );
              }

              // Schedule Day-of morning reminder (at 06:30 WIB on the due day)
              const morningReminder = getWIBDateForDay(0, 6, 30, dueDate);
              if (morningReminder > new Date()) {
                void scheduleSystemNotification(
                  `🚨 Batas Pengumpulan Hari Ini: ${newTask.title}`,
                  `Tugas ${subject}tenggat waktunya HARI INI (${newTask.due_time || '23:59'}). Jangan sampai terlewat!`,
                  morningReminder,
                  `/tasks/${newTask.id}`,
                  generateStringId(`task-morning-${newTask.id}`),
                  'fazet_task_channel',
                  'alert'
                );
              }
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tasks' },
        (payload) => {
          const updatedTask = payload.new;
          if (updatedTask.status === 'completed' || updatedTask.status === 'submitted') {
            void cancelSystemNotification(generateStringId(`task-remind-${updatedTask.id}`));
            void cancelSystemNotification(generateStringId(`task-morning-${updatedTask.id}`));
          }
        }
      )
      .subscribe();

    // 3. Setup Scheduled Events (Prayers, Lifestyle, Fasting)
    const setupScheduledEvents = async () => {
      // Force reschedule when lifestyle changes by not returning early here if we already scheduled?
      // Actually we should clear and reschedule if config changes. 
      // But we use a ref. Let's just allow it to run again if it's called.
      try {
        if (Capacitor.isNativePlatform()) {
          const pending = await LocalNotifications.getPending();
          if (pending.notifications.length > 0) {
            await LocalNotifications.cancel({ notifications: pending.notifications });
          }
        }

        const now = new Date();
        const city = workspaceId === 'fathur' ? 'Tuban' : 'Tasikmalaya';

        // Pre-schedule for the next 3 days
        for (let i = 0; i < 3; i++) {
          const targetDate = new Date(now);
          targetDate.setDate(targetDate.getDate() + i);
          const todayStr = targetDate.toLocaleDateString('en-CA');
          
          const dd = String(targetDate.getDate()).padStart(2, '0');
          const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
          const yyyy = targetDate.getFullYear();

          // Evening Briefing (18:00 WIB)
          const eveningReminder = getWIBDateForDay(i, 18, 0);
          if (eveningReminder > now) {
            void scheduleSystemNotification(
              `🎒 Agenda & Persiapan Besok (${city})`,
              `Pukul 18:00 WIB. Saatnya periksa tugas deadline besok dan susun jadwal pelajaranmu. Siapkan tas & perlengkapan malam ini!`,
              eveningReminder,
              '/',
              generateStringId(`evening-${todayStr}`),
              'fazet_default_channel',
              'reminder'
            );
          }

          // ---- ROMANTIC & LIFESTYLE REMINDERS ----
          if (lifestyle?.enableRomanticReminders) {
             // Good Morning (05:30 WIB)
             const gmDate = getWIBDateForDay(i, 5, 30);
             if (gmDate > now) {
                void scheduleSystemNotification(
                  `☀️ Selamat Pagi Sayang`,
                  getRandomMessage('goodMorning'),
                  gmDate,
                  '/',
                  generateStringId(`gm-${todayStr}`),
                  'fazet_default_channel',
                  'reminder'
                );
             }
             
             // Good Night (22:00 WIB)
             const gnDate = getWIBDateForDay(i, 22, 0);
             if (gnDate > now) {
                void scheduleSystemNotification(
                  `🌙 Selamat Malam Sayang`,
                  getRandomMessage('goodNight'),
                  gnDate,
                  '/',
                  generateStringId(`gn-${todayStr}`),
                  'fazet_default_channel',
                  'reminder'
                );
             }

             // Makan Pagi / Sarapan (07:00 WIB) - if not fasting
             if (!lifestyle?.isFasting) {
                 const eatMDate = getWIBDateForDay(i, 7, 0);
                 if (eatMDate > now) {
                    void scheduleSystemNotification(
                      `🍳 Waktunya Sarapan!`,
                      getRandomMessage('eatMorning'),
                      eatMDate,
                      '/',
                      generateStringId(`eat-m-${todayStr}`),
                      'fazet_default_channel',
                      'reminder'
                    );
                 }

                 // Makan Siang (12:30 WIB)
                 const eatADate = getWIBDateForDay(i, 12, 30);
                 if (eatADate > now) {
                    void scheduleSystemNotification(
                      `🍱 Waktunya Makan Siang!`,
                      getRandomMessage('eatAfternoon'),
                      eatADate,
                      '/',
                      generateStringId(`eat-a-${todayStr}`),
                      'fazet_default_channel',
                      'reminder'
                    );
                 }
             }

             // Makan Malam / Dinner (19:30 WIB) - if not fasting (fasting usually eats at Maghrib)
             if (!lifestyle?.isFasting) {
                 const eatEDate = getWIBDateForDay(i, 19, 30);
                 if (eatEDate > now) {
                    void scheduleSystemNotification(
                      `🍛 Waktunya Makan Malam!`,
                      getRandomMessage('eatEvening'),
                      eatEDate,
                      '/',
                      generateStringId(`eat-e-${todayStr}`),
                      'fazet_default_channel',
                      'reminder'
                    );
                 }
             }
          }

          // Prayer times: try online API, fallback to accurate offline calculation
          let timings: Record<string, string> | null = null;
          const cacheKey = `prayer_times_${city}_${todayStr}`;
          const cached = localStorage.getItem(cacheKey);

          if (cached) {
            try {
              timings = JSON.parse(cached);
            } catch {
              timings = null;
            }
          }

          if (!timings) {
            try {
              const res = await fetch(`https://api.aladhan.com/v1/timingsByCity/${dd}-${mm}-${yyyy}?city=${city}&country=Indonesia&method=11`);
              const data = await res.json();
              if (data.code === 200 && data.data?.timings) {
                timings = data.data.timings;
                localStorage.setItem(cacheKey, JSON.stringify(timings));
              }
            } catch {
              // Network offline: calculate using Singapore/Kemenag method locally!
              const offline = calculateOfflinePrayerTimes(city, targetDate);
              timings = {
                Fajr: offline.subuh,
                Dhuhr: offline.dzuhur,
                Asr: offline.ashar,
                Maghrib: offline.maghrib,
                Isha: offline.isya,
                Imsak: offline.imsak
              };
            }
          }

          if (timings) {
            // -- Fasting / Puasa Reminders based on Prayer Times --
            if (lifestyle?.isFasting) {
               // Sahur at Imsak - 45 mins
               if (timings.Imsak) {
                  const [ih, im] = timings.Imsak.split(':').map(Number);
                  const sahurDate = getWIBDateForDay(i, ih, im);
                  sahurDate.setMinutes(sahurDate.getMinutes() - 45); // 45 mins before Imsak

                  if (sahurDate > now) {
                     void scheduleSystemNotification(
                       `🍽️ Waktunya Sahur Sayang!`,
                       getRandomMessage('sahur'),
                       sahurDate,
                       '/',
                       generateStringId(`sahur-${todayStr}`),
                       'fazet_default_channel',
                       'reminder'
                     );
                  }
               }

               // Iftar / Buka Puasa at Maghrib exact
               if (timings.Maghrib) {
                  const [mh, mm_min] = timings.Maghrib.split(':').map(Number);
                  const iftarDate = getWIBDateForDay(i, mh, mm_min);
                  
                  if (iftarDate > now) {
                     void scheduleSystemNotification(
                       `🌅 Waktunya Berbuka Puasa!`,
                       getRandomMessage('iftar'),
                       iftarDate,
                       '/',
                       generateStringId(`iftar-${todayStr}`),
                       'fazet_default_channel',
                       'alert'
                     );
                  }
               }
            }

            const prayers = [
              { key: 'Fajr', label: 'Subuh' },
              { key: 'Dhuhr', label: 'Dzuhur' },
              { key: 'Asr', label: 'Ashar' },
              { key: 'Maghrib', label: 'Maghrib' },
              { key: 'Isha', label: 'Isya' }
            ];

            for (const { key, label } of prayers) {
              const timeStr = timings[key];
              if (!timeStr) continue;

              const [hStr, mStr] = timeStr.split(':');
              const prayerTime = getWIBDateForDay(i, parseInt(hStr, 10), parseInt(mStr, 10));

              const wisdom = PRAYER_WISDOM[label] || {
                prepAdvice: `Waktu ${label} di ${city} kurang 10 menit lagi.`,
                exactAdvice: `Waktu shalat ${label} untuk wilayah ${city} telah tiba. Mari laksanakan sholat!`,
                hadith: 'Tunaikan shalat di awal waktu.'
              };

              // 1. Preparation notification (10 mins before prayer)
              const prepTime = new Date(prayerTime);
              prepTime.setMinutes(prepTime.getMinutes() - 10);

              if (prepTime > now) {
                void scheduleSystemNotification(
                  `⏳ 10 Menit Menuju ${label} (${timeStr} WIB)`,
                  `${wisdom.prepAdvice}\nWilayah: ${city} • Selesaikan aktivitas belajar/tugasmu dan bersiap wudhu.`,
                  prepTime,
                  '/',
                  generateStringId(`sholat-prep-${key}-${todayStr}`),
                  'fazet_prayer_channel',
                  'reminder'
                );
              }

              // 2. Exact Prayer Time Notification
              if (prayerTime > now) {
                void scheduleSystemNotification(
                  `🕌 Adzan ${label} Berkumandang (${timeStr} WIB) • ${city}`,
                  `${wisdom.exactAdvice}\n${wisdom.hadith}`,
                  prayerTime,
                  '/',
                  generateStringId(`sholat-exact-${key}-${todayStr}`),
                  'fazet_prayer_channel',
                  'prayer'
                );
              }
            }
          }
        }
      } catch (err) {
        console.error('[Notification Scheduler] Failed:', err);
      }
    };

    // Whenever workspaceId or lifestyle changes, we recalculate schedules
    void setupScheduledEvents();

    return () => {
      supabase.removeChannel(tasksSubscription);
    };
  }, [workspaceId, lifestyle]); // Dependency array updated to re-run when lifestyle changes
}
