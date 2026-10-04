import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Heart, MessageCircle, Sparkles, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { listConversations, type ChatConversation } from '../../services/chatService';
import type { WorkspaceId } from '../../lib/supabase';
import { formatDate } from '../../lib/utils';

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function TogetherCard() {
  const { workspaceId } = useWorkspace();
  const { user } = useAuth();
  const [note, setNote] = useState(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem('fazet.together.note') ?? '';
  });
  const [saved, setSaved] = useState(false);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [now] = useState(() => new Date());

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    void listConversations(user.id, workspaceId)
      .then((items) => {
        if (alive) setConversation(items[0] ?? null);
      })
      .catch(() => {
        if (alive) setConversation(null);
      });
    return () => { alive = false; };
  }, [user?.id, workspaceId]);

  const counterpart: WorkspaceId = workspaceId === 'fathur' ? 'mazet' : 'fathur';
  const counterpartLabel = counterpart === 'fathur' ? 'Fathur' : 'Mazet';
  const relationshipLabel = conversation?.title ?? `Ruang ${counterpartLabel}`;
  const lastConnectedDate = conversation?.updatedAt ? new Date(conversation.updatedAt) : null;
  const tomorrow = addDays(now, 1);
  const savedLabel = useMemo(
    () => note.trim() ? 'Catatan tersimpan' : 'Simpan satu kalimat untuk hari ini',
    [note],
  );

  function saveNote() {
    window.localStorage.setItem('fazet.together.note', note.trim());
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  const timeline = [
    { date: now, label: 'Hari ini', detail: 'Ruang kita sekarang', accent: 'var(--tf-accent)', key: dateKey(now) },
    { date: lastConnectedDate, label: 'Terakhir terhubung', detail: lastConnectedDate ? 'Percakapan terakhir diperbarui' : 'Belum ada percakapan tersimpan', accent: '#8b5cf6', key: `last-${conversation?.id ?? 'none'}` },
    { date: tomorrow, label: 'Besok', detail: 'Langkah berikutnya', accent: '#10b981', key: dateKey(tomorrow) },
  ];

  return (
    <section className="fazet-together-card fazet-together-card--unified">
      <div className="fazet-together-card__header">
        <div>
          <div className="fazet-eyebrow"><Heart size={13} /> Perjalanan & hubungan</div>
          <h2>Perjalanan Kita</h2>
          <p>Semua tanggal penting untuk ruang kita berada di satu jalur waktu.</p>
        </div>
        <Link to="/chat" className="fazet-inline-link">Buka ruang <ArrowRight size={14} /></Link>
      </div>

      <div className="fazet-together-timeline">
        {timeline.map((item, index) => (
          <div key={item.key} className="fazet-together-stop">
            <div className="fazet-together-stop__rail">
              <span className="fazet-together-stop__dot" style={{ background: item.accent }} />
              {index < timeline.length - 1 && <span className="fazet-together-stop__line" />}
            </div>
            <div className="fazet-together-stop__content">
              <div className="fazet-together-stop__date">{item.date ? formatDate(item.date.toISOString().slice(0, 10)) : '—'}</div>
              <strong>{item.label}</strong>
              <small>{item.detail}</small>
            </div>
            {index === 0 && <span className="fazet-now-badge"><Sparkles size={10} /> sekarang</span>}
          </div>
        ))}
      </div>

      <div className="fazet-together-relationship">
        <div className="fazet-relationship-topline">
          <div className="flex min-w-0 items-center gap-2">
            <span className="fazet-avatar-pair"><UsersRound size={14} /></span>
            <div className="min-w-0">
              <div className="truncate text-sm font-bold" style={{ color: 'var(--tf-ink)' }}>{relationshipLabel}</div>
              <div className="text-[11px]" style={{ color: 'var(--tf-ink-muted)' }}>{workspaceId === 'fathur' ? 'Fathur ↔ Mazet' : 'Mazet ↔ Fathur'} · ruang terhubung</div>
            </div>
          </div>
          <span className="fazet-live-dot">Connected</span>
        </div>

        <div className="fazet-together-note">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.13em]" style={{ color: 'var(--tf-ink-muted)' }}>
            <Sparkles size={12} /> {savedLabel}
          </div>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value.slice(0, 180))}
            placeholder="Satu kalimat untuk hari ini…"
            rows={2}
            aria-label="Catatan ruang kita"
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-[10px]" style={{ color: 'var(--tf-ink-muted)' }}>{note.length}/180</span>
            <button type="button" className="fazet-note-save" onClick={saveNote}>{saved ? 'Tersimpan ✓' : 'Simpan'}</button>
          </div>
        </div>

        <div className="fazet-relationship-actions">
          <Link to="/chat" className="fazet-soft-action"><MessageCircle size={15} /> Lanjut ngobrol</Link>
          <Link to="/profile" className="fazet-soft-action"><UsersRound size={15} /> Lihat profil</Link>
        </div>
      </div>
    </section>
  );
}
