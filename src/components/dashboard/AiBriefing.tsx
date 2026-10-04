import { useEffect, useState } from 'react';
import { Sparkles, RefreshCcw, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAppConfig } from '../../context/AppConfigContext';

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
  const [briefing, setBriefing] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchBriefing = async () => {
    setLoading(true);
    try {
      const taskStr = tasks.length > 0 
        ? tasks.map(t => `- ${t.title} ${t.subject ? `(${t.subject})` : ''}`).join('\n')
        : 'Tidak ada tugas Mendesak.';
      const subjStr = tomorrowSubjects.length > 0
        ? tomorrowSubjects.join(', ')
        : 'Tidak ada jadwal spesifik.';

      const prompt = `${ai.systemPrompt || 'Kamu adalah FAZET AI, asisten produktivitas yang hangat, pintar, dan memotivasi.'} 
Buatkan sapaan singkat maksimal 3 kalimat untuk ${firstName}. 
Konteks:
- Tugas aktif: ${taskStr}
- Jadwal besok: ${subjStr}

Gaya bahasa: ${ai.greetingStyle || 'Kasual dan bersahabat'}, berbahasa Indonesia. Jangan menggunakan sapaan selamat pagi/siang/malam karena waktunya dinamis, cukup sapa namanya.`;

      const { data, error } = await supabase.functions.invoke('ai-proxy', { body: { prompt, workspace: 'personal' } });
      if (error) throw error;
      const response = data.text;
      setBriefing(response || 'Semangat menjalani harimu! Fokus pada tujuanmu hari ini.');
    } catch (e) {
      setBriefing(`Hai ${firstName}! Jangan lupa cek tugas dan jadwalmu hari ini ya. Tetap semangat!`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchBriefing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstName]); // only run once per mount

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-fuchsia-400 to-indigo-500 opacity-10 blur-xl" />
      
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
          <Sparkles size={14} className="text-fuchsia-500" />
          {ai.personalityName || 'FAZET AI'} Briefing
        </div>
        <button
          onClick={() => void fetchBriefing()}
          disabled={loading}
          className="grid h-6 w-6 place-items-center rounded-md text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
          aria-label="Refresh sapaan"
        >
          <RefreshCcw size={12} className={loading ? 'animate-spin opacity-50' : ''} />
        </button>
      </div>
      
      <div className="text-sm leading-6 text-slate-700 dark:text-slate-200">
        {loading ? (
          <div className="flex items-center gap-2 text-indigo-500/70">
            <Loader2 size={14} className="animate-spin" />
            <span className="animate-pulse">Menyusun sapaan...</span>
          </div>
        ) : (
          briefing
        )}
      </div>
    </div>
  );
}
