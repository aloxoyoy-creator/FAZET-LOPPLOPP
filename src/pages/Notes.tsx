import { useEffect, useMemo, useRef, useState } from 'react';
import { 
  Paperclip, Pin, PinOff, Plus, Save, Trash2, X, FileText, 
  Image as ImageIcon, Search, Copy, Check, Hash, Clock,
  Sparkles, Wand2, Download, ListChecks, Bold, Heading1, List, HelpCircle, Loader2
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
import { askAiAssistant } from '../services/aiAssistantService';
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

const NOTE_TEMPLATES = [
  {
    id: 'materi',
    label: 'Ringkasan Materi',
    title: 'Ringkasan Materi: ',
    body: `## Konsep Utama\n- \n- \n\n## Rumus / Poin Penting\n1. \n2. \n\n## Pertanyaan / Hal yang Perlu Diulas\n- [ ] `,
  },
  {
    id: 'checklist',
    label: 'Target & Checklist',
    title: 'Target & Checklist Hari Ini',
    body: `## Fokus Utama\n- [ ] Prioritas 1: \n- [ ] Prioritas 2: \n- [ ] Prioritas 3: \n\n## Catatan Tambahan\n- `,
  },
  {
    id: 'jurnal',
    label: 'Ide & Evaluasi',
    title: 'Jurnal & Ide Proyek',
    body: `## Ide / Gagasan Utama\n\n\n## Langkah Eksekusi\n1. \n2. \n\n## Evaluasi\n- `,
  },
];

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
  const [filterMode, setFilterMode] = useState<'all' | 'pinned'>('all');
  const [copied, setCopied] = useState(false);
  const [aiBusy, setAiBusy] = useState<'summarize' | 'polish' | 'quiz' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      if (filterMode === 'pinned' && !n.pinned) return false;
      const q = searchQ.toLowerCase();
      return (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q);
    });
  }, [notes, searchQ, filterMode]);

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

  function applyTemplate(tpl: typeof NOTE_TEMPLATES[number]) {
    if (!title.trim()) setTitle(tpl.title);
    setContent((prev) => (prev.trim() ? `${prev.trim()}\n\n${tpl.body}` : tpl.body));
    void hapticSuccess();
  }

  function insertSnippet(snippet: string) {
    const el = textareaRef.current;
    if (!el) {
      setContent((prev) => `${prev}${snippet}`);
      return;
    }
    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const selected = content.slice(start, end);
    let replacement = snippet;
    if (snippet === '**teks tebal**' && selected) {
      replacement = `**${selected}**`;
    }
    const next = `${content.slice(0, start)}${replacement}${content.slice(end)}`;
    setContent(next);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 10);
  }

  async function runAiAction(mode: 'summarize' | 'polish' | 'quiz') {
    if (!content.trim() || aiBusy) {
      push({ tone: 'warning', title: 'Catatan Kosong', message: 'Tulis minimal beberapa kalimat terlebih dahulu.' });
      return;
    }
    setAiBusy(mode);
    try {
      const promptMap = {
        summarize: `Ringkas catatan berikut menjadi poin-poin inti yang sangat jelas, padat, dan mudah dihafal dalam Bahasa Indonesia:\n\nJudul: ${title || 'Catatan'}\nIsi:\n${content}`,
        polish: `Rapikan, perjelas struktur kalimat, dan beri format subjudul/poin yang rapi untuk catatan berikut tanpa menghilangkan informasi pentingnya (gunakan Bahasa Indonesia):\n\nJudul: ${title || 'Catatan'}\nIsi:\n${content}`,
        quiz: `Buatlah 3 soal latihan pemahaman beserta kunci jawaban singkat berdasarkan isi catatan berikut:\n\nJudul: ${title || 'Catatan'}\nIsi:\n${content}`,
      };
      const result = await askAiAssistant({
        prompt: promptMap[mode],
        workspace: workspaceId,
      });
      const sectionHeader =
        mode === 'summarize'
          ? '### Ringkasan Inti (FAZET AI)'
          : mode === 'polish'
          ? '### Versi Terstruktur (FAZET AI)'
          : '### Latihan Kuis Mandiri (FAZET AI)';
      setContent((prev) => `${prev.trim()}\n\n---\n${sectionHeader}\n${result.trim()}\n`);
      void hapticSuccess();
      push({
        tone: 'success',
        title: 'AI Selesai Memproses',
        message: 'Hasil analisis telah ditambahkan di bagian bawah catatan.',
      });
    } catch (err) {
      push({
        tone: 'error',
        title: 'AI Tidak Tersedia',
        message: err instanceof Error ? err.message : 'Gagal memproses catatan dengan AI.',
      });
    } finally {
      setAiBusy(null);
    }
  }

  function handleDownloadNote() {
    const fullText = `# ${title || 'Catatan Tanpa Judul'}\n\n${content}`.trim();
    if (!fullText) return;
    const blob = new Blob([fullText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = (title || 'catatan-fazet').toLowerCase().replace(/[^a-z0-9-_]+/g, '-');
    link.href = url;
    link.setAttribute('download', `${safeName}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    push({ tone: 'success', title: 'Catatan Diunduh', message: `File ${safeName}.md berhasil disimpan.` });
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
            <h1 className="text-lg font-black text-slate-900 dark:text-white">Smart Notes Studio</h1>
            <p className="text-xs text-slate-400 capitalize">Workspace {workspace.name} • {notes.length} catatan</p>
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

        {/* Filter Tabs (Semua vs Dipin) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition ${
              filterMode === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800/70 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Semua ({notes.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('pinned')}
            className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold inline-flex items-center justify-center gap-1 transition ${
              filterMode === 'pinned'
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800/70 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Pin size={11} /> Dipin ({notes.filter((n) => n.pinned).length})
          </button>
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto md:max-h-[calc(100vh-260px)] hide-scrollbar">
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
            {/* Download .md Button */}
            <button
              type="button"
              onClick={handleDownloadNote}
              className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Unduh catatan (.md)"
            >
              <Download size={16} />
            </button>

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

        {/* Formatting & Quick Template Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-100 dark:border-slate-800/70">
          {/* Formatting Helpers */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => insertSnippet('\n## Subjudul\n')}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Sisipkan Subjudul"
            >
              <Heading1 size={13} /> Subjudul
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('**teks tebal**')}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Teks Tebal"
            >
              <Bold size={13} /> Tebal
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('\n- ')}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Daftar Poin"
            >
              <List size={13} /> Poin
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('\n- [ ] ')}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Checklist Tugas"
            >
              <ListChecks size={13} /> Checklist
            </button>
          </div>

          {/* Quick Templates */}
          <div className="flex flex-wrap items-center gap-1.5">
            {NOTE_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:border-indigo-400 transition"
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* AI Smart Actions Bar */}
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/25 border border-indigo-200/60 dark:border-indigo-800/40 px-3 py-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-black text-indigo-700 dark:text-indigo-300 mr-1">
            <Sparkles size={13} /> FAZET AI Studio:
          </span>
          <button
            type="button"
            disabled={!!aiBusy}
            onClick={() => runAiAction('summarize')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white transition disabled:opacity-50"
          >
            {aiBusy === 'summarize' ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            Ringkas Poin Inti
          </button>
          <button
            type="button"
            disabled={!!aiBusy}
            onClick={() => runAiAction('polish')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white transition disabled:opacity-50"
          >
            {aiBusy === 'polish' ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
            Rapikan & Strukturkan
          </button>
          <button
            type="button"
            disabled={!!aiBusy}
            onClick={() => runAiAction('quiz')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white transition disabled:opacity-50"
          >
            {aiBusy === 'quiz' ? <Loader2 size={12} className="animate-spin" /> : <HelpCircle size={12} />}
            Buat 3 Soal Latihan
          </button>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tulis ide, materi pelajaran, catatan tugas, atau klik template di atas untuk mulai dengan cepat…"
          className="min-h-[280px] flex-1 resize-none border-none text-sm leading-relaxed text-slate-800 dark:text-slate-200 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 bg-transparent font-sans"
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

