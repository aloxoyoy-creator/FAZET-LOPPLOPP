import { EXAM_DAYS_2026, TKA_STAGES_2026, isTkaFeatureActive, type ExamDaySchedule } from '../data/tkaSchedule2026';
import { createNotificationOnce, createNotification } from './notificationService';
import {
  showSystemNotification,
  scheduleSystemNotification,
  cancelSystemNotification,
} from './systemNotificationService';
import { supabase } from '../lib/supabase';

const TKA_SYNC_STORAGE_KEY = 'fazet_tka_sync_state_2026';
const TKA_HISTORY_STORAGE_KEY = 'fazet_tka_history';
const TKA_PURGED_STORAGE_KEY = 'fazet_tka_purged_friday_2026';

export interface TkaSyncStatus {
  syncedAt: string;
  scheduledCount: number;
  inboxSynced: boolean;
  daysSynced: number[];
}

function generateHashId(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function getSavedTkaSyncStatus(): TkaSyncStatus | null {
  if (typeof window === 'undefined' || !isTkaFeatureActive()) return null;
  try {
    const raw = localStorage.getItem(TKA_SYNC_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TkaSyncStatus) : null;
  } catch {
    return null;
  }
}

function saveTkaSyncStatus(status: TkaSyncStatus) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TKA_SYNC_STORAGE_KEY, JSON.stringify(status));
    window.dispatchEvent(new CustomEvent('fazet:tka-synced', { detail: status }));
  } catch {
    // ignore storage errors
  }
}

/**
 * Automatically purges all TKA alarms, local storage states, and inbox notifications
 * when Friday arrives (`!isTkaFeatureActive()`).
 */
export async function purgeExpiredTkaDataAndAlarms(userId?: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    cancelAllTkaAlarms();
    localStorage.removeItem(TKA_SYNC_STORAGE_KEY);
    localStorage.removeItem(TKA_HISTORY_STORAGE_KEY);

    if (userId && localStorage.getItem(TKA_PURGED_STORAGE_KEY) !== '1') {
      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)
        .eq('type', 'tka');
      localStorage.setItem(TKA_PURGED_STORAGE_KEY, '1');
    }
  } catch {
    // ignore cleanup errors
  }
}

export function buildTkaExamNotificationBody(exam: ExamDaySchedule, phaseLabel: string): string {
  const stepsFormatted = exam.steps.map((s) => `• ${s.name}: ${s.dur}`).join('\n');
  return [
    `📅 Hari Ke-${exam.hariKe} (${exam.tanggalFormatted})`,
    `⏰ Jadwal: ${exam.mulaiWib} – ${exam.perkiraanSelesaiWib} WIB (${exam.totalMenit} Menit • Sesi ${exam.sesi})`,
    `📚 Mata Ujian: ${exam.mapel}`,
    `📋 Komponen Sesi:\n${stepsFormatted}`,
    `💡 Tips: ${exam.persiapanTips}`,
    `🔔 Status: ${phaseLabel}`,
  ].join('\n');
}

/**
 * Schedules all multi-stage OS/Web notifications for a single TKA Exam Day:
 * 1. H-1 Evening Briefing (19:00 WIB the day before)
 * 2. Day-of Morning Preparation (05:30 WIB)
 * 3. H-30 Minutes Ready Check (06:30 WIB)
 * 4. H-10 Minutes Login Standby (06:50 WIB)
 * 5. Exact Start Bell (07:00 WIB)
 * 6. Post-Exam Evaluation & Next-Day Prep (perkiraanSelesaiWib)
 */
export function scheduleSingleTkaDayAlarms(exam: ExamDaySchedule, now: Date = new Date()): number {
  let scheduled = 0;
  const actionUrl = '/tka';
  const [startH, startM] = exam.mulaiWib.split('.').map(Number);
  const [endH, endM] = exam.perkiraanSelesaiWib.split('.').map(Number);

  // Compute H-1 Date string
  const examDateObj = new Date(`${exam.tanggal}T07:00:00+07:00`);
  const prevDateObj = new Date(examDateObj.getTime() - 24 * 60 * 60 * 1000);
  const prevDateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(prevDateObj);

  // 1. H-1 Briefing (19:00 WIB malam sebelum ujian)
  const hMinus1Evening = new Date(`${prevDateStr}T19:00:00+07:00`);
  if (hMinus1Evening > now) {
    void scheduleSystemNotification(
      `🎯 Persiapan H-1 TKA Hari Ke-${exam.hariKe}: ${exam.shortTitle}`,
      buildTkaExamNotificationBody(
        exam,
        'Besok Pagi Pukul 07.00 WIB! Siapkan Kartu Peserta & Istirahat Lebih Awal.'
      ),
      hMinus1Evening,
      actionUrl,
      generateHashId(`tka-h1-${exam.hariKe}-${exam.tanggal}`),
      'fazet_tka_channel',
      'tka'
    );
    scheduled++;
  }

  // 2. Hari-H Pagi (05:30 WIB)
  const morningPrep = new Date(`${exam.tanggal}T05:30:00+07:00`);
  if (morningPrep > now) {
    void scheduleSystemNotification(
      `🌅 Pagi Ujian TKA Hari Ke-${exam.hariKe}: ${exam.shortTitle}`,
      buildTkaExamNotificationBody(
        exam,
        'Hari Ini Pukul 07.00 WIB! Jangan lupa sarapan, berdoa, dan cek kelengkapan kartu peserta.'
      ),
      morningPrep,
      actionUrl,
      generateHashId(`tka-morning-${exam.hariKe}-${exam.tanggal}`),
      'fazet_tka_channel',
      'tka'
    );
    scheduled++;
  }

  // 3. H-30 Menit Sebelum Mulai (06:30 WIB)
  const hMinus30 = new Date(`${exam.tanggal}T${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}:00+07:00`);
  hMinus30.setMinutes(hMinus30.getMinutes() - 30);
  if (hMinus30 > now) {
    void scheduleSystemNotification(
      `⏳ 30 Menit Menuju Ujian TKA Hari Ke-${exam.hariKe} (${exam.mulaiWib} WIB)`,
      buildTkaExamNotificationBody(
        exam,
        'Waktu Ujian Kurang 30 Menit! Pastikan sudah berada di lokasi/ruang ujian & tenang.'
      ),
      hMinus30,
      actionUrl,
      generateHashId(`tka-m30-${exam.hariKe}-${exam.tanggal}`),
      'fazet_tka_channel',
      'alert'
    );
    scheduled++;
  }

  // 4. H-10 Menit Persiapan Login CBT (06:50 WIB)
  const hMinus10 = new Date(`${exam.tanggal}T${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}:00+07:00`);
  hMinus10.setMinutes(hMinus10.getMinutes() - 10);
  if (hMinus10 > now) {
    void scheduleSystemNotification(
      `🚨 10 Menit Menuju Kickoff TKA Hari Ke-${exam.hariKe}!`,
      buildTkaExamNotificationBody(
        exam,
        'Bersiap Login Sistem CBT! Baca doa sebelum memulai, fokus, dan teliti.'
      ),
      hMinus10,
      actionUrl,
      generateHashId(`tka-m10-${exam.hariKe}-${exam.tanggal}`),
      'fazet_tka_channel',
      'tka'
    );
    scheduled++;
  }

  // 5. Tepat Waktu Mulai (07:00 WIB)
  const exactStart = new Date(`${exam.tanggal}T${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}:00+07:00`);
  if (exactStart > now) {
    void scheduleSystemNotification(
      `🔥 UJIAN DIMULAI: TKA Hari Ke-${exam.hariKe} (${exam.shortTitle})`,
      buildTkaExamNotificationBody(
        exam,
        `Sesi 1 Dimulai Sekarang (${exam.mulaiWib} - ${exam.perkiraanSelesaiWib} WIB). Bismillah, semoga lancar & meraih skor terbaik!`
      ),
      exactStart,
      actionUrl,
      generateHashId(`tka-start-${exam.hariKe}-${exam.tanggal}`),
      'fazet_tka_channel',
      'tka'
    );
    scheduled++;
  }

  // 6. Selesai Sesi (Evaluasi & Apresiasi)
  const exactEnd = new Date(`${exam.tanggal}T${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00+07:00`);
  if (exactEnd > now) {
    const nextDay = EXAM_DAYS_2026.find((d) => d.hariKe === exam.hariKe + 1);
    const nextInfo = nextDay
      ? `Selanjutnya besok (Hari Ke-${nextDay.hariKe}): ${nextDay.shortTitle} (${nextDay.totalMenit} Menit).`
      : `Seluruh rangkaian 4 Hari Ujian TKA Gelombang 1 telah tuntas! Alhamdulillah! 🎉`;

    void scheduleSystemNotification(
      `✅ Sesi TKA Hari Ke-${exam.hariKe} Selesai! Alhamdulillah`,
      `Selamat! Kamu telah menyelesaikan ujian ${exam.shortTitle} (${exam.totalMenit} menit).\n${nextInfo}\nIstirahat yang cukup dan tetap semangat! ⭐`,
      exactEnd,
      actionUrl,
      generateHashId(`tka-end-${exam.hariKe}-${exam.tanggal}`),
      'fazet_tka_channel',
      'success'
    );
    scheduled++;
  }

  return scheduled;
}

export function cancelAllTkaAlarms() {
  for (const exam of EXAM_DAYS_2026) {
    void cancelSystemNotification(generateHashId(`tka-h1-${exam.hariKe}-${exam.tanggal}`));
    void cancelSystemNotification(generateHashId(`tka-morning-${exam.hariKe}-${exam.tanggal}`));
    void cancelSystemNotification(generateHashId(`tka-m30-${exam.hariKe}-${exam.tanggal}`));
    void cancelSystemNotification(generateHashId(`tka-m10-${exam.hariKe}-${exam.tanggal}`));
    void cancelSystemNotification(generateHashId(`tka-start-${exam.hariKe}-${exam.tanggal}`));
    void cancelSystemNotification(generateHashId(`tka-end-${exam.hariKe}-${exam.tanggal}`));
  }
}

/**
 * Full Synchronization of TKA 2026 Schedule to:
 * 1) OS / Browser Multi-Stage Scheduled Alarms
 * 2) Supabase In-App Notifications Inbox (idempotent, so it never duplicates)
 * 3) Immediate Confirmation Toast / System Notification when triggered manually
 */
export async function syncTkaToNotifications(options: {
  userId?: string;
  workspaceId?: string;
  triggerImmediateConfirmation?: boolean;
  specificDay?: number;
}): Promise<TkaSyncStatus> {
  const now = new Date();
  if (!isTkaFeatureActive(now)) {
    await purgeExpiredTkaDataAndAlarms(options.userId);
    return {
      syncedAt: now.toISOString(),
      scheduledCount: 0,
      inboxSynced: false,
      daysSynced: [],
    };
  }

  const todayWibStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  const daysToSync = options.specificDay
    ? EXAM_DAYS_2026.filter((d) => d.hariKe === options.specificDay)
    : EXAM_DAYS_2026;

  let totalScheduled = 0;
  for (const exam of daysToSync) {
    totalScheduled += scheduleSingleTkaDayAlarms(exam, now);
  }

  let inboxSynced = false;

  // Sync to Supabase Notifications Inbox so the user sees TKA cards in /notifications
  if (options.userId && options.workspaceId !== 'mazet') {
    try {
      // 1. Master Schedule Summary Notification (Idempotent)
      const masterSummaryLines = EXAM_DAYS_2026.map(
        (d) =>
          `• Hari ${d.hariKe} (${d.tanggalFormatted}): ${d.shortTitle} [${d.mulaiWib}-${d.perkiraanSelesaiWib} WIB • ${d.totalMenit} Menit]`
      ).join('\n');

      await createNotificationOnce({
        userId: options.userId,
        title: `🎯 Jadwal Resmi TKA SMA 2026 Tersinkronisasi (Gelombang 1 • Sesi 1)`,
        message: `Seluruh alarm pengingat otomatis (H-1 19:00, Pagi 05:30, H-30m, H-10m, & Kickoff 07:00 WIB) telah diaktifkan:\n\n${masterSummaryLines}\n\n💡 Klik untuk membuka Pusat Komando TKA & Simulasi CBT.`,
        type: 'tka',
        actionUrl: '/tka',
        idempotencyKey: 'tka-2026-master-schedule-sync-v1',
      });

      // 2. Check if today or tomorrow is a TKA Exam Day and create a dedicated high-priority inbox briefing
      for (const exam of daysToSync) {
        const examDateObj = new Date(`${exam.tanggal}T07:00:00+07:00`);
        const prevDateObj = new Date(examDateObj.getTime() - 24 * 60 * 60 * 1000);
        const prevDateStr = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Jakarta',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(prevDateObj);

        if (todayWibStr === prevDateStr || options.specificDay === exam.hariKe) {
          await createNotificationOnce({
            userId: options.userId,
            title: `⚡ Briefing H-1 Ujian TKA Hari Ke-${exam.hariKe}: ${exam.shortTitle}`,
            message: buildTkaExamNotificationBody(
              exam,
              todayWibStr === prevDateStr
                ? 'Ujian dilaksanakan BESOK PAGI pukul 07.00 WIB! Pastikan kartu peserta siap & tidur tepat waktu.'
                : ` Pengingat Terjadwal Aktif untuk ${exam.tanggalFormatted} pukul ${exam.mulaiWib} WIB.`
            ),
            type: 'tka',
            actionUrl: '/tka',
            idempotencyKey: `tka-2026-day-${exam.hariKe}-briefing`,
          });
        } else if (todayWibStr === exam.tanggal) {
          await createNotificationOnce({
            userId: options.userId,
            title: `🔥 HARI INI UJIAN TKA Hari Ke-${exam.hariKe}: ${exam.shortTitle}`,
            message: buildTkaExamNotificationBody(
              exam,
              `Berlangsung Hari Ini (${exam.mulaiWib} – ${exam.perkiraanSelesaiWib} WIB). Semangat & fokus penuh!`
            ),
            type: 'tka',
            actionUrl: '/tka',
            idempotencyKey: `tka-2026-day-${exam.hariKe}-today`,
          });
        }
      }

      // 3. Also sync upcoming crucial TKA stage if applicable
      const crucialStage = TKA_STAGES_2026.find((s) => s.status === 'crucial');
      if (crucialStage) {
        await createNotificationOnce({
          userId: options.userId,
          title: `📌 Tahapan Krusial: ${crucialStage.nama} (${crucialStage.rentangFormatted})`,
          message: `Tahapan ${crucialStage.nama} berlangsung pada ${crucialStage.rentangFormatted}. Semua rincian durasi latihan, tes utama, dan survei karakter/lingkungan belajar telah terhubung ke kalender & alarm perangkat.`,
          type: 'tka',
          actionUrl: '/tka',
          idempotencyKey: `tka-2026-stage-${crucialStage.id}`,
        });
      }

      inboxSynced = true;
    } catch (err) {
      console.warn('[TKA Sync] Failed to upsert Supabase notification inbox:', err);
    }
  }

  // Immediate confirmation push notification if user clicked "Sinkronkan TKA ke Notifikasi"
  if (options.triggerImmediateConfirmation) {
    const targetExam = options.specificDay
      ? EXAM_DAYS_2026.find((d) => d.hariKe === options.specificDay) || EXAM_DAYS_2026[0]
      : EXAM_DAYS_2026[0];

    const title = options.specificDay
      ? `✅ Alarm TKA Hari Ke-${targetExam.hariKe} (${targetExam.shortTitle}) Aktif!`
      : `🎯 Sinkronisasi TKA 2026 ke Notifikasi Berhasil!`;

    const body = options.specificDay
      ? buildTkaExamNotificationBody(
          targetExam,
          `Alarm pengingat otomatis untuk Hari Ke-${targetExam.hariKe} telah disinkronkan ke perangkat & Pusat Notifikasi.`
        )
      : `Seluruh 4 Hari Ujian TKA SMA 2026 (26–29 Okt 2026 • 07.00 WIB) beserta ${totalScheduled} titik alarm otomatis (H-1, 05:30, 06:30, 06:50, & 07:00 WIB) telah aktif!`;

    await showSystemNotification(title, body, '/tka', {
      channelId: 'fazet_tka_channel',
      soundType: 'tka',
      tag: `tka-sync-confirm-${Date.now()}`,
    });
  }

  const status: TkaSyncStatus = {
    syncedAt: new Date().toISOString(),
    scheduledCount: totalScheduled,
    inboxSynced,
    daysSynced: daysToSync.map((d) => d.hariKe),
  };

  saveTkaSyncStatus(status);
  return status;
}

/**
 * Dispatches a real-time notification to both OS/Web and Supabase Inbox when a user completes a TKA Tryout / CBT Simulation
 */
export async function notifyTkaTryoutCompleted(args: {
  userId?: string;
  tryoutName: string;
  score: number;
  correct: number;
  total: number;
  accuracy: number;
  durationMinutes: number;
}) {
  const gradeLabel =
    args.score >= 750
      ? 'Sangat Memuaskan (Top Tier 🏆)'
      : args.score >= 600
      ? 'Kompetitif & Stabil (Siap Tempur ⚡)'
      : 'Perlu Evaluasi Pembahasan 📖';

  const title = `🏆 Hasil Simulasi TKA: Skor IRT ${args.score}/1000`;
  const message = [
    `📝 Paket: ${args.tryoutName}`,
    `🎯 Skor IRT: ${args.score} • Akurasi: ${args.accuracy}% (${args.correct}/${args.total} Benar)`,
    `⏱️ Durasi Pengerjaan: ${args.durationMinutes} Menit`,
    `📊 Evaluasi: ${gradeLabel}`,
    `👉 Buka halaman TKA untuk meninjau pembahasan lengkap setiap soal!`,
  ].join('\n');

  await showSystemNotification(title, message, '/tka', {
    channelId: 'fazet_tka_channel',
    soundType: 'success',
    tag: `tka-tryout-${Date.now()}`,
  });

  if (args.userId) {
    try {
      await createNotification({
        userId: args.userId,
        title,
        message,
        type: 'tka',
        actionUrl: '/tka',
      });
    } catch (err) {
      console.warn('[TKA Tryout Notification] Failed to save to inbox:', err);
    }
  }
}
