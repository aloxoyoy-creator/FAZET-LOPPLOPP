import { useMemo, useState } from 'react';
import { ArrowRight, Brain, Loader2, Sparkles, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import { askAiAssistant } from '../../services/aiAssistantService';
import { getActiveOrNextExamDay, isTkaFeatureActive } from '../../data/tkaSchedule2026';
import type { ScheduleItem } from '../../types';
import type { TutoringScheduleItem } from '../../services/tutoringScheduleService';

type Props = {
  tomorrowSubjects: string[];
  tomorrowDay: string;
  academicTimeline: ScheduleItem[];
  tutoring: TutoringScheduleItem[];
};

export default function AiPulseCard({ tomorrowSubjects, tomorrowDay, academicTimeline, tutoring }: Props) {
  const { workspaceId } = useWorkspace();
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const activeTka = useMemo(() => getActiveOrNextExamDay(new Date()), []);
  const tkaActive = workspaceId !== 'mazet' && isTkaFeatureActive();

  const actions = useMemo(() => {
    const base = [
      {
        label: 'Atur besok',
        prompt: `Buat rencana belajar ${workspaceId === 'mazet' ? 'Mazet' : 'Fathur'} untuk besok (${tomorrowDay}) berdasarkan pelajaran: ${tomorrowSubjects.join(', ') || 'belum ada data'}.`,
      },
      {
        label: 'Ringkas hari ini',
        prompt: `Ringkas Academic Timeline saya menjadi 3 prioritas paling penting hari ini: ${academicTimeline.slice(0, 6).map((x) => `${x.startTime}-${x.endTime} ${x.subject}`).join('; ') || 'tidak ada jadwal'}.`,
      },
      {
        label: 'Persiapan les',
        prompt: `Dari jadwal les berikut, beri saran persiapan yang sederhana dan realistis: ${tutoring.slice(0, 5).map((x) => `${x.scheduleDate} ${x.startTimeLabel} ${x.subjectName}`).join('; ') || 'belum ada jadwal les'}.`,
      },
    ];

    if (tkaActive) {
      base.unshift({
        label: `🎯 Strategi TKA H${activeTka.exam.hariKe}`,
        prompt: `Susun strategi belajar kilat dan daftar persiapan terakhir untuk Ujian TKA SMA 2026 Hari Ke-${activeTka.exam.hariKe} (${activeTka.exam.tanggalFormatted}, pukul ${activeTka.exam.mulaiWib}-${activeTka.exam.perkiraanSelesaiWib} WIB) mata pelajaran: ${activeTka.exam.mapel} (${activeTka.exam.rincian}). Berikan 3 poin taktis yang langsung bisa dipraktikkan.`,
      });
    }

    return base;
  }, [workspaceId, tomorrowDay, tomorrowSubjects, academicTimeline, tutoring, activeTka, tkaActive]);

  async function run(prompt: string) {
    setLoading(true);
    try {
      const result = await askAiAssistant({ prompt, workspace: workspaceId });
      setAnswer(result);
    } catch {
      setAnswer('AI belum bisa memberi jawaban sekarang. Coba lagi beberapa saat lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="fazet-ai-pulse">
      <div className="fazet-ai-pulse__head">
        <div className="flex min-w-0 items-start gap-3">
          <span className="fazet-ai-icon"><Brain size={17} /></span>
          <div className="min-w-0">
            <div className="fazet-eyebrow"><Sparkles size={13} /> AI companion</div>
            <h2>FAZET AI</h2>
            <p>AI membaca konteks jadwal sekolah, tugas, & aktivitas harian secara langsung.</p>
          </div>
        </div>
        <Link to="/ai" className="fazet-inline-link">Buka AI <ArrowRight size={14} /></Link>
      </div>

      <div className="fazet-ai-pulse__actions flex-wrap">
        {actions.map((item) => (
          <button
            key={item.label}
            type="button"
            className="fazet-ai-chip"
            onClick={() => void run(item.prompt)}
            disabled={loading}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="fazet-ai-pulse__result" aria-live="polite">
        {loading ? (
          <div className="fazet-ai-loading"><Loader2 size={15} className="animate-spin" /> AI sedang menyusun strategi...</div>
        ) : answer ? (
          <div className="whitespace-pre-line">{answer}</div>
        ) : (
          <div className="fazet-ai-idle flex items-center gap-1.5">
            <Target size={13} className="text-indigo-400 shrink-0" />
            <span>Pilih salah satu bantuan taktis di atas untuk melihat strategi instan.</span>
          </div>
        )}
      </div>
    </section>
  );
}
