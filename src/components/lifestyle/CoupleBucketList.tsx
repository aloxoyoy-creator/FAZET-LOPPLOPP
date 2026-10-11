import { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { CheckCircle2, Circle, Plus, Trash2, Heart, Sparkles, Filter, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface BucketItem {
  id: string;
  title: string;
  category: 'Traveling' | 'Kuliner' | 'Belajar & Karir' | 'Kencan Santai' | 'Masa Depan';
  targetDate?: string;
  notes?: string;
  completed: boolean;
  completedAt?: string;
}

const STORAGE_KEY = 'fazet_couple_bucket_list';

const INITIAL_BUCKET: BucketItem[] = [
  {
    id: 'b_1',
    title: 'Lolos bareng ke PTN impian & wisuda bareng',
    category: 'Belajar & Karir',
    targetDate: '2026-07-01',
    notes: 'Belajar konsisten setiap hari, saling semangatin terus!',
    completed: false,
  },
  {
    id: 'b_2',
    title: 'Photobox lucu berdua pakai baju senada',
    category: 'Kencan Santai',
    targetDate: '2025-12-31',
    notes: 'Simpan fotonya di dompet dan tempel di kamar.',
    completed: true,
    completedAt: '2024-11-20',
  },
  {
    id: 'b_3',
    title: 'Piknik sore di tepi pantai sambil nonton sunset',
    category: 'Traveling',
    targetDate: '2025-06-15',
    notes: 'Bawa cemilan favorit Mazet dan es teh manis.',
    completed: false,
  },
  {
    id: 'b_4',
    title: 'Kulineran malam nyobain sate & es krim kesukaan berdua',
    category: 'Kuliner',
    targetDate: '2025-04-10',
    notes: 'Jangan lupa foto makanan bareng.',
    completed: false,
  },
  {
    id: 'b_5',
    title: 'Membangun rumah impian yang hangat dan bahagia selamanya',
    category: 'Masa Depan',
    targetDate: '2030-01-01',
    notes: 'InsyaAllah dimudahkan jalan menuju pelaminan & hidup bersama.',
    completed: false,
  },
];

const CATEGORY_ICONS: Record<BucketItem['category'], string> = {
  'Traveling': '🏖️',
  'Kuliner': '🍽️',
  'Belajar & Karir': '🎓',
  'Kencan Santai': '🎬',
  'Masa Depan': '💍',
};

export default function CoupleBucketList() {
  const [items, setItems] = useState<BucketItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_BUCKET;
    } catch {
      return INITIAL_BUCKET;
    }
  });

  const [filter, setFilter] = useState<'Semua' | 'Belum' | 'Selesai'>('Semua');
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<BucketItem['category']>('Kencan Santai');
  const [newDate, setNewDate] = useState('');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save bucket list', e);
    }
  }, [items]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: BucketItem = {
      id: `b_${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      targetDate: newDate || undefined,
      notes: newNotes.trim() || undefined,
      completed: false,
    };

    setItems([newItem, ...items]);
    setNewTitle('');
    setNewNotes('');
    setNewDate('');
    setIsAdding(false);

    try {
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
    } catch {}
  };

  const toggleItem = (id: string) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const nextCompleted = !item.completed;
        if (nextCompleted) {
          try {
            confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
          } catch {}
        }
        return {
          ...item,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
        };
      }
      return item;
    }));
  };

  const deleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Hapus impian ini dari daftar?')) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const completedCount = items.filter(i => i.completed).length;
  const progressPercent = items.length ? Math.round((completedCount / items.length) * 100) : 0;

  const filtered = items.filter(item => {
    if (filter === 'Belum') return !item.completed;
    if (filter === 'Selesai') return item.completed;
    return true;
  });

  return (
    <Card className="p-6 border-2 border-rose-200/90 dark:border-rose-900/40 bg-white dark:bg-[#0a0f1d] shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 dark:bg-amber-950/60 rounded-2xl text-amber-600 dark:text-amber-300">
            <Sparkles size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              Wishlist & Impian Berdua (Bucket List)
              <Heart size={16} className="text-rose-500 fill-rose-500" />
            </h2>
            <p className="text-xs text-[var(--tf-text-muted)] mt-0.5">
              Daftar mimpi, target kencan, dan rencana masa depan yang akan diwujudkan bersama
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsAdding(!isAdding)}
          size="sm"
          className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs gap-1.5"
          icon={<Plus size={14} />}
        >
          Tambah Impian 🌟
        </Button>
      </div>

      {/* Progress Card */}
      <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 mb-6">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold text-amber-950 dark:text-amber-200">
            Progres Impian Terwujud
          </span>
          <span className="text-xs font-black text-amber-600 dark:text-amber-400">
            {completedCount} dari {items.length} impian ({progressPercent}%)
          </span>
        </div>
        <div className="h-2.5 w-full bg-amber-100 dark:bg-amber-900/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Form Tambah */}
      {isAdding && (
        <form onSubmit={handleAdd} className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Tulis Impian Baru Bersama
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold block mb-1">Judul Impian</label>
              <input
                type="text"
                required
                placeholder="Contoh: Nonton konser musisi favorit berdua..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="input h-10 text-xs w-full"
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Kategori</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="input h-10 text-xs w-full"
              >
                <option value="Kencan Santai">🎬 Kencan Santai</option>
                <option value="Traveling">🏖️ Traveling & Liburan</option>
                <option value="Kuliner">🍽️ Wisata Kuliner</option>
                <option value="Belajar & Karir">🎓 Belajar & Karir</option>
                <option value="Masa Depan">💍 Impian Masa Depan</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold block mb-1">Target Waktu (Opsional)</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="input h-10 text-xs w-full"
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Catatan Tambahan (Opsional)</label>
              <input
                type="text"
                placeholder="Detail tempat, rencana, atau persiapan..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="input h-10 text-xs w-full"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(false)}>
              Batal
            </Button>
            <Button type="submit" size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
              Simpan Impian ✨
            </Button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4 text-xs">
        <Filter size={13} className="text-slate-400" />
        {(['Semua', 'Belum', 'Selesai'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filter === tab
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Sparkles size={28} className="mx-auto mb-2 opacity-50" />
            <p className="text-xs font-semibold">Tidak ada impian dalam kategori ini.</p>
          </div>
        ) : (
          filtered.map(item => (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`p-3.5 rounded-2xl border-2 transition-all flex items-start justify-between gap-3 cursor-pointer group ${
                item.completed
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-slate-500 dark:text-slate-400'
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-amber-300'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <button
                  type="button"
                  className="mt-0.5 shrink-0 text-emerald-600 hover:scale-110 transition-transform"
                >
                  {item.completed ? (
                    <CheckCircle2 size={20} className="fill-emerald-500 text-white" />
                  ) : (
                    <Circle size={20} className="text-slate-300" />
                  )}
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm shrink-0">
                      {CATEGORY_ICONS[item.category]}
                    </span>
                    <h3 className={`text-xs font-bold leading-relaxed ${item.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                      {item.title}
                    </h3>
                  </div>

                  {item.notes && (
                    <p className="text-[11px] text-[var(--tf-text-muted)] mt-1 pl-6">
                      {item.notes}
                    </p>
                  )}

                  {item.targetDate && (
                    <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-1.5 pl-6">
                      <Calendar size={11} /> Target: {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(`${item.targetDate}T00:00:00`))}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => deleteItem(item.id, e)}
                className="shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
