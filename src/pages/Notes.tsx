import { useEffect, useMemo, useRef, useState } from 'react';
import { 
  Paperclip, Pin, PinOff, Plus, Save, Trash2, X, FileText, 
  Image as ImageIcon, Search, Copy, Check, Hash, Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { hapticSuccess, hapticWarning } from '../lib/native';
import {
  attachFileToNote,
  createNote,
  removeNote,
  removeNoteAttachment,
  subscribeNotes,
  updateNote,
  type Note,
} from '../services/notesService';
import { useToast } from '../components/ui/Toast';

function formatSize(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(type?: string) {
  return !!type && type.startsWith('image/');
}

export default function Notes() {
  const { user, profile } = useAuth();
  const { workspaceId, workspace } = useWorkspace();
  const { push } = useToast();

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsubscribe = subscribeNotes(
      user.id,
      (list) => {
        setNotes(list);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsubscribe;
  }, [user]);

  const active = useMemo(() => notes.find((n) => n.id === activeId) ?? null, [notes, activeId]);

  useEffect(() => {
    setTitle(active?.title ?? '');
    setContent(active?.content ?? '');
    setPendingFile(null);
  }, [active]);

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const q = searchQ.toLowerCase();
      return (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q);
    });
  }, [notes, searchQ]);

  // Statistics: Word count, character count, read time
  const stats = useMemo(() => {
    const chars = content.length;
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const readMinutes = Math.max(1, Math.ceil(words / 200));
    return { chars, words, readMinutes };
  }, [content]);

  function startNewNote() {
    setActiveId(null);
    setTitle('');
    setContent('');
    setPendingFile(null);
  }

  async function handleSave() {
    if (!user || (!title.trim() && !content.trim() && !pendingFile)) return;
    setSaving(true);
    try {
      if (active) {
        await updateNote(active.id, { title: title.trim(), content });
        if (pendingFile) await attachFileToNote(active.id, user.id, pendingFile);
        push({ tone: 'success', title: 'Catatan Diperbarui', message: 'Perubahan tersimpan dengan aman.' });
      } else {
        const created = await createNote({
          title: title.trim() || 'Tanpa judul',
          content,
          createdBy: user.id,
          createdByName: profile?.name || user.email || 'Pengguna',
          workspaceId,
          file: pendingFile ?? undefined,
        });
        setActiveId(created.id);
        push({ tone: 'success', title: 'Catatan Dibuat', message: 'Catatan baru berhasil ditambahkan.' });
      }
      setPendingFile(null);
      void hapticSuccess();
    } catch {
      push({ tone: 'error', title: 'Gagal Menyimpan', message: 'Terjadi kesalahan saat menyimpan catatan.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePin(note: Note) {
    await updateNote(note.id, { pinned: !note.pinned });
  }

  async function handleDelete(note: Note) {
    if (!confirm(`Hapus catatan "${note.title || 'Tanpa judul'}"?`)) return;
    void hapticWarning();
    await removeNote(note.id);
    if (activeId === note.id) startNewNote();
    push({ tone: 'info', title: 'Catatan Dihapus' });
  }

  async function handleRemoveAttachment() {
    if (!active) return;
    await removeNoteAttachment(active.id);
  }

  const handleCopyNote = async () => {
    const fullText = `${title}\n\n${content}`.trim();
    if (!fullText) return;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      push({ tone: 'success', title: 'Tersalin', message: 'Isi catatan berhasil disalin ke clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      push({ tone: 'error', title: 'Gagal Menyalin' });
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col gap-4 p-4 md:flex-row md:p-6 pb-24">
      {/* Sidebar List */}
      <aside className="flex w-full flex-col gap-3 md:w-80 md:shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-slate-900 dark:text-white">Catatan</h1>
            <p className="text-xs text-slate-400 capitalize">Workspace {workspace.name}</p>
          </div>
          <button
            type="button"
            onClick={startNewNote}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm"
          >
            <Plus size={15} /> Catatan Baru
          </button>
        </div>

        {/* Search Notes */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Cari judul / isi catatan..."
            className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border-none outline-none text-slate-800 dark:text-slate-200"
          />
          {searchQ && (
            <button onClick={() => setSearchQ('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto md:max-h-[calc(100vh-220px)] hide-scrollbar">
          {loading && <p className="text-xs text-slate-400 p-2">Memuat catatan…</p>}
          {!loading && filteredNotes.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-4 text-xs text-slate-400 text-center">
              {searchQ ? 'Tidak ada catatan yang cocok.' : 'Belum ada catatan. Klik "Catatan Baru" untuk mulai menulis.'}
            </p>
          )}
          {filteredNotes.map((note) => (
            <button
              key={note.id}
              type="button"
              onClick={() => setActiveId(note.id)}
              className={`w-full rounded-2xl border p-3.5 text-left transition ${
                activeId === note.id 
                  ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/30 dark:border-indigo-500' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1219] hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-1.5 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  {note.pinned && <Pin size={12} className="shrink-0 text-amber-500" />}
                  <p className="truncate text-xs font-black text-slate-900 dark:text-white">
                    {note.title || 'Tanpa judul'}
                  </p>
                </div>
              </div>
              <p className="line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">
                {note.content || 'Tidak ada isi'}
              </p>
              {note.fileName && (
                <p className="mt-2 flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                  <Paperclip size={10} /> {note.fileName}
                </p>
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* Editor Main Section */}
      <section className="flex flex-1 flex-col gap-3 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1219] p-5 md:p-7 shadow-sm">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul catatan..."
            className="w-full border-none text-xl font-black text-slate-900 dark:text-white outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 bg-transparent"
          />
          <div className="flex shrink-0 items-center gap-1.5">
            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopyNote}
              className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Salin isi catatan"
            >
              {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
            </button>

            {active && (
              <>
                <button
                  type="button"
                  onClick={() => handleTogglePin(active)}
                  className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title={active.pinned ? 'Lepas pin' : 'Pin catatan'}
                >
                  {active.pinned ? <PinOff size={16} /> : <Pin size={16} />}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(active)}
                  className="grid h-9 w-9 place-items-center rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                  title="Hapus catatan"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Textarea */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tulis ide, materi pelajaran, catatan tugas, atau hal penting di sini…"
          className="min-h-[280px] flex-1 resize-none border-none text-sm leading-relaxed text-slate-800 dark:text-slate-200 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 bg-transparent"
        />

        {/* Attachment Preview */}
        {(active?.fileUrl || pendingFile) && (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-3">
            {isImage(pendingFile?.type ?? active?.fileType) ? (
              <ImageIcon size={20} className="text-slate-400" />
            ) : (
              <FileText size={20} className="text-slate-400" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-700 dark:text-slate-300">
                {pendingFile?.name ?? active?.fileName}
              </p>
              <p className="text-[10px] text-slate-400">
                {pendingFile ? `${formatSize(pendingFile.size)} · Siap disimpan` : formatSize(active?.fileSize)}
              </p>
            </div>
            {active?.fileUrl && isImage(active.fileType) && (
              <img src={active.fileUrl} alt={active.fileName} className="h-12 w-12 rounded-xl object-cover" />
            )}
            <button
              type="button"
              onClick={() => (pendingFile ? setPendingFile(null) : handleRemoveAttachment())}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              title="Hapus lampiran"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Stats and Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-semibold">
            <span className="flex items-center gap-1">
              <Hash size={12} /> {stats.words} kata ({stats.chars} karakter)
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} /> ~{stats.readMinutes} mnt baca
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Paperclip size={14} /> Lampirkan File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              className="hidden"
              onChange={(e) => setPendingFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-black text-white shadow-sm disabled:opacity-50"
            >
              <Save size={14} /> {saving ? 'Menyimpan…' : 'Simpan Catatan'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
