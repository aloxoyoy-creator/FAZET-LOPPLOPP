import { useState } from 'react';
import { CalendarDays, GraduationCap, Sparkles } from 'lucide-react';
import FathurTutoringSchedulePanel from '../components/dashboard/FathurTutoringSchedulePanel';
import { useWorkspace } from '../context/WorkspaceContext';

export default function Tutoring() {
  const { workspaceId, workspace } = useWorkspace();
  const [now] = useState(() => new Date());

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 pb-12 fade-up">
      <header className="fazet-min-card p-5 sm:p-6">
        <div className="fazet-eyebrow"><GraduationCap size={13} /> Jadwal les</div>
        <h1 className="mt-2 text-2xl font-black" style={{ color: 'var(--tf-ink)' }}>Ruang les {workspace.name}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: 'var(--tf-ink-muted)' }}>
          Halaman khusus untuk jadwal bimbingan/les. Academic Timeline tetap dipisahkan supaya beranda dan kalender tidak bercampur.
        </p>
      </header>

      {workspaceId === 'fathur' ? (
        <FathurTutoringSchedulePanel now={now} />
      ) : (
        <section className="fazet-min-card p-5">
          <div className="flex items-start gap-3">
            <span className="fazet-feature-icon"><CalendarDays size={18} /></span>
            <div>
              <h2 className="text-base font-black" style={{ color: 'var(--tf-ink)' }}>Belum ada jadwal les Mazet</h2>
              <p className="mt-1 text-sm leading-6" style={{ color: 'var(--tf-ink-muted)' }}>Tambahkan data les Mazet ketika jadwalnya sudah tersedia. Tidak ada data yang dibuat-buat di sini.</p>
            </div>
          </div>
        </section>
      )}

      <div className="fazet-footer-note"><Sparkles size={12} /> Jadwal les ditampilkan terpisah dari Academic Timeline.</div>
    </div>
  );
}
