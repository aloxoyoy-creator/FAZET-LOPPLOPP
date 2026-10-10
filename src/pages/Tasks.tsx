import { 
  Search, SlidersHorizontal, Plus, X, LayoutGrid, Rows3, 
  Kanban, CheckCircle2, Clock, AlertTriangle, ListTodo, Sparkles 
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { cn, relativeDeadline } from '../lib/utils';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Task } from '../types';

export default function Tasks() {
  const { tasks, loading } = useTasks();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string>(
    new URLSearchParams(location.search).get('status') || 'all'
  );
  const [priority, setPriority] = useState<string>('all');
  const [sort, setSort] = useState<string>('nearest');
  const [showFilter, setShowFilter] = useState(false);
  const [view, setView] = useState<'grid' | 'compact' | 'kanban'>('grid');
  const [subject, setSubject] = useState<string>('all');

  useEffect(() => {
    if (new URLSearchParams(location.search).get('new') === '1') {
      setEditing(null);
      setOpen(true);
    }
  }, [location.search]);

  // Keyboard shortcut: press 'n' to open task form
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        e.key.toLowerCase() === 'n' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        target?.tagName !== 'INPUT' &&
        target?.tagName !== 'TEXTAREA' &&
        target?.tagName !== 'SELECT'
      ) {
        e.preventDefault();
        setEditing(null);
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const subjects = useMemo(() => {
    return [...new Set(tasks.map((t) => t.subjectName).filter(Boolean))];
  }, [tasks]);

  // KPI Statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const overdue = tasks.filter((t) => relativeDeadline(t) === 'Terlambat' && t.status !== 'completed').length;
    return { total, completed, inProgress, overdue };
  }, [tasks]);

  const filtered = useMemo(() => {
    const arr = tasks.filter((t) => {
      const text = `${t.title} ${t.description} ${t.subjectName} ${t.teacherName}`.toLowerCase();
      const statusOk = status === 'all' || t.status === status;
      const priorityOk = priority === 'all' || t.priority === priority;
      const subjectOk = subject === 'all' || t.subjectName === subject;
      return text.includes(q.toLowerCase()) && statusOk && priorityOk && subjectOk;
    });

    return arr.sort((a, b) => {
      const da = new Date(`${a.dueDate}T${a.dueTime}`).getTime();
      const db = new Date(`${b.dueDate}T${b.dueTime}`).getTime();
      if (sort === 'nearest') return da - db;
      if (sort === 'farthest') return db - da;
      const ca = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const cb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sort === 'newest' ? cb - ca : ca - cb;
    });
  }, [tasks, q, status, priority, subject, sort]);

  // Grouped for Kanban
  const kanbanColumns = useMemo(() => {
    return [
      { id: 'pending', title: 'Belum Selesai', color: 'border-amber-400 bg-amber-50/30 dark:bg-amber-950/10' },
      { id: 'in_progress', title: 'Sedang Dikerjakan', color: 'border-blue-400 bg-blue-50/30 dark:bg-blue-950/10' },
      { id: 'submitted', title: 'Dikumpulkan', color: 'border-purple-400 bg-purple-50/30 dark:bg-purple-950/10' },
      { id: 'completed', title: 'Selesai', color: 'border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/10' }
    ].map((col) => ({
      ...col,
      items: filtered.filter((t) => t.status === col.id)
    }));
  }, [filtered]);

  return (
    <div className="space-y-6 fade-up pb-24">
      {/* Header Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-[var(--tf-border)] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <ListTodo size={20} />
            </span>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Manajemen Tugas</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Kelola deadline pelajaran, pantau progres, dan selesaikan tugas tepat waktu
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} icon={<Plus size={17} />}>
          Tambah Tugas
        </Button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f1219]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tugas</span>
            <ListTodo size={16} className="text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</div>
        </Card>

        <Card className="p-4 border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/40 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Selesai</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-800 dark:text-emerald-300 mt-1">{stats.completed}</div>
        </Card>

        <Card className="p-4 border-blue-100 dark:border-blue-900/30 bg-blue-50/40 dark:bg-blue-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Dikerjakan</span>
            <Clock size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-800 dark:text-blue-300 mt-1">{stats.inProgress}</div>
        </Card>

        <Card className="p-4 border-rose-100 dark:border-rose-900/30 bg-rose-50/40 dark:bg-rose-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Terlambat</span>
            <AlertTriangle size={16} className="text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-800 dark:text-rose-300 mt-1">{stats.overdue}</div>
        </Card>
      </div>

      {/* Search and View Controls */}
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            className="input pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari tugas, materi, mata pelajaran, atau nama guru..."
          />
        </div>

        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            icon={<SlidersHorizontal size={16} />}
            onClick={() => setShowFilter(!showFilter)}
            className={showFilter ? 'border-blue-500 text-blue-600' : ''}
          >
            Filter
          </Button>

          {/* View Mode Buttons */}
          <div className="flex rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1">
            <button
              className={`p-2 rounded-lg text-xs font-bold transition-colors ${
                view === 'grid' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              onClick={() => setView('grid')}
              title="Tampilan Grid"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className={`p-2 rounded-lg text-xs font-bold transition-colors ${
                view === 'compact' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              onClick={() => setView('compact')}
              title="Tampilan List"
            >
              <Rows3 size={16} />
            </button>
            <button
              className={`p-2 rounded-lg text-xs font-bold transition-colors ${
                view === 'kanban' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              onClick={() => setView('kanban')}
              title="Tampilan Kanban Board"
            >
              <Kanban size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1219] p-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Status</label>
                <select className="input bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="all">Semua status</option>
                  <option value="pending">Belum selesai</option>
                  <option value="in_progress">Dikerjakan</option>
                  <option value="submitted">Dikumpulkan</option>
                  <option value="completed">Selesai</option>
                  <option value="overdue">Terlambat</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Mata Pelajaran</label>
                <select className="input bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" value={subject} onChange={(e) => setSubject(e.target.value)}>
                  <option value="all">Semua mapel</option>
                  {subjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Prioritas</label>
                <select className="input bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="all">Semua prioritas</option>
                  <option value="urgent">Mendesak 🔥</option>
                  <option value="high">Tinggi ⚡</option>
                  <option value="medium">Sedang 📌</option>
                  <option value="low">Santai 🍃</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Urutan</label>
                <select className="input bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="nearest">Deadline terdekat</option>
                  <option value="farthest">Deadline terjauh</option>
                  <option value="newest">Terbaru ditambahkan</option>
                  <option value="oldest">Terlama</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Indicator */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
        <span>Menampilkan {filtered.length} dari {tasks.length} tugas</span>
        {(q || status !== 'all' || priority !== 'all' || subject !== 'all') && (
          <button
            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold hover:underline"
            onClick={() => {
              setQ('');
              setStatus('all');
              setPriority('all');
              setSubject('all');
            }}
          >
            Reset Filter <X size={13} />
          </button>
        )}
      </div>

      {/* Content Rendering based on View */}
      {loading ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <div className="h-40 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-40 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-40 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Tidak ada tugas ditemukan"
          description={tasks.length ? 'Coba ubah kata kunci pencarian atau sesuaikan filternya.' : 'Belum ada tugas yang ditambahkan. Mulai catat tugas pertamamu!'}
          action={<Button onClick={() => setOpen(true)} icon={<Plus size={16} />}>Tambah Tugas</Button>}
        />
      ) : view === 'kanban' ? (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {kanbanColumns.map((col) => (
            <div key={col.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 p-3 space-y-3 min-h-[300px]">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 px-1">
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">{col.title}</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {col.items.length}
                </span>
              </div>

              <div className="space-y-3">
                {col.items.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 italic">
                    Kosong
                  </div>
                ) : (
                  col.items.map((t) => (
                    <div
                      key={t.id}
                      onDoubleClick={() => { setEditing(t); setOpen(true); }}
                      className="cursor-pointer"
                    >
                      <TaskCard task={t} />
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      ) : view === 'grid' ? (
        /* Grid View */
        <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              onDoubleClick={() => { setEditing(t); setOpen(true); }}
            >
              <TaskCard task={t} />
            </motion.div>
          ))}
        </div>
      ) : (
        /* Compact List View */
        <div className="space-y-2">
          {filtered.map((t) => (
            <div
              key={t.id}
              onDoubleClick={() => { setEditing(t); setOpen(true); }}
              className="cursor-pointer"
            >
              <TaskCard task={t} />
            </div>
          ))}
        </div>
      )}

      {/* Task Modal Dialog */}
      <TaskForm
        open={open}
        initial={editing}
        onClose={() => setOpen(false)}
        onSaved={() => setOpen(false)}
      />

      <div className={cn('text-center text-[11px] text-slate-400 pt-4', filtered.length ? 'opacity-100' : 'opacity-0')}>
        💡 Tip: Klik dua kali kartu tugas untuk mengedit • Tekan tombol <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border font-mono">N</kbd> untuk membuat tugas baru.
      </div>
    </div>
  );
}
