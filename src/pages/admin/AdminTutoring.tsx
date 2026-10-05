import { useState, useEffect } from 'react';
import AdminHeader from '../../components/admin/AdminHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { 
  loadFathurTutoringSchedule, 
  createTutoringSchedule, 
  updateTutoringSchedule, 
  deleteTutoringSchedule,
  type TutoringScheduleItem 
} from '../../services/tutoringScheduleService';
import { supabase } from '../../lib/supabase';
import { BookOpen } from 'lucide-react';

export default function AdminTutoring() {
  const [items, setItems] = useState<TutoringScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TutoringScheduleItem | null>(null);

  // Form State
  const [weekNumber, setWeekNumber] = useState(1);
  const [dayName, setDayName] = useState('Senin');
  const [scheduleDate, setScheduleDate] = useState('');
  const [dayStatus, setDayStatus] = useState('KBM Aktif');
  const [startTimeLabel, setStartTimeLabel] = useState('07:00 - 08:30');
  const [subjectCode, setSubjectCode] = useState('MAT');
  const [subjectName, setSubjectName] = useState('Matematika');
  const [activityType, setActivityType] = useState('Reguler');

  async function fetchSchedules() {
    setLoading(true);
    try {
      const data = await loadFathurTutoringSchedule();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSchedules();

    // Subscribe to realtime changes
    const channel = supabase.channel('fathur_tutoring_schedule_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fathur_tutoring_schedule' }, () => {
        fetchSchedules();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  function reset(s?: TutoringScheduleItem) {
    setEditing(s || null);
    setWeekNumber(s?.weekNumber || 1);
    setDayName(s?.dayName || 'Senin');
    setScheduleDate(s?.scheduleDate || new Date().toISOString().split('T')[0]);
    setDayStatus(s?.dayStatus || 'KBM Aktif');
    setStartTimeLabel(s?.startTimeLabel || '07:00 - 08:30');
    setSubjectCode(s?.subjectCode || '');
    setSubjectName(s?.subjectName || '');
    setActivityType(s?.activityType || 'Reguler');
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      workspaceId: 'fathur' as const,
      className: '12B',
      weekNumber,
      dayName,
      scheduleDate,
      dayStatus,
      startTimeLabel,
      subjectCode,
      subjectName,
      activityType
    };

    try {
      if (editing && editing.source === 'supabase') {
        await updateTutoringSchedule(editing.id, data);
      } else {
        await createTutoringSchedule(data);
      }
      setOpen(false);
      fetchSchedules();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan jadwal les.');
    }
  }

  async function handleDelete(id: string, source: string) {
    if (source !== 'supabase') {
      alert('Tidak dapat menghapus jadwal bawaan (bundled). Harap timpa dengan menambahkan jadwal baru yang spesifik.');
      return;
    }
    if (confirm('Yakin ingin menghapus jadwal ini?')) {
      try {
        await deleteTutoringSchedule(id);
        fetchSchedules();
      } catch (err) {
        console.error(err);
        alert('Gagal menghapus jadwal.');
      }
    }
  }

  // Group by Date
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.scheduleDate]) acc[item.scheduleDate] = [];
    acc[item.scheduleDate].push(item);
    return acc;
  }, {} as Record<string, TutoringScheduleItem[]>);

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return (
    <div className="space-y-5 fade-up">
      <AdminHeader 
        title="Jadwal Les (Fathur)" 
        description="Kelola jadwal les tambahan, bimbingan, atau try out untuk workspace Fathur."
      />
      
      <div className="flex justify-end">
        <Button onClick={() => reset()}>Tambah Jadwal Les</Button>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-slate-500">Memuat jadwal...</Card>
      ) : items.length === 0 ? (
        <Card className="p-4">
          <EmptyState title="Belum ada jadwal les" description="Klik tambah jadwal les untuk membuat entri baru." />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {sortedDates.map(date => (
              <div key={date} className="p-4">
                <div className="mb-3 text-sm font-bold text-blue-600 dark:text-blue-400">
                  {grouped[date][0].dayName}, {date} <span className="ml-2 text-xs font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Minggu ke-{grouped[date][0].weekNumber}</span>
                </div>
                <div className="space-y-2">
                  {grouped[date].map(s => (
                    <div key={s.id} className="flex flex-col gap-3 rounded-xl bg-slate-50 dark:bg-slate-900 p-3 sm:flex-row sm:items-center border border-slate-100 dark:border-slate-800">
                      <div className="w-32 text-sm font-bold text-slate-700 dark:text-slate-300">
                        {s.startTimeLabel}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                          <BookOpen size={14} className="text-blue-500" />
                          {s.subjectName} ({s.subjectCode})
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {s.activityType} • Status: {s.dayStatus}
                          {s.source === 'bundled-json' && <span className="ml-2 text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] border border-amber-200">Bawaan Sistem</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => reset(s)}>
                          {s.source === 'bundled-json' ? 'Timpa (Edit)' : 'Edit'}
                        </Button>
                        {s.source === 'supabase' && (
                          <Button size="sm" variant="danger" onClick={() => handleDelete(s.id, s.source)}>Hapus</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? (editing.source === 'bundled-json' ? 'Timpa Jadwal Les (Buat Baru)' : 'Edit Jadwal Les') : 'Tambah Jadwal Les'}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Tanggal (YYYY-MM-DD)</label>
              <input className="input" type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} required />
            </div>
            <div>
              <label className="label">Hari</label>
              <select className="input" value={dayName} onChange={e => setDayName(e.target.value)}>
                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(x => <option key={x}>{x}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Minggu Ke-</label>
              <input className="input" type="number" min="1" value={weekNumber} onChange={e => setWeekNumber(parseInt(e.target.value) || 1)} required />
            </div>
            <div>
              <label className="label">Waktu (Label)</label>
              <input className="input" placeholder="Contoh: 07:00 - 08:30" value={startTimeLabel} onChange={e => setStartTimeLabel(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Kode Mapel</label>
              <input className="input" placeholder="Contoh: MAT" value={subjectCode} onChange={e => setSubjectCode(e.target.value)} required />
            </div>
            <div>
              <label className="label">Nama Mapel</label>
              <input className="input" placeholder="Contoh: Matematika" value={subjectName} onChange={e => setSubjectName(e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="label">Jenis Kegiatan</label>
            <input className="input" placeholder="Contoh: Reguler / Try Out" value={activityType} onChange={e => setActivityType(e.target.value)} required />
          </div>
          <div>
            <label className="label">Status Hari</label>
            <input className="input" placeholder="Contoh: KBM Aktif / Libur" value={dayStatus} onChange={e => setDayStatus(e.target.value)} required />
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
