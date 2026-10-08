import re

with open('src/hooks/usePushNotifications.ts', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace A. Check Tomorrow's Schedule
new_schedule_logic = """
      // A. Check Tomorrow's Schedule and Tasks (Remind at 18:00)
      if (currentHours === 18 && currentMinutes === 0) {
        const lastReminded = localStorage.getItem('last_schedule_reminder');
        const todayStr = now.toISOString().slice(0, 10);
        if (lastReminded !== todayStr) {
          try {
            // Get tomorrow's date string
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().slice(0, 10);
            
            // Fetch tasks for tomorrow
            const { data: tasksData } = await supabase
              .from('tasks')
              .select('title')
              .eq('due_date', tomorrowStr)
              .eq('workspace_id', workspaceId)
              .neq('status', 'completed');
              
            const taskTitles = tasksData?.map((t: any) => t.title) || [];
            let bodyText = 'Persiapkan jadwal dan barang untuk besok ya!';
            if (taskTitles.length > 0) {
                bodyText = `Ada ${taskTitles.length} tugas untuk besok: \\n- ${taskTitles.join('\\n- ')}`;
            } else {
                bodyText = `Tidak ada tugas yang jatuh tempo besok. Tapi jangan lupa cek jadwal pelajaran!`;
            }

            sendNotification('Persiapan Besok! 🎒', {
              body: bodyText,
              tag: 'tomorrow-schedule'
            });
            localStorage.setItem('last_schedule_reminder', todayStr);
          } catch (e) {
            console.error(e);
          }
        }
      }
"""

code = re.sub(r'// A\. Check Tomorrow\'s Schedule.*?// B\. Check Prayer Times', new_schedule_logic.strip() + '\n\n      // B. Check Prayer Times', code, flags=re.DOTALL)


# Replace B. Check Prayer Times inside if(timings) { ... }
full_prayer_block = """
        if (timings) {
          const sholatNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
          for (const sholat of sholatNames) {
            const timeStr = timings[sholat];
            if (!timeStr) continue;
            
            const [hStr, mStr] = timeStr.split(':');
            const prayerTimeInMins = parseInt(hStr) * 60 + parseInt(mStr);
            const currentTimeInMins = currentHours * 60 + currentMinutes;
            
            // Notify 10 minutes before
            if (prayerTimeInMins - currentTimeInMins === 10) {
              const lastNotifiedPrep = localStorage.getItem(`notified_prep_${sholat}_${todayStr}`);
              if (!lastNotifiedPrep) {
                const label = sholat === 'Fajr' ? 'Subuh' : sholat === 'Dhuhr' ? 'Dzuhur' : sholat === 'Asr' ? 'Ashar' : sholat === 'Maghrib' ? 'Maghrib' : 'Isya';
                sendNotification(`Mendekati Waktu ${label} 🕌`, {
                  body: `Waktu sholat ${label} di ${city} kurang 10 menit lagi. Yuk siap-siap!`,
                  tag: `sholat-prep-${sholat}`
                });
                localStorage.setItem(`notified_prep_${sholat}_${todayStr}`, 'true');
              }
            }

            // Notify at exact time
            if (timeStr === currentTimeString) {
              const lastNotified = localStorage.getItem(`notified_${sholat}_${todayStr}`);
              if (!lastNotified) {
                const label = sholat === 'Fajr' ? 'Subuh' : sholat === 'Dhuhr' ? 'Dzuhur' : sholat === 'Asr' ? 'Ashar' : sholat === 'Maghrib' ? 'Maghrib' : 'Isya';
                sendNotification(`Waktu Sholat ${label} 🕌`, {
                  body: `Waktu sholat ${label} untuk wilayah ${city} telah tiba. Mari laksanakan sholat!`,
                  tag: `sholat-${sholat}`
                });
                localStorage.setItem(`notified_${sholat}_${todayStr}`, 'true');
              }
            }
          }
        }
"""

code = re.sub(r'if \(timings\) \{.*?\}\s+\} catch', full_prayer_block.strip() + '\n      } catch', code, flags=re.DOTALL)

with open('src/hooks/usePushNotifications.ts', 'w', encoding='utf-8') as f:
    f.write(code)

print("Patched usePushNotifications.ts")
