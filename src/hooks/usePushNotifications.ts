import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
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
import { getDailySweetGreeting } from '../utils/sweetLoveMessages';
import { loadWorkspaceSchedule } from '../services/workspaceService';
import { syncTkaToNotifications, purgeExpiredTkaDataAndAlarms } from '../services/tkaNotificationService';
import { getExamDayByDate, isTkaFeatureActive } from '../data/tkaSchedule2026';
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
  description?: string | null;
  subject_name?: string | null;
  teacher_name?: string | null;
  due_date?: string | null;
  due_time?: string | null;
  status?: string;
  priority?: string;
  notes?: string | null;
  tags?: string[] | null;
  workspace_id?: string | null;
}

function parseTaskDeadline(dueDateStr?: string | null, dueTimeStr?: string | null): Date | null {
  if (!dueDateStr) return null;
  const time = dueTimeStr ? dueTimeStr.slice(0, 5) : '23:59';
  const date = new Date(`${dueDateStr}T${time}:00+07:00`);
  return isNaN(date.getTime()) ? null : date;
}

function formatIndonesianDeadline(dueDateStr?: string | null, dueTimeStr?: string | null): string {
  if (!dueDateStr) return 'Segera';
  const time = dueTimeStr ? dueTimeStr.slice(0, 5) : '23:59';
  const parts = dueDateStr.split('-').map(Number);
  if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
    const [y, m, d] = parts;
    const dateObj = new Date(y, m - 1, d);
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const dayName = dayNames[dateObj.getDay()] || '';
    const monthName = monthNames[m - 1] || '';
    return `${dayName}, ${d} ${monthName} ${y} • ${time} WIB`;
  }
  return `${dueDateStr} pk ${time} WIB`;
}

function truncateText(str?: string | null, maxLen = 85): string {
  if (!str) return '';
  const clean = str.trim().replace(/\s+/g, ' ');
  return clean.length > maxLen ? `${clean.slice(0, maxLen - 3)}...` : clean;
}

function buildDetailedTaskBody(task: TaskRow, phaseContext: string): string {
  const priority = PRIORITY_LABELS[task.priority || ''] || 'Sedang 📌';
  const deadlineStr = formatIndonesianDeadline(task.due_date, task.due_time);
  const teacher = task.teacher_name ? ` (${task.teacher_name})` : '';
  const desc = truncateText(task.description, 90);
  const notes = truncateText(task.notes, 75);

  let body = `📚 Mapel: ${task.subject_name || 'Umum'}${teacher}\n⚡ Prioritas: ${priority}\n⏰ Batas Waktu: ${deadlineStr}`;

  if (desc) {
    body += `\n📝 Detail: "${desc}"`;
  }
  if (notes) {
    body += `\n💡 Catatan: "${notes}"`;
  }

  body += `\n⏳ Status: ${phaseContext}`;
  body += `\n👉 Sudah selesai? Buka aplikasi dan tandai selesai agar pengingat berhenti! ✅`;
  return body;
}

function scheduleTaskReminders(task: TaskRow) {
  if (!task.id || !task.due_date) return;
  if (task.status === 'completed' || task.status === 'submitted') return;

  const deadline = parseTaskDeadline(task.due_date, task.due_time);
  if (!deadline) return;

  const now = new Date();
  const subjectTag = task.subject_name ? `[${task.subject_name}] ` : '';
  const actionUrl = `/tasks/${task.id}`;
  const timeOnly = task.due_time ? task.due_time.slice(0, 5) : '23:59';

  // 1. H-2 (48 hours before deadline)
  const d2 = new Date(deadline.getTime() - 48 * 60 * 60 * 1000);
  if (d2 > now) {
    void scheduleSystemNotification(
      `⚠️ H-2 Deadline: ${subjectTag}${task.title}`,
      buildDetailedTaskBody(task, 'Tersisa 2 Hari Lagi. Segera cicil pengerjaannya ya!'),
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
      `⏳ H-1 Deadline: ${subjectTag}${task.title}`,
      buildDetailedTaskBody(task, 'Jatuh Tempo BESOK! Pastikan sudah rapi & siap dikumpulkan.'),
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
      `🚨 DEADLINE HARI INI: ${subjectTag}${task.title}`,
      buildDetailedTaskBody(task, 'Batas Waktu HARI INI! Cek kembali kelengkapan tugasmu sebelum berangkat!'),
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
      buildDetailedTaskBody(task, `Tersisa 3 Jam (Batas pk ${timeOnly} WIB)! Selesaikan sentuhan akhir & submit sekarang!`),
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
      `⚡ 1 Jam Terakhir: ${task.title}`,
      buildDetailedTaskBody(task, `Kurang 1 Jam (Batas pk ${timeOnly} WIB)! Segera serahkan tugasmu sekarang!`),
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
      `🚨 PERINGATAN TERAKHIR (30 Menit): ${task.title}`,
      buildDetailedTaskBody(task, `Tenggat Waktu Kurang 30 Menit (pk ${timeOnly} WIB)! Segera kumpulkan sekarang!`),
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
  const { user } = useAuth();
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

          const priorityText = PRIORITY_LABELS[newTask.priority || ''] || 'Sedang 📌';
          const subject = newTask.subject_name ? `[${newTask.subject_name}] ` : '';
          const dueFormatted = formatIndonesianDeadline(newTask.due_date, newTask.due_time);
          const teacher = newTask.teacher_name ? ` • Pengajar: ${newTask.teacher_name}` : '';
          const desc = truncateText(newTask.description, 95);
          const notes = truncateText(newTask.notes, 75);

          let body = `📚 Mapel: ${newTask.subject_name || 'Umum'}${teacher}\n⚡ Prioritas: ${priorityText}\n⏰ Batas Waktu: ${dueFormatted}`;
          if (desc) body += `\n📝 Detail: "${desc}"`;
          if (notes) body += `\n💡 Catatan: "${notes}"`;
          body += `\n👉 Buka aplikasi untuk cek materi & tandai selesai bila sudah tuntas!`;

          // Immediate Detailed Notification
          void showSystemNotification(
            `📝 Tugas Baru: ${subject}${newTask.title}`,
            body,
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
              `Alhamdulillah! Tugas "${updatedTask.title}" (${updatedTask.subject_name || 'Umum'}) telah terkonfirmasi selesai. Semua alarm deadline telah dimatikan. Kerja hebat sayang! ⭐`,
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

    // 3. Setup Scheduled Events (Schedule 2x [18:30 & 05:30], Sweet Caring Greetings, Prayers, Fasting)
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

          // -------------------------------------------------------------
          // A. SWEET CARING GREETINGS (Rotates every day, diverse tones)
          // -------------------------------------------------------------

          // 1. Selamat Pagi (06:15 WIB)
          const morningGreeting = getDailySweetGreeting('goodMorning', targetDate);
          const morningTime = getWIBDateForDay(i, 6, 15, targetDate);
          if (morningTime > now) {
            void scheduleSystemNotification(
              morningGreeting.title,
              morningGreeting.message,
              morningTime,
              '/',
              generateStringId(`sweet-morning-${todayStr}`),
              'fazet_default_channel',
              'reminder'
            );
          }

          // 2. Sarapan / Makan Pagi (07:15 WIB)
          const breakfastGreeting = getDailySweetGreeting('eatMorning', targetDate);
          const breakfastTime = getWIBDateForDay(i, 7, 15, targetDate);
          if (breakfastTime > now) {
            void scheduleSystemNotification(
              breakfastGreeting.title,
              breakfastGreeting.message,
              breakfastTime,
              '/',
              generateStringId(`sweet-breakfast-${todayStr}`),
              'fazet_default_channel',
              'reminder'
            );
          }

          // 3. Selamat Siang (11:45 WIB)
          const middayGreeting = getDailySweetGreeting('goodAfternoon', targetDate);
          const middayTime = getWIBDateForDay(i, 11, 45, targetDate);
          if (middayTime > now) {
            void scheduleSystemNotification(
              middayGreeting.title,
              middayGreeting.message,
              middayTime,
              '/',
              generateStringId(`sweet-midday-${todayStr}`),
              'fazet_default_channel',
              'reminder'
            );
          }

          // 4. Makan Siang & Istirahat (12:45 WIB)
          const lunchGreeting = getDailySweetGreeting('eatAfternoon', targetDate);
          const lunchTime = getWIBDateForDay(i, 12, 45, targetDate);
          if (lunchTime > now) {
            void scheduleSystemNotification(
              lunchGreeting.title,
              lunchGreeting.message,
              lunchTime,
              '/',
              generateStringId(`sweet-lunch-${todayStr}`),
              'fazet_default_channel',
              'reminder'
            );
          }

          // 5. Perhatian Sore / Selamat Sore (16:00 WIB)
          const afternoonGreeting = getDailySweetGreeting('afternoonCare', targetDate);
          const afternoonTime = getWIBDateForDay(i, 16, 0, targetDate);
          if (afternoonTime > now) {
            void scheduleSystemNotification(
              afternoonGreeting.title,
              afternoonGreeting.message,
              afternoonTime,
              '/',
              generateStringId(`sweet-afternoon-${todayStr}`),
              'fazet_default_channel',
              'reminder'
            );
          }

          // 6. Makan Malam (19:30 WIB)
          const dinnerGreeting = getDailySweetGreeting('eatEvening', targetDate);
          const dinnerTime = getWIBDateForDay(i, 19, 30, targetDate);
          if (dinnerTime > now) {
            void scheduleSystemNotification(
              dinnerGreeting.title,
              dinnerGreeting.message,
              dinnerTime,
              '/',
              generateStringId(`sweet-dinner-${todayStr}`),
              'fazet_default_channel',
              'reminder'
            );
          }

          // 7. Good Night & Selamat Malam (21:45 WIB)
          const nightGreeting = getDailySweetGreeting('goodNight', targetDate);
          const nightTime = getWIBDateForDay(i, 21, 45, targetDate);
          if (nightTime > now) {
            void scheduleSystemNotification(
              nightGreeting.title,
              nightGreeting.message,
              nightTime,
              '/',
              generateStringId(`sweet-night-${todayStr}`),
              'fazet_default_channel',
              'reminder'
            );
          }

          // -------------------------------------------------------------
          // B. JADWAL PELAJARAN (2X: 18:30 MALAM SEBELUM & 05:30 PAGI HARI H)
          // Minimalis, langsung tanpa detail jam berapanya!
          // -------------------------------------------------------------
          try {
            const scheduleItems = await loadWorkspaceSchedule(workspaceId);

            // 1) Jam 05:30 WIB - Pagi hari H pelajarannya (Hari Ini)
            const morningScheduleTime = getWIBDateForDay(i, 5, 30, targetDate);
            if (morningScheduleTime > now) {
              const todayClasses = scheduleItems.filter(s => s.active && s.day === dayNameIndo);
              let morningTitle = '';
              let morningBody = '';

              if (workspaceId === 'mazet') {
                morningTitle = `🎓 Jadwal Kuliah Hari Ini (${dayNameIndo})`;
                if (todayClasses.length > 0) {
                  const listText = todayClasses
                    .map(c => `• ${c.subject}${c.location ? ` (${c.location})` : ''}`)
                    .join('\n');
                  morningBody = `${listText}\n\nSemangat kuliahnya hari ini cintaku tersayang! 🌟`;
                } else {
                  morningBody = `Hari ini tidak ada perkuliahan. Selamat beristirahat atau belajar santai ya manis! 🍃`;
                }
              } else {
                const todayTka = getExamDayByDate(todayStr);
                morningTitle = todayTka
                  ? `🎯 HARI UJIAN TKA Ke-${todayTka.hariKe} & Jadwal (${dayNameIndo})`
                  : `📚 Jadwal Pelajaran Hari Ini (${dayNameIndo})`;
                const tkaPrefix = todayTka
                  ? `🔥 UJIAN TKA (${todayTka.mulaiWib}-${todayTka.perkiraanSelesaiWib} WIB): ${todayTka.shortTitle} (${todayTka.totalMenit} Menit)\n\n`
                  : '';
                if (todayClasses.length > 0) {
                  const listText = todayClasses
                    .map(c => `• ${c.subject}`)
                    .join('\n');
                  morningBody = `${tkaPrefix}${listText}\n\nFokus dan semangat belajarnya hari ini sayang! 🌟`;
                } else {
                  morningBody = `${tkaPrefix}Hari ini tidak ada jadwal kelas reguler. Fokus penuh dan semangat ya sayang! 🌟`;
                }
              }

              void scheduleSystemNotification(
                morningTitle,
                morningBody,
                morningScheduleTime,
                '/schedule',
                generateStringId(`schedule-0530-${workspaceId}-${todayStr}`),
                'fazet_default_channel',
                'reminder'
              );
            }

            // 2) Jam 18:30 WIB - Malam sebelum pelajarannya (Jadwal Besok)
            const eveningScheduleTime = getWIBDateForDay(i, 18, 30, targetDate);
            if (eveningScheduleTime > now) {
              const tomorrowDate = new Date(targetDate);
              tomorrowDate.setDate(tomorrowDate.getDate() + 1);
              const tomorrowDateStr = tomorrowDate.toLocaleDateString('en-CA');
              const tomorrowDayName = dayNamesIndo[tomorrowDate.getDay()];
              const tomorrowClasses = scheduleItems.filter(s => s.active && s.day === tomorrowDayName);

              let eveningTitle = '';
              let eveningBody = '';

              if (workspaceId === 'mazet') {
                eveningTitle = `🎓 Jadwal Kuliah Besok (${tomorrowDayName})`;
                if (tomorrowClasses.length > 0) {
                  const listText = tomorrowClasses
                    .map(c => `• ${c.subject}${c.location ? ` (${c.location})` : ''}`)
                    .join('\n');
                  eveningBody = `${listText}\n\nSiapkan materi & laptop malam ini ya manisku! ✨`;
                } else {
                  eveningBody = `Besok tidak ada jadwal perkuliahan (libur). Selamat beristirahat ya cintaku! 🍃`;
                }
              } else {
                const tomorrowTka = getExamDayByDate(tomorrowDateStr);
                eveningTitle = tomorrowTka
                  ? `🎯 Besok Ujian TKA Hari Ke-${tomorrowTka.hariKe} & Jadwal (${tomorrowDayName})`
                  : `📚 Jadwal Pelajaran Besok (${tomorrowDayName})`;
                const tkaPrefix = tomorrowTka
                  ? `⚡ UJIAN TKA BESOK (${tomorrowTka.mulaiWib}-${tomorrowTka.perkiraanSelesaiWib} WIB):\n• ${tomorrowTka.mapel} (${tomorrowTka.totalMenit} Menit)\n\n`
                  : '';
                if (tomorrowClasses.length > 0) {
                  const listText = tomorrowClasses
                    .map(c => `• ${c.subject}`)
                    .join('\n');
                  eveningBody = `${tkaPrefix}Jadwal Sekolah:\n${listText}\n\nSiapkan kartu peserta, buku & perlengkapan malam ini ya sayang! ✨`;
                } else {
                  eveningBody = `${tkaPrefix}Besok tidak ada jadwal pelajaran reguler. Istirahat lebih awal malam ini ya sayang! ✨`;
                }
              }

              void scheduleSystemNotification(
                eveningTitle,
                eveningBody,
                eveningScheduleTime,
                '/schedule',
                generateStringId(`schedule-1830-${workspaceId}-${todayStr}`),
                'fazet_default_channel',
                'reminder'
              );
            }
          } catch (err) {
            console.warn('Failed to load schedule for notifications:', err);
          }

          // -------------------------------------------------------------
          // C. Prayer Times & Fasting (Sahur & Iftar)
          // -------------------------------------------------------------
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
                  const sahurGreeting = getDailySweetGreeting('sahur', targetDate);
                  void scheduleSystemNotification(
                    sahurGreeting.title,
                    sahurGreeting.message,
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
                  const iftarGreeting = getDailySweetGreeting('iftar', targetDate);
                  void scheduleSystemNotification(
                    iftarGreeting.title,
                    iftarGreeting.message,
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

        // -------------------------------------------------------------
        // D. Pre-schedule all active uncompleted tasks in DB for current workspace
        // -------------------------------------------------------------
        try {
          const { data: activeTasks, error: taskErr } = await supabase
            .from('tasks')
            .select('id, title, description, subject_name, teacher_name, due_date, due_time, status, priority, notes, tags')
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

        // -------------------------------------------------------------
        // E. Automatic Synchronization or Friday Purge of TKA SMA 2026 Schedule
        // -------------------------------------------------------------
        if (!isTkaFeatureActive()) {
          await purgeExpiredTkaDataAndAlarms(user?.id);
        } else if (workspaceId !== 'mazet') {
          try {
            await syncTkaToNotifications({
              userId: user?.id,
              workspaceId,
              triggerImmediateConfirmation: false,
            });
          } catch (tkaErr) {
            console.warn('Failed to auto-sync TKA schedule to notifications:', tkaErr);
          }
        }
      } catch (err) {
        console.error('[Notification Scheduler] Failed:', err);
      }
    };

    void setupScheduledEvents();

    return () => {
      supabase.removeChannel(tasksSubscription);
    };
  }, [workspaceId, lifestyle, user?.id]);
}
