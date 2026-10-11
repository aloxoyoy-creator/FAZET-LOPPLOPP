import { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Smile, Heart, MessageCircleHeart, History, Send, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface MoodLog {
  id: string;
  user: 'Fathur' | 'Mazet';
  moodKey: string;
  moodEmoji: string;
  moodLabel: string;
  note: string;
  reply: string;
  date: string;
}

const STORAGE_KEY = 'fazet_couple_mood_tracker';

const MOODS = [
  {
    key: 'happy',
    emoji: '💖',
    label: 'Bahagia Banget',
    desc: 'Lagi seneng dan bersyukur hari ini!',
    reply: 'Alhamdulillah sayangku! Senyum manismu selalu jadi penyejuk duniaku. Semoga bahagianya nular terus ya cinta! 🥰',
  },
  {
    key: 'cuddle',
    emoji: '🥺',
    label: 'Butuh Peluk / Manja',
    desc: 'Lagi pengen dimanja dan dipeluk erat.',
    reply: 'Sini sayangku bayik besarku... Aku peluk erat-erat dari jauh yaa, cup keningnya bertubi-tubi muaaach! Kamu kesayangan aku selamanya ❤️',
  },
  {
    key: 'tired',
    emoji: '😴',
    label: 'Lelah & Capek',
    desc: 'Tenaga habis setelah belajar/tugas seharian.',
    reply: 'Istirahat ya sayang, jangan dipaksa lagi. Kamu udah berjuang luar biasa hari ini. Rehat yang cukup, besok kita sambung lagi ya cintaku 🍵',
  },
  {
    key: 'excited',
    emoji: '🔥',
    label: 'Semangat 45!',
    desc: 'Siap menaklukkan target dan soal-soal hari ini!',
    reply: 'Keren banget pacar hebatku! Gassskeun sayang, aku selalu dukung dan bangga banget sama tekad dan semangatmu! ✨💪',
  },
  {
    key: 'anxious',
    emoji: '💭',
    label: 'Overthinking / Cemas',
    desc: 'Pikiran lagi ramai dan cemas tentang masa depan.',
    reply: 'Tarik napas panjang manis... Semua akan baik-baik saja. Ingat Allah selalu jaga kita, dan kamu punya aku yang nggak akan pernah pergi. Love you! 🌸',
  },
  {
    key: 'miss',
    emoji: '🥰',
    label: 'Kangen Berat',
    desc: 'Lagi kepikiran terus dan rindu berat.',
    reply: 'Aku juga kangeeeen banget sama kamu sayang! Sabar ya cintaa, rindu ini bakal terbayar manis saat kita barengan nanti. Muach! 💋',
  },
];

export default function CoupleMoodTracker() {
  const [logs, setLogs] = useState<MoodLog[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [activeUser, setActiveUser] = useState<'Fathur' | 'Mazet'>('Fathur');
  const [selectedMood, setSelectedMood] = useState(MOODS[0]);
  const [note, setNote] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save mood logs', e);
    }
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: MoodLog = {
      id: `mood_${Date.now()}`,
      user: activeUser,
      moodKey: selectedMood.key,
      moodEmoji: selectedMood.emoji,
      moodLabel: selectedMood.label,
      note: note.trim() || 'Tidak ada catatan tambahan.',
      reply: selectedMood.reply,
      date: new Date().toISOString(),
    };

    setLogs([newLog, ...logs.slice(0, 19)]); // Simpan 20 riwayat terakhir
    setNote('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    try {
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.7 } });
    } catch {}
  };

  return (
    <Card className="p-6 border-2 border-rose-200/90 dark:border-rose-900/40 bg-white dark:bg-[#0a0f1d] shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pink-100 dark:bg-pink-950/60 rounded-2xl text-pink-600 dark:text-pink-300">
            <Smile size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              Couple Daily Mood Check-In
              <Heart size={16} className="text-rose-500 fill-rose-500" />
            </h2>
            <p className="text-xs text-[var(--tf-text-muted)] mt-0.5">
              Bagaimana perasaanmu hari ini sayang? Curahkan di sini dan dapatkan respon manis dari pasangan!
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User Picker */}
        <div className="flex items-center gap-3 bg-rose-50/70 dark:bg-rose-950/20 p-2 rounded-2xl border border-rose-100 dark:border-rose-900/30 w-fit">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 pl-2">Siapa yang check-in?</span>
          <button
            type="button"
            onClick={() => setActiveUser('Fathur')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeUser === 'Fathur' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Fathur
          </button>
          <button
            type="button"
            onClick={() => setActiveUser('Mazet')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeUser === 'Mazet' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Mazet
          </button>
        </div>

        {/* Mood Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {MOODS.map(m => {
            const isSelected = selectedMood.key === m.key;
            return (
              <button
                type="button"
                key={m.key}
                onClick={() => setSelectedMood(m)}
                className={`p-3 rounded-2xl border-2 text-left transition-all ${
                  isSelected
                    ? 'border-rose-500 bg-rose-50/90 dark:bg-rose-950/40 shadow-xs scale-102'
                    : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-rose-200'
                }`}
              >
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">{m.label}</div>
                <div className="text-[10px] text-[var(--tf-text-muted)] line-clamp-1 mt-0.5">{m.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Note Field */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Cerita Singkat Hari Ini (Opsional)
          </label>
          <input
            type="text"
            placeholder="Contoh: Hari ini selesai bab tryout, agak capek tapi seneng..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="input h-11 text-xs w-full"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          {showSuccess && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Sparkles size={13} /> Check-in mood tersimpan manis!
            </span>
          )}
          <div className="ml-auto">
            <Button
              type="submit"
              size="sm"
              className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs gap-1.5"
              icon={<Send size={13} />}
            >
              Kirim & Dapatkan Respon Manja ✨
            </Button>
          </div>
        </div>
      </form>

      {/* Mood History Timeline */}
      {logs.length > 0 && (
        <div className="mt-8 pt-6 border-t border-rose-100 dark:border-rose-900/30 space-y-3">
          <div className="text-xs font-bold text-[var(--tf-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
            <History size={13} /> Riwayat Perasaan Terbaru
          </div>
          <div className="space-y-2.5">
            {logs.slice(0, 5).map(log => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{log.moodEmoji}</span>
                    <span className="font-black text-slate-900 dark:text-white">
                      {log.user}: {log.moodLabel}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Intl.DateTimeFormat('id-ID', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(log.date))}
                  </span>
                </div>

                {log.note && log.note !== 'Tidak ada catatan tambahan.' && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic pl-7">
                    "{log.note}"
                  </p>
                )}

                <div className="ml-7 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-[11px] text-rose-950 dark:text-rose-200 flex items-start gap-1.5 leading-relaxed">
                  <MessageCircleHeart size={14} className="text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>Respon Manja:</strong> {log.reply}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
