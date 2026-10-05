import { supabase } from '../lib/supabase';
import bundledSchedule from '../data/fathurTutoringSchedule.json';

export type TutoringScheduleItem = {
  id: string;
  workspaceId: 'fathur';
  className: string;
  weekNumber: number;
  dayName: string;
  scheduleDate: string;
  dayStatus: string;
  startTimeLabel: string;
  subjectCode: string;
  subjectName: string;
  activityType: string;
  source: 'supabase' | 'bundled-json';
};

type BundledSchedule = {
  metadata: {
    kelas: string;
    periode: string;
    catatan_penting?: string;
  };
  data_jadwal: Array<{
    minggu_ke: number;
    hari: string;
    tanggal: string;
    status: string;
    kegiatan: Array<{
      waktu: string;
      kode_mata_pelajaran: string;
      nama_mata_pelajaran: string;
      jenis_kegiatan: string;
    }>;
  }>;
};

function mapRow(row: Record<string, unknown>): TutoringScheduleItem {
  return {
    id: String(row.id),
    workspaceId: 'fathur',
    className: String(row.class_name ?? '12B'),
    weekNumber: Number(row.week_number ?? 0),
    dayName: String(row.day_name ?? ''),
    scheduleDate: String(row.schedule_date ?? ''),
    dayStatus: String(row.day_status ?? ''),
    startTimeLabel: String(row.start_time_label ?? ''),
    subjectCode: String(row.subject_code ?? ''),
    subjectName: String(row.subject_name ?? ''),
    activityType: String(row.activity_type ?? ''),
    source: 'supabase',
  };
}

function parseDateLabel(value: string): string {
  const match = /^(\d{2})\s+(\w+)\s+(\d{4})$/.exec(value.trim());
  if (!match) return value;

  const monthMap: Record<string, string> = {
    Januari: '01',
    Februari: '02',
    Maret: '03',
    April: '04',
    Mei: '05',
    Juni: '06',
    Juli: '07',
    Agustus: '08',
    September: '09',
    Oktober: '10',
    November: '11',
    Desember: '12',
  };

  const month = monthMap[match[2]];
  if (!month) return value;

  return `${match[3]}-${month}-${match[1]}`;
}

function loadBundledSchedule(): TutoringScheduleItem[] {
  const bundled = bundledSchedule as unknown as BundledSchedule;
  const days = Array.isArray(bundled.data_jadwal) ? bundled.data_jadwal : [];
  const items: TutoringScheduleItem[] = [];

  for (const day of days) {
    const scheduleDate = parseDateLabel(day.tanggal);

    for (const activity of day.kegiatan) {
      items.push({
        id: `bundled-${day.minggu_ke}-${scheduleDate}-${activity.kode_mata_pelajaran}-${activity.waktu}`,
        workspaceId: 'fathur',
        className: '12B',
        weekNumber: day.minggu_ke,
        dayName: day.hari,
        scheduleDate,
        dayStatus: day.status,
        startTimeLabel: activity.waktu,
        subjectCode: activity.kode_mata_pelajaran,
        subjectName: activity.nama_mata_pelajaran,
        activityType: activity.jenis_kegiatan,
        source: 'bundled-json',
      });
    }
  }

  return items;
}

export async function loadFathurTutoringSchedule(): Promise<TutoringScheduleItem[]> {
  const { data, error } = await supabase
    .from('fathur_tutoring_schedule')
    .select([
      'id',
      'workspace_id',
      'class_name',
      'week_number',
      'day_name',
      'schedule_date',
      'day_status',
      'start_time_label',
      'subject_code',
      'subject_name',
      'activity_type',
    ].join(','))
    .eq('workspace_id', 'fathur')
    .order('schedule_date', { ascending: true })
    .order('start_time_label', { ascending: true });

  if (!error && data && data.length > 0) {
    return (data as unknown as Record<string, unknown>[]).map(mapRow);
  }

  const fallback = loadBundledSchedule();
  if (fallback.length > 0) return fallback;

  if (error) throw error;
  return [];
}

export async function createTutoringSchedule(data: Omit<TutoringScheduleItem, 'id' | 'source'>) {
  const { error } = await supabase.from('fathur_tutoring_schedule').insert([{
    workspace_id: data.workspaceId,
    class_name: data.className,
    week_number: data.weekNumber,
    day_name: data.dayName,
    schedule_date: data.scheduleDate,
    day_status: data.dayStatus,
    start_time_label: data.startTimeLabel,
    subject_code: data.subjectCode,
    subject_name: data.subjectName,
    activity_type: data.activityType,
  }]);
  if (error) throw error;
}

export async function updateTutoringSchedule(id: string, data: Partial<Omit<TutoringScheduleItem, 'id' | 'source'>>) {
  const updates: Record<string, any> = {};
  if (data.workspaceId !== undefined) updates.workspace_id = data.workspaceId;
  if (data.className !== undefined) updates.class_name = data.className;
  if (data.weekNumber !== undefined) updates.week_number = data.weekNumber;
  if (data.dayName !== undefined) updates.day_name = data.dayName;
  if (data.scheduleDate !== undefined) updates.schedule_date = data.scheduleDate;
  if (data.dayStatus !== undefined) updates.day_status = data.dayStatus;
  if (data.startTimeLabel !== undefined) updates.start_time_label = data.startTimeLabel;
  if (data.subjectCode !== undefined) updates.subject_code = data.subjectCode;
  if (data.subjectName !== undefined) updates.subject_name = data.subjectName;
  if (data.activityType !== undefined) updates.activity_type = data.activityType;

  const { error } = await supabase.from('fathur_tutoring_schedule').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteTutoringSchedule(id: string) {
  const { error } = await supabase.from('fathur_tutoring_schedule').delete().eq('id', id);
  if (error) throw error;
}
