import { useMemo, useState } from 'react';
import { ArrowRight, Brain, Loader2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import { askAiAssistant } from '../../services/aiAssistantService';
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
  const prompts = useMemo(() => [
    `Buat rencana belajar ${workspaceId === 'mazet' ? 'Mazet' : 'Fathur'} untuk besok (${tomorrowDay}) berdasarkan pelajaran: ${tomorrowSubjects.join(', ') || 'belum ada data'}.`,
    `Ringkas Academic Timeline saya menjadi 3 prioritas paling penting hari ini: ${academicTimeline.slice(0, 6).map((x) => `${x.startTime}-${x.endTime} ${x.subject}`).join('; ') || 'tidak ada jadwal'}.`,
    `Dari jadwal les berikut, beri saran persiapan yang sederhana dan realistis: ${tutoring.slice(0, 5).map((x) => `${x.scheduleDate} ${x.startTimeLabel} ${x.subjectName}`).join('; ') || 'belum ada jadwal les'}.`,
  ], [workspaceId, tomorrowDay, tomorrowSubjects, academicTimeline, tutoring]);

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
            <p>AI melihat konteks workspace ini lalu membantu tanpa memenuhi layar.</p>
          </div>
        </div>
        <Link to="/ai" className="fazet-inline-link">Buka AI <ArrowRight size={14} /></Link>
      </div>

      <div className="fazet-ai-pulse__actions">
        {['Atur besok', 'Ringkas hari ini', 'Persiapan les'].map((label, index) => (
          <button key={label} type="button" className="fazet-ai-chip" onClick={() => void run(prompts[index])} disabled={loading}>
            {label}
          </button>
        ))}
      </div>

      <div className="fazet-ai-pulse__result" aria-live="polite">
        {loading ? <div className="fazet-ai-loading"><Loader2 size={15} className="animate-spin" /> AI sedang menyusun...</div> : answer || <div className="fazet-ai-idle">Pilih salah satu bantuan di atas. Hasilnya muncul di sini tanpa membuka halaman lain.</div>}
      </div>
    </section>
  );
}
