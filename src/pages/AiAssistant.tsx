import { useEffect, useRef, useState } from 'react';
import { Sparkles, Send, RotateCcw, BookOpen, CalendarDays, HeartHandshake, ListChecks } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { askAiAssistant, type AiChatTurn } from '../services/aiAssistantService';

interface DisplayMessage extends AiChatTurn {
  id: string;
  error?: boolean;
}

export default function AiAssistant() {
  const { profile } = useAuth();
  const { workspaceId, workspace } = useWorkspace();
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const greetingName = profile?.name?.split(' ')[0] || (workspaceId === 'mazet' ? 'Mazet' : 'Fathur');

  const send = async () => {
    const prompt = input.trim();
    if (!prompt || busy) return;
    setInput('');
    const userMsg: DisplayMessage = { id: crypto.randomUUID(), role: 'user', text: prompt };
    const history: AiChatTurn[] = [...messages, userMsg].map(({ role, text }) => ({ role, text }));
    setMessages((prev) => [...prev, userMsg]);
    setBusy(true);
    try {
      const reply = await askAiAssistant({ prompt, history: history.slice(0, -1), workspace: workspaceId });
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'model', text: reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        role: 'model',
        text: error instanceof Error ? error.message : 'AI sedang tidak bisa dihubungi. Coba lagi sebentar lagi.',
        error: true,
      }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-7rem)] w-full max-w-3xl flex-col pb-4 fade-up lg:h-[calc(100dvh-9rem)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black leading-tight">FAZET AI</h1>
            <p className="text-xs text-slate-500">Asisten belajar • {workspace.name} workspace</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" icon={<RotateCcw size={14} />} onClick={() => setMessages([])}>
            Reset
          </Button>
        )}
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: 'Bantu belajar', icon: BookOpen, prompt: 'Jelaskan materi yang sedang kupelajari dengan sederhana, berikan contoh, lalu beri 3 soal latihan.' },
          { label: 'Atur besok', icon: CalendarDays, prompt: 'Buat rencana belajar besok yang realistis, jangan terlalu padat, dan sisakan waktu istirahat.' },
          { label: 'Chat', icon: HeartHandshake, prompt: 'Bantu saya menulis pesan singkat yang hangat, natural, dan tidak berlebihan untuk orang yang penting bagi saya.' },
          { label: 'Prioritas', icon: ListChecks, prompt: 'Buatkan cara menentukan 3 prioritas utama hari ini supaya saya tidak kewalahan.' },
        ].map(({ label, icon: Icon, prompt }) => (
          <button key={label} type="button" onClick={() => { setInput(prompt); }} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-[11px] font-bold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-indigo-950/30">
            <Icon size={14} className="shrink-0 text-indigo-500" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
        <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50/70 p-4 dark:bg-slate-950/50">
          {messages.length === 0 && (
            <div className="grid h-full place-items-center px-6 text-center">
              <div>
                <Sparkles className="mx-auto mb-3 text-indigo-400" size={28} />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Hai {greetingName}! Tanya apa saja — soal tugas, jadwal, atau materi pelajaran.
                </p>
              </div>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-6 shadow-sm ${
                  m.role === 'user'
                    ? 'bg-[var(--ed-terracotta,#4f46e5)] text-white'
                    : m.error
                      ? 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300'
                      : 'border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 p-3 dark:border-slate-800">
          <div className="flex gap-2">
            <input
              className="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }}
              placeholder="Tulis pertanyaanmu…"
              disabled={busy}
            />
            <Button onClick={() => void send()} icon={<Send size={15} />} disabled={busy || !input.trim()}>
              Kirim
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

