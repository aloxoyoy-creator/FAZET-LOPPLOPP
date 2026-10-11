import { useEffect } from 'react';
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
import { getRandomSweetMessage } from '../utils/sweetLoveMessages';
import { loadSchedule } from '../services/scheduleService';
import { loadWorkspaceSchedule } from '../services/workspaceService';
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

interface TaskRow {
  id: string;
  title: string;
  subject_name?: string | null;
  due_date?: string | null;
  due_time?: string | null;
  status?: string;
  priority?: string;
  tags?: string[] | null;
  workspace_id?: string | null;
}

function parseTaskDeadline(dueDateStr?: string | null, dueTimeStr?: string | null): Date | null {
  if (!dueDateStr) return null;
  const time = dueTimeStr ? dueTimeStr.slice(0, 5) : '23:59';
  const date = new Date(`${dueDateStr}T${time}:00+07:00`);
  return isNaN(date.getTime()) ? null : date;
}

function formatDeadlineDisplay(dueDateStr?: string | null, dueTimeStr?: string | null): string {
  if (!dueDateStr) return 'Segera';
  const time = dueTimeStr ? dueTimeStr.slice(0, 5) : '23:59';
  return `${dueDateStr} pk ${time} WIB`;
}

function scheduleTaskReminders(task: TaskRow) {
  if (!task.id || !task.due_date) return;
  if (task.status === 'completed' || task.status === 'submitted') return;

  const deadline = parseTaskDeadline(task.due_date, task.due_time);
  if (!deadline) return;

  const now = new Date();
  const subject = task.subject_name ? `[${task.subject_name}] ` : '';
  const dueFormatted = formatDeadlineDisplay(task.due_date, task.due_time);
  const actionUrl = `/tasks/${task.id}`;
  const confirmHint = `\n👉 Apabila sudah selesai, segera konfirmasi di aplikasi agar tidak diingatkan lagi! ✅`;

  // 1. H-2 (48 hours before deadline)
  const d2 = new Date(deadline.getTime() - 48 * 60 * 60 * 1000);
  if (d2 > now) {
    void scheduleSystemNotification(
      `⚠️ H-2 Deadline Tugas: ${task.title}`,
      `Tugas ${subject}jatuh tempo 2 hari lagi (${dueFormatted}). Segera cicil yaa!${confirmHint}`,
      d2,
      actionUrl,
      generateStringId(`task-d2-${task.id}`),
      'fazet_task_channel',
      'reminder'
    );
  }

  // 2. H-1 (Day before deadline at 18:00 WIB)
  const dMinus1 = new Date(deadline);
  dMinus1.setDate(dMinus1.getDate() - 1);
  const d1 = getWIBDateForDay(0, 18, 0, dMinus1);
  if (d1 > now) {
    void scheduleSystemNotification(
      `⏳ H-1 Deadline Tugas: ${task.title}`,
      `Tugas ${subject}jatuh tempo BESOK (${dueFormatted})! Pastikan sudah selesai dan siap dikumpulkan.${confirmHint}`,
      d1,
      actionUrl,
      generateStringId(`task-d1-${task.id}`),
      'fazet_task_channel',
      'alert'
    );
  }

  // 3. Day of deadline at 06:30 WIB
  const dayMorning = getWIBDateForDay(0, 6, 30, deadline);
  if (dayMorning > now) {
    void scheduleSystemNotification(
      `🚨 Batas Pengumpulan Hari Ini: ${task.title}`,
      `Tugas ${subject}tenggat waktunya HARI INI (${dueFormatted}). Jangan sampai terlewat!${confirmHint}`,
      dayMorning,
      actionUrl,
      generateStringId(`task-morning-${task.id}`),
      'fazet_task_channel',
      'alert'
    );
  }

  // 4. H-3 Jam (3 hours before deadline)
  const h3 = new Date(deadline.getTime() - 3 * 60 * 60 * 1000);
  if (h3 > now) {
    void scheduleSystemNotification(
      `🔥 3 Jam Menuju Deadline: ${task.title}`,
      `Tugas ${subject}tersisa 3 jam lagi (${dueFormatted})! Yuk tuntaskan sekarang.${confirmHint}`,
      h3,
      actionUrl,
      generateStringId(`task-h3-${task.id}`),
      'fazet_task_channel',
      'alert'
    );
  }

  // 5. H-1 Jam (1 hour before deadline)
  const h1 = new Date(deadline.getTime() - 60 * 60 * 1000);
  if (h1 > now) {
    void scheduleSystemNotification(
      `⚡ 1 Jam Menuju Deadline: ${task.title}`,
      `Tugas ${subject}tinggal 1 jam lagi (${dueFormatted})! Siapkan untuk submit sekarang!${confirmHint}`,
      h1,
      actionUrl,
      generateStringId(`task-h1-${task.id}`),
      'fazet_task_channel',
      'alert'
    );
  }

  // 6. H-30 Menit (30 minutes before deadline)
  const m30 = new Date(deadline.getTime() - 30 * 60 * 1000);
  if (m30 > now) {
    void scheduleSystemNotification(
      `🚨 DEADLINE MENDEKAT (30 Menit): ${task.title}`,
      `Tenggat waktu ${dueFormatted} kurang 30 menit! Segera kumpulkan sekarang!${confirmHint}`,
      m30,
      actionUrl,
      generateStringId(`task-m30-${task.id}`),
      'fazet_task_channel',
      'alert'
    );
  }
}

function cancelTaskReminders(taskId: string) {
  void cancelSystemNotification(generateStringId(`task-d2-${taskId}`));
  void cancelSystemNotification(generateStringId(`task-d1-${taskId}`));
  void cancelSystemNotification(generateStringId(`task-morning-${taskId}`));
  void cancelSystemNotification(generateStringId(`task-h3-${taskId}`));
  void cancelSystemNotification(generateStringId(`task-h1-${taskId}`));
  void cancelSystemNotification(generateStringId(`task-m30-${taskId}`));
}

export function usePushNotifications() {
  const { workspaceId } = useWorkspace();
  const { lifestyle } = useAppConfig();

  useEffect(() => {
    // 1. Proactively request permission
    void requestNotificationPermission();

    // 2. Realtime Listener for Tasks: INSERT, UPDATE, DELETE
    const tasksSubscription = supabase
      .channel(`public:tasks:${workspaceId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tasks' },
        (payload) => {
          const newTask = payload.new as TaskRow;
          const isMazetTask = (newTask.tags || []).some((tag) => tag === 'workspace:mazet');
          if ((workspaceId === 'mazet') !== isMazetTask) return;

          const priorityText = PRIORITY_LABELS[newTask.priority || ''] || 'Normal';
          const subject = newTask.subject_name ? `[${newTask.subject_name}] ` : '';
          const dueFormatted = formatDeadlineDisplay(newTask.due_date, newTask.due_time);

          // Immediate Detailed Notification
          void showSystemNotification(
            `📝 Tugas Baru: ${subject}${newTask.title}`,
            `📌 Mapel: ${newTask.subject_name || 'Umum'} • Prioritas: ${priorityText}\n⏰ Deadline: ${dueFormatted}\n💡 Segera buka detail tugas dan cicil pengerjaannya!\n👉 Apabila sudah selesai, segera konfirmasi di aplikasi ya!`,
            `/tasks/${newTask.id}`,
            {
              channelId: 'fazet_task_channel',
              soundType: 'task',
              tag: `task-${newTask.id}`,
              id: generateStringId(`task-new-${newTask.id}`)
            }
          );

          // Schedule all multi-stage reminders
          scheduleTaskReminders(newTask);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tasks' },
        (payload) => {
          const updatedTask = payload.new as TaskRow;
          const isMazetTask = (updatedTask.tags || []).some((tag) => tag === 'workspace:mazet');
          if ((workspaceId === 'mazet') !== isMazetTask) return;

          if (updatedTask.status === 'completed' || updatedTask.status === 'submitted') {
            // Cancel all pending reminders for this task!
            cancelTaskReminders(updatedTask.id);

            // Immediate celebratory confirmation notification!
            void showSystemNotification(
              `🎉 Tugas Terkonfirmasi Selesai!`,
              `Alhamdulillah! Tugas "${updatedTask.title}" telah terkonfirmasi selesai. Semua pengingat deadline telah dimatikan. Kerja hebat sayang! ⭐`,
              `/tasks/${updatedTask.id}`,
              {
                channelId: 'fazet_task_channel',
                soundType: 'success',
                tag: `task-completed-${updatedTask.id}`,
                id: generateStringId(`task-completed-${updatedTask.id}`)
              }
            );
          } else {
            // Task details/deadline updated: reschedule reminders
            cancelTaskReminders(updatedTask.id);
            scheduleTaskReminders(updatedTask);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'tasks' },
        (payload) => {
          const oldTask = payload.old as { id: string };
          if (oldTask?.id) {
            cancelTaskReminders(oldTask.id);
          }
        }
      )
      .subscribe();

    // 3. Setup Scheduled Events (Daily 06:00 Schedule Briefing, Sweet Caring Reminders, Prayers, Fasting)
    const setupScheduledEvents = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          const pending = await LocalNotifications.getPending();
          if (pending.notifications.length > 0) {
            await LocalNotifications.cancel({ notifications: pending.notifications });
          }
        }

        const now = new Date();
        const city = workspaceId === 'fathur' ? 'Tuban' : 'Tasikmalaya';
        const dayNamesIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

        // Pre-schedule for the next 3 days
        for (let i = 0; i < 3; i++) {
          const targetDate = new Date(now);
          targetDate.setDate(targetDate.getDate() + i);
          const todayStr = targetDate.toLocaleDateString('en-CA');
          const dayNameIndo = dayNamesIndo[targetDate.getDay()];
          
          const dd = String(targetDate.getDate()).padStart(2, '0');
          const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
          const yyyy = targetDate.getFullYear();

          // A. SWEET LOVE NOTIFICATIONS (Good morning, meals, afternoon care, goodnight)
          // 1. Good Morning (05:30 WIB)
          const morningLoveTime = getWIBDateForDay(i, 5, 30, targetDate);
          if (morningLoveTime > now) {
            void scheduleSystemNotification(
              `🌅 Selamat Pagi Kesayanganku! ❤️`,
              getRandomSweetMessage('goodMorning'),
              morningLoveTime,
              '/',
              generateStringId(`sweet-morning-${todayStr}`),
              'fazet_default_channel',
              'reminder'
            );
          }

          // 2. Sarapan / Makan Pagi (07:00 WIB)
          const breakfastTime = getWIBDateForDay(i, 7, 0, targetDate);
          if (breakfastTime > now) {
            void scheduleSystemNotification(
              `🍳 Jangan Lupa Sarapan Cinta! ☕`,
              getRandomSweetMessage('eatMorning'),
              breakfastTime,
              '/',
              generateStringId(`sweet-breakfast-${todayStr}`),
              'fazet_default_channel',
              'reminder'
            );
          }

          // 3. Makan Siang & Istirahat (12:30 WIB)
          const lunchTime = getWIBDateForDay(i, 12, 30, targetDate);
          if (lunchTime > now) {
            void scheduleSystemNotification(
              `🍱 Rehat & Makan Siang Yuk Sayang! 🥗`,
              getRandomSweetMessage('eatAfternoon'),
              lunchTime,
              '/',
              generateStringId(`sweet-lunch-${todayStr}`),
              'fazet_default_channel',
              'reminder'
            );
          }

          // 4. Perhatian Sore (16:00 WIB)
          const careAfternoonTime = getWIBDateForDay(i, 16, 0, targetDate);
          if (careAfternoonTime > now) {
            void scheduleSystemNotification(
              `🧃 Rehat Sore & Stay Hydrated Sayang! ⛅`,
              getRandomSweetMessage('afternoonCare'),
              careAfternoonTime,
              '/',
              generateStringId(`sweet-care-${todayStr}`),
              'fazet_default_channel',
              'reminder'
            );
          }

          // 5. Makan Malam (19:30 WIB)
          const dinnerTime = getWIBDateForDay(i, 19, 30, targetDate);
          if (dinnerTime > now) {
            void scheduleSystemNotification(
              `🍛 Waktunya Makan Malam Manisku! 🍲`,
              getRandomSweetMessage('eatEvening'),
              dinnerTime,
              '/',
              generateStringId(`sweet-dinner-${todayStr}`),
              'fazet_default_channel',
              'reminder'
            );
          }

          // 6. Good Night & Selamat Tidur (22:00 WIB)
          const nightTime = getWIBDateForDay(i, 22, 0, targetDate);
          if (nightTime > now) {
            void scheduleSystemNotification(
              `🌙 Selamat Tidur Sayangku, Mimpi Indah! 💤❤️`,
              getRandomSweetMessage('goodNight'),
              nightTime,
              '/',
              generateStringId(`sweet-night-${todayStr}`),
              'fazet_default_channel',
              'reminder'
            );
          }

          // B. DAILY SCHEDULE NOTIFICATION AT 06:00 WIB (FOR ALL PROFILES)
          const morningScheduleTime = getWIBDateForDay(i, 6, 0, targetDate);
          if (morningScheduleTime > now) {
            if (workspaceId === 'mazet') {
              try {
                const scheduleItems = await loadWorkspaceSchedule('mazet');
                const todayClasses = scheduleItems.filter(s => s.active && s.day === dayNameIndo);
                let bodyText = '';
                if (todayClasses.length > 0) {
                  const listText = todayClasses
                    .map(c => `• ${c.startTime}-${c.endTime}: ${c.subject}${c.location ? ` (${c.location})` : ''}`)
                    .join('\n');
                  bodyText = `🎓 Jadwal Kuliah Hari Ini (${dayNameIndo}):\n${listText}\n\nSemangat kuliahnya hari ini cintaku tersayang! Semoga diberi kemudahan! ❤️`;
                } else {
                  bodyText = `✨ Hari ${dayNameIndo} ini tidak ada jadwal perkuliahan. Selamat beristirahat atau belajar santai ya manisku! ❤️`;
                }

                void scheduleSystemNotification(
                  `📋 Jadwal Kuliah Mazet (${dayNameIndo} • 06:00 WIB)`,
                  bodyText,
                  morningScheduleTime,
                  '/schedule',
                  generateStringId(`schedule-0600-mazet-${todayStr}`),
                  'fazet_default_channel',
                  'reminder'
                );
              } catch (err) {
                console.warn('Failed to load Mazet schedule for notification:', err);
              }
            } else {
              // Fathur profile
              try {
                const scheduleItems = await loadSchedule();
                const todayClasses = scheduleItems.filter(s => s.active && s.day === dayNameIndo);
                let bodyText = '';
                if (todayClasses.length > 0) {
                  const listText = todayClasses
                    .map(c => `• ${c.startTime}-${c.endTime}: ${c.subject}`)
                    .join('\n');
                  bodyText = `📚 Jadwal Sekolah Hari Ini (${dayNameIndo}):\n${listText}\n\nFokus dan semangat belajarnya hari ini sayang! Jaga kesehatanmu yaa! ❤️`;
                } else {
                  bodyText = `🌟 Hari ${dayNameIndo} ini tidak ada kelas sekolah. Selamat beristirahat atau belajar mandiri ya sayang! ❤️`;
                }

                void scheduleSystemNotification(
                  `📋 Jadwal Sekolah Fathur (${dayNameIndo} • 06:00 WIB)`,
                  bodyText,
                  morningScheduleTime,
                  '/schedule',
                  generateStringId(`schedule-0600-fathur-${todayStr}`),
                  'fazet_default_channel',
                  'reminder'
                );
              } catch (err) {
                console.warn('Failed to load Fathur schedule for notification:', err);
              }
            }
          }

          // C. Evening Briefing (18:00 WIB)
          const eveningReminder = getWIBDateForDay(i, 18, 0, targetDate);
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

          // D. Prayer Times & Fasting (Sahur & Iftar)
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
            // Fasting / Puasa Reminders
            if (lifestyle?.isFasting) {
              if (timings.Imsak) {
                const [ih, im] = timings.Imsak.split(':').map(Number);
                const sahurDate = getWIBDateForDay(i, ih, im, targetDate);
                sahurDate.setMinutes(sahurDate.getMinutes() - 45); // 45 mins before Imsak

                if (sahurDate > now) {
                  void scheduleSystemNotification(
                    `🍽️ Waktunya Sahur Sayang!`,
                    getRandomSweetMessage('sahur'),
                    sahurDate,
                    '/',
                    generateStringId(`sahur-${todayStr}`),
                    'fazet_default_channel',
                    'reminder'
                  );
                }
              }

              if (timings.Maghrib) {
                const [mh, mm_min] = timings.Maghrib.split(':').map(Number);
                const iftarDate = getWIBDateForDay(i, mh, mm_min, targetDate);
                
                if (iftarDate > now) {
                  void scheduleSystemNotification(
                    `🌅 Waktunya Berbuka Puasa!`,
                    getRandomSweetMessage('iftar'),
                    iftarDate,
                    '/',
                    generateStringId(`iftar-${todayStr}`),
                    'fazet_default_channel',
                    'alert'
                  );
                }
              }
            }

            // Five Prayers
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
              const prayerTime = getWIBDateForDay(i, parseInt(hStr, 10), parseInt(mStr, 10), targetDate);

              const wisdom = PRAYER_WISDOM[label] || {
                prepAdvice: `Waktu ${label} di ${city} kurang 10 menit lagi.`,
                exactAdvice: `Waktu shalat ${label} untuk wilayah ${city} telah tiba. Mari laksanakan sholat!`,
                hadith: 'Tunaikan shalat di awal waktu.'
              };

              // 10 mins before prayer
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

              // Exact Prayer Time
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

        // E. Pre-schedule all active uncompleted tasks in DB for current workspace
        try {
          const { data: activeTasks, error: taskErr } = await supabase
            .from('tasks')
            .select('id, title, subject_name, due_date, due_time, status, priority, tags')
            .not('status', 'in', '("completed","submitted")');

          if (!taskErr && activeTasks) {
            for (const task of activeTasks) {
              const isMazetTask = (task.tags || []).some((tag: string) => tag === 'workspace:mazet');
              if ((workspaceId === 'mazet') === isMazetTask) {
                scheduleTaskReminders(task);
              }
            }
          }
        } catch (err) {
          console.warn('Failed to pre-schedule active tasks:', err);
        }
      } catch (err) {
        console.error('[Notification Scheduler] Failed:', err);
      }
    };

    void setupScheduledEvents();

    return () => {
      supabase.removeChannel(tasksSubscription);
    };
  }, [workspaceId, lifestyle]);
}
