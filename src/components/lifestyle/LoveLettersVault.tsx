import { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Mail, Plus, Heart, Trash2, Star, Sparkles, X, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface LoveLetter {
  id: string;
  sender: 'Fathur' | 'Mazet';
  recipient: 'Fathur' | 'Mazet';
  title: string;
  content: string;
  category: 'Kangen' | 'Semangat Belajar' | 'Romantis' | 'Janji Masa Depan' | 'Minta Maaf/Manja';
  stamp: string;
  date: string;
  isFavorite: boolean;
}

const STORAGE_KEY = 'fazet_love_letters_vault';

const INITIAL_LETTERS: LoveLetter[] = [
  {
    id: 'letter_1',
    sender: 'Fathur',
    recipient: 'Mazet',
    title: 'Untuk Bidadari yang Selalu Menemani Hariku',
    content: 'Sayangku Mazet tersayang... Terima kasih yaa sudah selalu jadi alasan senyumku setiap hari. Walau kita sama-sama sibuk belajar dan mengejar impian, ingat selalu kalau Fathur ada di sini buat dukung kamu sepenuh hati. Jangan pernah merasa sendiri ya cinta. I love you more than words can say! ❤️',
    category: 'Romantis',
    stamp: '💌',
    date: '2024-10-26T08:00:00.000Z',
    isFavorite: true,
  },
  {
    id: 'letter_2',
    sender: 'Mazet',
    recipient: 'Fathur',
    title: 'Semangat Terus ya Mas Fathur Kesayangan!',
    content: 'Halo Mas Fathur hebatku! Aku tahu perjuangan masuk PTN dan belajar tiap hari itu nggak mudah, tapi aku percaya banget sama kemampuan kamu. Jangan lupa jaga kesehatan, jangan telat makan yaa sayang. Mazet selalu berdoa buat kelancaran semua urusan Mas Fathur. Peluk erat dari jauh! 🥰✨',
    category: 'Semangat Belajar',
    stamp: '🎓',
    date: '2024-11-01T10:30:00.000Z',
    isFavorite: true,
  },
  {
    id: 'letter_3',
    sender: 'Fathur',
    recipient: 'Mazet',
    title: 'Surat Ketika Kamu Lagi Capek atau Cemas',
    content: 'Hai manisku, kalau suatu hari kamu ngerasa dunia lagi berat banget, tolong baca surat ini ya. Tarik napas panjang, pejamkan mata sejenak. Kamu itu berharga banget, dan kamu udah berjuang sekuat tenaga. Apapun hasilnya nanti, kamu tetap yang terbaik buat aku. Sini istirahat di pelukanku ya sayang... 🥺💖',
    category: 'Minta Maaf/Manja',
    stamp: '🧸',
    date: '2024-11-15T19:45:00.000Z',
    isFavorite: false,
  }
];

export default function LoveLettersVault() {
  const [letters, setLetters] = useState<LoveLetter[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_LETTERS;
    } catch {
      return INITIAL_LETTERS;
    }
  });

  const [activeLetter, setActiveLetter] = useState<LoveLetter | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('Semua');

  // Form State
  const [newSender, setNewSender] = useState<'Fathur' | 'Mazet'>('Fathur');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<LoveLetter['category']>('Romantis');
  const [newStamp, setNewStamp] = useState('💌');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(letters));
    } catch (e) {
      console.error('Failed to save love letters', e);
    }
  }, [letters]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newEntry: LoveLetter = {
      id: `letter_${Date.now()}`,
      sender: newSender,
      recipient: newSender === 'Fathur' ? 'Mazet' : 'Fathur',
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      stamp: newStamp,
      date: new Date().toISOString(),
      isFavorite: false,
    };

    setLetters([newEntry, ...letters]);
    setNewTitle('');
    setNewContent('');
    setIsCreating(false);

    try {
      confetti({ particleCount: 40, spread: 55, origin: { y: 0.6 } });
    } catch {}
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLetters(letters.map(l => l.id === id ? { ...l, isFavorite: !l.isFavorite } : l));
  };

  const deleteLetter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Hapus surat cinta ini?')) {
      setLetters(letters.filter(l => l.id !== id));
      if (activeLetter?.id === id) setActiveLetter(null);
    }
  };

  const filtered = letters.filter(l => {
    if (filterCategory === 'Semua') return true;
    if (filterCategory === 'Favorit') return l.isFavorite;
    return l.category === filterCategory;
  });

  return (
    <Card className="p-6 border-2 border-rose-200/90 dark:border-rose-900/40 bg-white dark:bg-[#0a0f1d] shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-100 dark:bg-rose-900/60 rounded-2xl text-rose-600 dark:text-rose-300">
            <Mail size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              Brankas Surat Cinta (Love Vault)
              <Sparkles size={16} className="text-amber-500" />
            </h2>
            <p className="text-xs text-[var(--tf-text-muted)] mt-0.5">
              Kumpulan surat manis, pesan rahasia, dan kenangan berdua yang tersimpan selamanya
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsCreating(true)}
          size="sm"
          className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs gap-1.5"
          icon={<Plus size={14} />}
        >
          Tulis Surat Baru 💌
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-6 text-xs">
        {['Semua', 'Favorit', 'Romantis', 'Semangat Belajar', 'Kangen', 'Minta Maaf/Manja', 'Janji Masa Depan'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterCategory === cat
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-100 dark:hover:bg-rose-950/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Letter Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <Mail size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">Belum ada surat di kategori ini.</p>
          </div>
        ) : (
          filtered.map(letter => (
            <div
              key={letter.id}
              onClick={() => setActiveLetter(letter)}
              className="p-4 rounded-2xl border-2 border-rose-100 dark:border-rose-900/30 bg-gradient-to-br from-rose-50/40 to-pink-50/20 dark:from-slate-900 dark:to-rose-950/20 hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-2xl p-1 bg-white dark:bg-slate-800 rounded-xl shadow-xs">
                    {letter.stamp}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => toggleFavorite(letter.id, e)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        letter.isFavorite ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' : 'text-slate-300 hover:text-amber-500'
                      }`}
                    >
                      <Star size={14} className={letter.isFavorite ? 'fill-amber-500' : ''} />
                    </button>
                    <button
                      onClick={(e) => deleteLetter(letter.id, e)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-rose-600 transition-colors">
                  {letter.title}
                </h3>
                <p className="text-xs text-[var(--tf-text-muted)] line-clamp-2 mt-1 leading-relaxed">
                  {letter.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-rose-100 dark:border-rose-900/30 flex items-center justify-between text-[11px]">
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {letter.sender} ➔ {letter.recipient}
                </span>
                <span className="text-slate-400">
                  {new Intl.DateTimeFormat('id-ID', { dateStyle: 'short' }).format(new Date(letter.date))}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: Tulis Surat Baru */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-rose-200 dark:border-rose-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Mail size={18} className="text-rose-500" /> Tulis Surat Cinta Baru
              </h3>
              <button onClick={() => setIsCreating(false)} className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">Pengirim</label>
                  <select
                    value={newSender}
                    onChange={(e) => setNewSender(e.target.value as 'Fathur' | 'Mazet')}
                    className="input h-10 text-xs w-full"
                  >
                    <option value="Fathur">Fathur (untuk Mazet)</option>
                    <option value="Mazet">Mazet (untuk Fathur)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">Kategori</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="input h-10 text-xs w-full"
                  >
                    <option value="Romantis">Romantis</option>
                    <option value="Semangat Belajar">Semangat Belajar</option>
                    <option value="Kangen">Kangen</option>
                    <option value="Minta Maaf/Manja">Minta Maaf/Manja</option>
                    <option value="Janji Masa Depan">Janji Masa Depan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">Pilih Cap Perangko</label>
                <div className="flex gap-2">
                  {['💌', '💖', '🧸', '🌸', '👑', '🎓', '✨'].map(emoji => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => setNewStamp(emoji)}
                      className={`text-xl p-2 rounded-xl border transition-all ${
                        newStamp === emoji ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 scale-110' : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">Judul Surat</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kangen kamu banget hari ini..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="input h-10 text-xs w-full"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">Isi Surat Manis</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Tuliskan ungkapan hatimu yang tulus dan manis di sini..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="input p-3 text-xs w-full rounded-2xl resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreating(false)}>
                  Batal
                </Button>
                <Button type="submit" size="sm" className="bg-rose-500 hover:bg-rose-600 text-white gap-1.5" icon={<Send size={14} />}>
                  Kirim & Simpan Surat
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Baca Surat (Vintage Love Letter Look) */}
      {activeLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#fff9f2] dark:bg-[#1a1412] text-slate-900 dark:text-[#fbeae0] rounded-3xl p-7 max-w-md w-full border-2 border-[#e8d5c4] dark:border-[#382620] shadow-2xl relative space-y-4">
            <button
              onClick={() => setActiveLetter(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-slate-400"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 border-b border-[#e8d5c4] dark:border-[#382620] pb-4">
              <span className="text-4xl">{activeLetter.stamp}</span>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-rose-500 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
                  {activeLetter.category}
                </span>
                <h3 className="font-black text-lg text-[#4a2e2b] dark:text-[#f3d3c4] mt-1">
                  {activeLetter.title}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date(activeLetter.date))}
                </p>
              </div>
            </div>

            <div className="py-2 text-sm leading-relaxed font-serif whitespace-pre-wrap text-[#2e1d1b] dark:text-[#edd1c2]">
              {activeLetter.content}
            </div>

            <div className="border-t border-[#e8d5c4] dark:border-[#382620] pt-4 flex items-center justify-between">
              <div className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <Heart size={14} className="fill-rose-500 text-rose-500" />
                Dari {activeLetter.sender} untuk {activeLetter.recipient}
              </div>
              <button
                onClick={() => setActiveLetter(null)}
                className="px-4 py-2 bg-[#4a2e2b] hover:bg-[#382220] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Tutup Surat
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
