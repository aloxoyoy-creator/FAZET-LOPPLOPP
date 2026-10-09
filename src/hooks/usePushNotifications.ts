import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useWorkspace } from '../context/WorkspaceContext';
import { showSystemNotification, scheduleSystemNotification, cancelSystemNotification, requestNotificationPermission } from '../services/systemNotificationService';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

// Generate a consistent ID based on string to avoid duplicates
function generateStringId(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export function usePushNotifications() {
  const { workspaceId } = useWorkspace();
  const schedulingRef = useRef(false);

  useEffect(() => {
    // 1. Request Permission
    void requestNotificationPermission();

    // 2. Realtime Listener for New Tasks
    const tasksSubscription = supabase
      .channel('public:tasks')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tasks' },
        (payload) => {
          const newTask = payload.new;
          if (newTask.workspace_id !== workspaceId) return;

          // Notify immediately for new tasks
          showSystemNotification('Ada Tugas Baru!', `Tugas "${newTask.title}" ditambahkan untuk deadline ${newTask.due_date}. Jangan lupa dikerjakan ya!`);
          
          // Schedule reminder for the task deadline if it has a due time, or at 18:00 the day before
          if (newTask.due_date) {
             const dueDate = new Date(newTask.due_date);
             // Assuming due_date is YYYY-MM-DD
             if (!isNaN(dueDate.getTime())) {
                const reminderDate = new Date(dueDate);
                reminderDate.setDate(reminderDate.getDate() - 1);
                reminderDate.setHours(18, 0, 0, 0); // 6 PM the day before
                
                if (reminderDate > new Date()) {
                   scheduleSystemNotification(
                      'Tugas Besok Deadline!', 
                      `Tugas "${newTask.title}" harus selesai besok.`, 
                      reminderDate,
                      undefined,
                      generateStringId(`task-remind-${newTask.id}`)
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
           if (updatedTask.status === 'completed') {
              // cancel notification
              cancelSystemNotification(generateStringId(`task-remind-${updatedTask.id}`));
           }
        }
      )
      .subscribe();

    // 3. Setup Scheduled Events (Prayers & Daily reminders)
    const setupScheduledEvents = async () => {
      if (schedulingRef.current) return;
      schedulingRef.current = true;

      try {
        if (Capacitor.isNativePlatform()) {
           // Clear pending notifications first to prevent duplicates
           const pending = await LocalNotifications.getPending();
           if (pending.notifications.length > 0) {
              await LocalNotifications.cancel({ notifications: pending.notifications });
           }
        }

        const now = new Date();
        const city = workspaceId === 'fathur' ? 'Tuban' : 'Tasikmalaya';
        
        // Fetch prayers for the next 3 days to ensure device has them if offline tomorrow
        for (let i = 0; i < 3; i++) {
           const date = new Date(now);
           date.setDate(date.getDate() + i);
           
           const dd = String(date.getDate()).padStart(2, '0');
           const mm = String(date.getMonth() + 1).padStart(2, '0');
           const yyyy = date.getFullYear();
           const todayStr = date.toLocaleDateString('en-CA');

           // Schedule Evening Reminder (18:00) for tomorrow's tasks
           const eveningReminder = new Date(date);
           eveningReminder.setHours(18, 0, 0, 0);
           
           if (eveningReminder > now) {
             scheduleSystemNotification(
                'Persiapan Besok!', 
                'Cek jadwal dan tugas untuk besok, siapkan barang-barangmu ya!', 
                eveningReminder, 
                undefined,
                generateStringId(`evening-${todayStr}`)
             );
           }

           // Fetch Prayer Times
           try {
             const cacheKey = `prayer_times_${city}_${todayStr}`;
             let timings: any = null;
             const cached = localStorage.getItem(cacheKey);
             
             if (cached) {
               timings = JSON.parse(cached);
             } else {
               const res = await fetch(`https://api.aladhan.com/v1/timingsByCity/${dd}-${mm}-${yyyy}?city=${city}&country=Indonesia&method=11`);
               const data = await res.json();
               if (data.code === 200) {
                 timings = data.data.timings;
                 localStorage.setItem(cacheKey, JSON.stringify(timings));
               }
             }

             if (timings) {
               const sholatNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
               const labels: Record<string, string> = { Fajr: 'Subuh', Dhuhr: 'Dzuhur', Asr: 'Ashar', Maghrib: 'Maghrib', Isha: 'Isya' };
               
               for (const sholat of sholatNames) {
                 const timeStr = timings[sholat];
                 if (!timeStr) continue;
                 
                 const [hStr, mStr] = timeStr.split(':');
                 const prayerTime = new Date(date);
                 prayerTime.setHours(parseInt(hStr), parseInt(mStr), 0, 0);
                 
                 // Prep notification (10 mins before)
                 const prepTime = new Date(prayerTime);
                 prepTime.setMinutes(prepTime.getMinutes() - 10);
                 
                 if (prepTime > now) {
                    scheduleSystemNotification(
                       `Mendekati Waktu ${labels[sholat]}`,
                       `Waktu sholat ${labels[sholat]} di ${city} kurang 10 menit lagi. Yuk siap-siap!`,
                       prepTime,
                       undefined,
                       generateStringId(`sholat-prep-${sholat}-${todayStr}`)
                    );
                 }
                 
                 // Exact time notification
                 if (prayerTime > now) {
                    scheduleSystemNotification(
                       `Waktu Sholat ${labels[sholat]}`,
                       `Waktu sholat ${labels[sholat]} untuk wilayah ${city} telah tiba. Mari laksanakan sholat!`,
                       prayerTime,
                       undefined,
                       generateStringId(`sholat-exact-${sholat}-${todayStr}`)
                    );
                 }
               }
             }
           } catch (err) {
             console.error(`Failed to fetch prayer for ${todayStr}`, err);
           }
        }
      } catch (err) {
         console.error('Error in setupScheduledEvents', err);
      }
    };

    void setupScheduledEvents();

    return () => {
      supabase.removeChannel(tasksSubscription);
    };
  }, [workspaceId]);
}
