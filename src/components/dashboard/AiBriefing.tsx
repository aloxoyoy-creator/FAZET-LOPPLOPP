import { useEffect, useState } from 'react';
import { Sparkles, RefreshCcw, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAppConfig } from '../../context/AppConfigContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getActiveOrNextExamDay, isTkaFeatureActive } from '../../data/tkaSchedule2026';

type TaskInfo = { title: string; subject?: string };

export default function AiBriefing({
  firstName,
  tasks,
  tomorrowSubjects,
}: {
  firstName: string;
  tasks: TaskInfo[];
  tomorrowSubjects: string[];
}) {
  const { ai } = useAppConfig();
  const { workspaceId } = useWorkspace();
  const [briefing, setBriefing] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchBriefing = async () => {
    setLoading(true);
    const now = new Date();
    const tkaActive = workspaceId !== 'mazet' && isTkaFeatureActive(now);
    try {
      const activeTka = getActiveOrNextExamDay(now);
      const taskStr =
        tasks.length > 0
          ? tasks
              .slice(0, 5)
              .map((t) => `- ${t.title} ${t.subject ? `(${t.subject})` : ''}`)
              .join('\n')
          : 'Tidak ada tugas mendesak.';
      const subjStr = tomorrowSubjects.length > 0 ? tomorrowSubjects.join(', ') : 'Tidak ada jadwal spesifik.';
      const tkaContext = tkaActive
        ? `- Target Ujian TKA SMA 2026 Terdekat: Hari Ke-${activeTka.exam.hariKe} (${activeTka.exam.tanggalFormatted}, ${activeTka.exam.mulaiWib} WIB) — ${activeTka.exam.shortTitle}`
        : '';

      const prompt = `${ai.systemPrompt || 'Kamu adalah FAZET AI, asisten produktivitas yang hangat, pintar, dan memotivasi.'} 
Buatkan sapaan singkat maksimal 3 kalimat untuk ${firstName}. 
Konteks:
- Tugas aktif: ${taskStr}
- Jadwal besok: ${subjStr}
${tkaContext}

Gaya bahasa: ${ai.greetingStyle || 'Kasual, elegan, dan bersahabat'}, berbahasa Indonesia. Jangan menggunakan emoji. Sapa namanya dan beri semangat menjalani agenda terdekat.`;

      const { data, error } = await supabase.functions.invoke('ai-proxy', { body: { prompt, workspace: 'personal' } });
      if (error) throw error;
      const response = data.text;
      setBriefing(response || 'Selamat menjalani aktivitas hari ini. Fokus pada prioritas utamamu dengan tenang.');
    } catch {
      const activeTka = getActiveOrNextExamDay(now);
      if (tkaActive) {
        setBriefing(
          `Halo ${firstName}, persiapkan dirimu dengan tenang untuk TKA Hari Ke-${activeTka.exam.hariKe} (${activeTka.exam.shortTitle}) pada ${activeTka.exam.tanggalFormatted} pukul ${activeTka.exam.mulaiWib} WIB.`
        );
      } else {
        setBriefing(
          `Halo ${firstName}, pastikan jadwal harian, prioritas tugas, dan waktu istirahatmu berjalan seimbang hari ini.`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchBriefing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstName, workspaceId]);

  return (
    <div className="relative overflow-hidden rounded-[var(--tf-radius-card)] border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] p-5 sm:p-6 shadow-[var(--tf-shadow-raised)] flex flex-col justify-between">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="studio-eyebrow">
            <Sparkles size={12} />
            <span>{ai.personalityName || 'FAZET AI'} Briefing</span>
          </div>
          <button
            onClick={() => void fetchBriefing()}
            disabled={loading}
            className="grid h-7 w-7 place-items-center rounded-lg border border-[var(--tf-border)] text-[var(--tf-text-muted)] hover:text-[var(--tf-text-primary)] hover:bg-[var(--tf-bg-subtle)] transition-colors cursor-pointer"
            aria-label="Segarkan sapaan"
          >
            <RefreshCcw size={12} className={loading ? 'animate-spin opacity-50' : ''} />
          </button>
        </div>

        <h3 className="font-serif text-lg font-medium text-[var(--tf-text-primary)] mb-2">
          Ringkasan &amp; Arahan Harian
        </h3>
      </div>

      <div className="text-xs sm:text-sm leading-relaxed text-[var(--tf-text-secondary)] rounded-xl bg-[var(--tf-bg-subtle)] border border-[var(--tf-border)] p-3.5">
        {loading ? (
          <div className="flex items-center gap-2 text-[var(--tf-text-muted)]">
            <Loader2 size={14} className="animate-spin text-[var(--tf-accent)]" />
            <span>Menyusun catatan briefing harian...</span>
          </div>
        ) : (
          briefing
        )}
      </div>
    </div>
  );
}
