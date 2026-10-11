import { useState, useEffect, useMemo } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { 
  ClipboardList, Search, Filter, CheckCircle2, Clock, AlertTriangle, 
  FileText, Download, Calendar, Sparkles, ExternalLink, RefreshCw, 
  X, Check, Flame, ArrowUpRight, BookOpen, User, Tag
} from 'lucide-react';
import { loadTasks, updateTask, completeTask, subscribeAllTasks } from '../../services/taskService';
import type { Task, TaskStatus, Priority } from '../../types';
import { formatDate, formatDateTime, isOverdue } from '../../lib/utils';
import { useToast } from '../ui/Toast';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';

interface Props {
  userId?: string;
  isMazetView: boolean;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; tone: string; icon: string }> = {
  urgent: { label: 'Urgent', tone: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200', icon: '🔥' },
  high: { label: 'Tinggi', tone: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200', icon: '⚡' },
  medium: { label: 'Sedang', tone: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200', icon: '🔷' },
  low: { label: 'Rendah', tone: 'text-slate-600 bg-slate-100 dark:bg-slate-800 border-slate-200', icon: '🔹' },
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; tone: string }> = {
  completed: { label: 'Selesai', tone: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300' },
  in_progress: { label: 'Dikerjakan', tone: 'text-violet-700 bg-violet-50 dark:bg-violet-950/40 border-violet-300' },
  pending: { label: 'Tertunda', tone: 'text-blue-700 bg-blue-50 dark:bg-blue-950/40 border-blue-300' },
  overdue: { label: 'Terlambat', tone: 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 border-rose-300' },
  submitted: { label: 'Terkirim', tone: 'text-teal-700 bg-teal-50 dark:bg-teal-950/40 border-teal-300' },
};

export default function MazetTaskHistory({ userId, isMazetView }: Props) {
  const { push } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'deadline' | 'priority'>('newest');
  const [detailTask, setDetailTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // Ambil tugas dari workspace mazet
      const mazetTasks = await loadTasks(undefined, 'mazet');
      setTasks(mazetTasks);
    } catch (err: any) {
      console.error('Failed to load Mazet tasks', err);
      push({ tone: 'error', title: 'Gagal memuat tugas Mazet', message: err?.message || 'Terjadi kesalahan sistem' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTasks();
    const unsub = subscribeAllTasks('mazet', (updated) => {
      setTasks(updated);
    });
    return () => {
      unsub();
    };
  }, []);

  // Normalisasi tugas
  const normalizedTasks = useMemo(() => {
    return tasks.map(t => (isOverdue(t) && t.status !== 'completed' ? { ...t, status: 'overdue' as const } : t));
  }, [tasks]);

  // Statistik
  const stats = useMemo(() => {
    const total = normalizedTasks.length;
    const completed = normalizedTasks.filter(t => t.status === 'completed').length;
    const inProgress = normalizedTasks.filter(t => t.status === 'in_progress').length;
    const pending = normalizedTasks.filter(t => t.status === 'pending').length;
    const overdue = normalizedTasks.filter(t => t.status === 'overdue').length;
    const rate = total ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, pending, overdue, rate };
  }, [normalizedTasks]);

  // Daftar Mata Kuliah Unik
  const subjects = useMemo(() => {
    const list = new Set<string>();
    normalizedTasks.forEach(t => {
      if (t.subjectName) list.add(t.subjectName);
    });
    return Array.from(list);
  }, [normalizedTasks]);

  // Filter & Sort
  const filteredTasks = useMemo(() => {
    return normalizedTasks.filter(task => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        task.title.toLowerCase().includes(q) || 
        task.description.toLowerCase().includes(q) ||
        (task.subjectName && task.subjectName.toLowerCase().includes(q)) ||
        (task.teacherName && task.teacherName.toLowerCase().includes(q));

      // Status
      const matchStatus = statusFilter === 'all' || task.status === statusFilter;

      // Priority
      const matchPriority = priorityFilter === 'all' || task.priority === priorityFilter;

      // Subject
      const matchSubject = subjectFilter === 'all' || task.subjectName === subjectFilter;

      return matchSearch && matchStatus && matchPriority && matchSubject;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortBy === 'deadline') {
        const timeA = a.dueAt ? new Date(a.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
        const timeB = b.dueAt ? new Date(b.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
        return timeA - timeB;
      }
      if (sortBy === 'priority') {
        const order: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        return order[b.priority] - order[a.priority];
      }
      return 0;
    });
  }, [normalizedTasks, searchQuery, statusFilter, priorityFilter, subjectFilter, sortBy]);

  const handleToggleComplete = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (task.status === 'completed') {
        await updateTask(task.id, { status: 'pending', completedAt: null });
        push({ tone: 'info', title: 'Status Diperbarui', message: 'Tugas ditandai belum selesai.' });
      } else {
        await completeTask(task.id);
        push({ tone: 'success', title: 'Tugas Selesai! 🎉', message: 'Hebat, tugas berhasil diselesaikan!' });
        try {
          confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
        } catch {}
      }
      void fetchTasks();
    } catch (err: any) {
      push({ tone: 'error', title: 'Gagal memperbarui status', message: err?.message || 'Error' });
    }
  };

  return (
    <Card className="p-6 border-2 border-rose-200/90 dark:border-rose-900/40 bg-white dark:bg-[#0a0f1d] shadow-sm space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-rose-100 dark:border-rose-900/30 pb-5">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl text-white shadow-md shadow-rose-500/20 shrink-0">
            <ClipboardList size={24} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Daftar Tugas Kuliah & Akademik Mazet
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                Workspace Mazet
              </span>
            </div>
            <p className="text-xs text-[var(--tf-text-muted)] mt-1">
              Seluruh arsip tugas yang pernah ditambahkan Mazet ke dalam sistem, lengkap dengan deadline, file, dan status pengerjaan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchTasks}
            loading={loading}
            icon={<RefreshCw size={14} />}
            className="text-xs"
          >
            Refresh Data
          </Button>
          <Link
            to="/tasks"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-xs transition-all"
          >
            Buka Halaman Tugas <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Tugas</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{stats.total}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Selesai</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.completed}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">Dikerjakan</div>
          <div className="text-2xl font-black text-violet-600 dark:text-violet-400 mt-0.5">{stats.inProgress}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Tertunda</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">{stats.pending}</div>
        </div>
        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Terlambat</div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5">{stats.overdue}</div>
        </div>
      </div>

      {/* Completion Progress Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50/80 via-pink-50/60 to-purple-50/60 dark:from-rose-950/30 dark:via-pink-950/20 dark:to-purple-950/20 border border-rose-100 dark:border-rose-900/30">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className="text-rose-950 dark:text-rose-200 flex items-center gap-1.5">
            <Sparkles size={14} className="text-rose-500" /> Rasio Penyelesaian Tugas Kuliah
          </span>
          <span className="text-rose-600 dark:text-rose-400 font-mono text-sm">
            {stats.rate}% Tercapai
          </span>
        </div>
        <div className="h-2.5 w-full bg-rose-100 dark:bg-rose-900/40 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-700" 
            style={{ width: `${stats.rate}%` }} 
          />
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {/* Search */}
        <div className="lg:col-span-2 relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari tugas, matkul, dosen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input h-10 pl-9 text-xs w-full rounded-xl"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input h-10 text-xs w-full rounded-xl"
          >
            <option value="all">Semua Status</option>
            <option value="completed">✓ Selesai</option>
            <option value="in_progress">⏳ Dikerjakan</option>
            <option value="pending">⚪ Tertunda</option>
            <option value="overdue">⚠️ Terlambat</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input h-10 text-xs w-full rounded-xl"
          >
            <option value="all">Semua Prioritas</option>
            <option value="urgent">🔥 Urgent</option>
            <option value="high">⚡ Tinggi</option>
            <option value="medium">🔷 Sedang</option>
            <option value="low">🔹 Rendah</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="input h-10 text-xs w-full rounded-xl"
          >
            <option value="newest">Ditambahkan Terbaru</option>
            <option value="oldest">Ditambahkan Terlama</option>
            <option value="deadline">Deadline Terdekat</option>
            <option value="priority">Prioritas Tertinggi</option>
          </select>
        </div>
      </div>

      {/* Subject Tags Filter (If any) */}
      {subjects.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
            <BookOpen size={12} /> Matkul:
          </span>
          <button
            onClick={() => setSubjectFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              subjectFilter === 'all'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50'
            }`}
          >
            Semua
          </button>
          {subjects.map(s => (
            <button
              key={s}
              onClick={() => setSubjectFilter(s)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                subjectFilter === s
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-3 pt-2">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-rose-500" />
            <p className="text-xs font-semibold">Memuat daftar tugas Mazet...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <ClipboardList size={36} className="mx-auto mb-2 opacity-40 text-rose-400" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
              Tidak ada tugas yang sesuai filter.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Coba reset pencarian atau periksa status tugas lainnya.
            </p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
            const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
            const isCompleted = task.status === 'completed';

            return (
              <div
                key={task.id}
                onClick={() => setDetailTask(task)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isCompleted
                    ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-75'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-md'
                }`}
              >
                {/* Left: Checkbox & Info */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={(e) => handleToggleComplete(task, e)}
                    className="mt-0.5 shrink-0 text-slate-300 hover:text-emerald-600 transition-colors"
                    title={isCompleted ? 'Tandai belum selesai' : 'Tandai selesai'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={22} className="text-emerald-500 fill-emerald-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-emerald-500 transition-colors" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className={`text-sm font-extrabold truncate ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {task.title}
                      </h3>
                      {task.subjectName && (
                        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-100 dark:border-rose-900">
                          {task.subjectName}
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${priority.tone}`}>
                        {priority.icon} {priority.label}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${status.tone}`}>
                        {status.label}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-[var(--tf-text-muted)] line-clamp-1 mb-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-slate-400" />
                        Ditambahkan: {task.createdAt ? formatDateTime(task.createdAt) : 'Tersimpan'}
                      </span>
                      {task.dueDate && (
                        <span className="flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                          <Calendar size={12} />
                          Deadline: {formatDate(task.dueDate)} {task.dueTime ? `(${task.dueTime} WIB)` : ''}
                        </span>
                      )}
                      {task.fileName && (
                        <span className="flex items-center gap-1 text-blue-500 font-semibold">
                          <FileText size={12} /> {task.fileName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailTask(task);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
                  >
                    Detail
                  </button>
                  <Link
                    to={`/tasks/${task.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Buka Halaman Tugas"
                  >
                    <ExternalLink size={15} />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL DETAIL TUGAS MAZET */}
      {detailTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                  Detail Tugas Kuliah
                </span>
                <h3 className="font-black text-lg text-slate-900 dark:text-white mt-1">
                  {detailTask.title}
                </h3>
              </div>
              <button 
                onClick={() => setDetailTask(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            {/* Badges Info */}
            <div className="flex flex-wrap gap-2 text-xs">
              {detailTask.subjectName && (
                <Badge tone="purple"><BookOpen size={12} className="mr-1" /> {detailTask.subjectName}</Badge>
              )}
              {detailTask.teacherName && (
                <Badge tone="blue"><User size={12} className="mr-1" /> Dosen: {detailTask.teacherName}</Badge>
              )}
              <Badge tone={detailTask.priority === 'urgent' ? 'red' : 'amber'}>
                {detailTask.priority.toUpperCase()}
              </Badge>
              <Badge tone={detailTask.status === 'completed' ? 'green' : 'blue'}>
                Status: {detailTask.status}
              </Badge>
            </div>

            {/* Deskripsi */}
            {detailTask.description && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Deskripsi Tugas:</div>
                <div className="whitespace-pre-wrap">{detailTask.description}</div>
              </div>
            )}

            {/* Catatan Tambahan */}
            {detailTask.notes && (
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-950 dark:text-amber-200">
                <div className="font-bold mb-1">Catatan dari Mazet:</div>
                <p>{detailTask.notes}</p>
              </div>
            )}

            {/* File Lampiran */}
            {detailTask.fileName && (
              <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-950 dark:text-blue-200">
                  <FileText size={16} className="text-blue-600" />
                  <span className="truncate max-w-[200px]">{detailTask.fileName}</span>
                </div>
                {detailTask.fileUrl && (
                  <a
                    href={detailTask.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                  >
                    <Download size={12} /> Unduh File
                  </a>
                )}
              </div>
            )}

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
              <div>
                <strong>Ditambahkan:</strong> {detailTask.createdAt ? formatDateTime(detailTask.createdAt) : '-'}
              </div>
              <div>
                <strong>Tenggat Waktu:</strong> {detailTask.dueDate ? `${formatDate(detailTask.dueDate)} ${detailTask.dueTime || ''}` : '-'}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={(e) => {
                  handleToggleComplete(detailTask, e);
                  setDetailTask(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  detailTask.status === 'completed'
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                }`}
              >
                {detailTask.status === 'completed' ? 'Tandai Belum Selesai' : '✓ Tandai Tugas Selesai'}
              </button>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setDetailTask(null)}>
                  Tutup
                </Button>
                <Link
                  to={`/tasks/${detailTask.id}`}
                  className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl"
                >
                  Buka Halaman Tugas
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
