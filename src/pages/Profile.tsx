import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, CheckCircle2, Clock3, Mail, Save, ShieldCheck, Sparkles, UserCircle2, ClipboardList, CircleCheck, TimerReset, AlertTriangle, Copy, Smartphone, Monitor, Tablet, Globe2, LogIn, RefreshCw, LockKeyhole } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile, updateUserWorkspace } from '../services/userService';
import { useWorkspace, WORKSPACES, type WorkspaceId } from '../context/WorkspaceContext';
import { uploadAvatar } from '../services/storageService';
import { getMyChatToken } from '../services/chatService';
import { errorMessage, formatDateTime } from '../lib/utils';
import { useToast } from '../components/ui/Toast';
import { useTasks } from '../hooks/useTasks';
import { getRecentLoginSessions, type LoginSession } from '../services/loginSessionService';
import MazetTaskHistory from '../components/profile/MazetTaskHistory';
import TKADashboard from '../components/widgets/TKADashboard';

export default function Profile() {
  const { user, profile, refreshProfile, isAdmin } = useAuth();
  const { workspaceId, setWorkspaceId } = useWorkspace();
  const { tasks } = useTasks();
  const { push } = useToast();
  const [name, setName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [profileWorkspace, setProfileWorkspace] = useState<WorkspaceId>('fathur');
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error, setError] = useState('');
  const [loginSessions, setLoginSessions] = useState<LoginSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [chatToken, setChatToken] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setName(profile?.name || '');
    setPhotoURL(profile?.photoURL || '');
    setProfileWorkspace(profile?.workspaceId === 'mazet' ? 'mazet' : 'fathur');
  }, [profile]);

  async function loadChatToken() {
    if (!user?.id) return;
    try {
      const token = await getMyChatToken(user.id);
      setChatToken(token);
    } catch (e) {
      console.error('Failed to load chat token', e);
    }
  }

  useEffect(() => {
    void loadChatToken();
    const timer = setInterval(() => { void loadChatToken(); }, 30000); // Check token every 30s
    return () => clearInterval(timer);
  }, [user?.id]);

  async function loadLoginSessions() {
    if (!user?.id) return;
    setLoadingSessions(true);
    try {
      const sessions = await getRecentLoginSessions(user.id, 10);
      setLoginSessions(sessions);
    } catch (e) {
      console.error('TASKFLOW login sessions load failed', e);
      push({ tone: 'error', title: 'Riwayat login gagal dimuat', message: errorMessage(e) });
    } finally {
      setLoadingSessions(false);
    }
  }

  useEffect(() => {
    void loadLoginSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const initials = useMemo(() => (name || 'Pengguna').trim().split(/\s+/).slice(0, 2).map((v) => v[0]).join('').toUpperCase(), [name]);
  const accountAge = profile?.createdAt ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(profile.createdAt)) : 'Belum tersedia';
  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === 'completed').length;
    const inProgress = tasks.filter((task) => task.status === 'in_progress').length;
    const overdue = tasks.filter((task) => task.status === 'overdue' || (task.status !== 'completed' && task.dueAt && new Date(task.dueAt).getTime() < Date.now())).length;
    return { total, completed, inProgress, overdue, rate: total ? Math.round((completed / total) * 100) : 0 };
  }, [tasks]);

  async function copyUserId() {
    if (!user?.id || !navigator.clipboard) return;
    await navigator.clipboard.writeText(user.id);
    push({ tone: 'success', title: 'User ID disalin', message: 'ID siap ditempel di kebutuhan administrasi.' });
  }


  async function handleAvatar(file?: File) {
    if (!file || !user) return;
    setAvatarUploading(true); setError('');
    try {
      const url = await uploadAvatar(user.id, file);
      setPhotoURL(url);
      await updateUserProfile(user.id, { name: name.trim() || profile?.name || 'Pengguna', photoURL: url });
      await refreshProfile();
      push({ tone: 'success', title: 'Foto profil diperbarui', message: 'Perubahan langsung tersinkron ke akunmu.' });
    } catch (e) {
      setError(errorMessage(e));
      push({ tone: 'error', title: 'Gagal mengubah foto', message: errorMessage(e) });
    } finally { setAvatarUploading(false); }
  }

  function sessionIcon(type: LoginSession['device_type']) {
    if (type === 'mobile') return Smartphone;
    if (type === 'tablet') return Tablet;
    return Monitor;
  }

  function sessionStatus(session: LoginSession) {
    if (session.is_current && !session.logout_at) return 'Perangkat ini';
    if (session.logout_at) return 'Keluar';
    return 'Sesi tersimpan';
  }

  function formatSessionDate(value?: string | null) {
    if (!value) return 'Belum tersedia';
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  async function save() {
    if (!user) return;
    if (name.trim().length < 2) { setError('Nama minimal 2 karakter.'); return; }
    setSaving(true); setError('');
    try {
      await updateUserProfile(user.id, { name: name.trim(), photoURL: photoURL || undefined });
      if (isAdmin) {
        await updateUserWorkspace(user.id, profileWorkspace);
        setWorkspaceId(profileWorkspace);
      }
      await refreshProfile();
      push({ tone: 'success', title: 'Profil tersimpan', message: 'Nama dan identitasmu sudah diperbarui.' });
    } catch (e) { setError(errorMessage(e)); }
    finally { setSaving(false); }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 fade-up">
      <div className="relative overflow-hidden rounded-[var(--tf-radius-card)] border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] p-6 sm:p-8 shadow-[var(--tf-shadow-card)]">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[var(--tf-primary)]/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-[24px] border border-[var(--tf-border)] bg-[#141311] text-2xl font-medium text-[#E5CFA0] shadow-md" style={{ fontFamily: 'var(--tf-font-display)' }}>
                {photoURL ? <img src={photoURL} alt="Foto profil" className="h-full w-full object-cover" /> : initials || <UserCircle2 size={40} />}
              </div>
              <button type="button" onClick={() => inputRef.current?.click()} className="focus-ring absolute -bottom-1.5 -right-1.5 grid h-9 w-9 place-items-center rounded-xl border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] text-[var(--tf-text-primary)] shadow-sm hover:border-[var(--tf-primary)]" aria-label="Ganti foto profil">
                <Camera size={15} />
              </button>
              <input ref={inputRef} className="hidden" type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => void handleAvatar(e.target.files?.[0])} />
            </div>
            <div>
              <div className="studio-eyebrow mb-1">Personal Identity</div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--tf-text-primary)]" style={{ fontFamily: 'var(--tf-font-display)' }}>{profile?.name || 'Pengguna'}</h1>
                <Badge tone={profile?.role === 'admin' ? 'purple' : 'blue'}>{profile?.role === 'admin' ? 'Administrator' : 'Member'}</Badge>
              </div>
              <p className="mt-1 flex items-center gap-2 text-xs text-[var(--tf-text-muted)]"><Mail size={13} /> {profile?.email}</p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--tf-primary)]"><Sparkles size={12} /> Sinkronisasi Cloud Aktif</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5 md:w-64">
            <div className="rounded-xl border border-[var(--tf-border)] bg-[var(--tf-bg-subtle)] p-3.5"><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tf-text-muted)]">Terdaftar</div><div className="mt-1 text-xs font-semibold text-[var(--tf-text-primary)]">{accountAge}</div></div>
            <div className="rounded-xl border border-[var(--tf-border)] bg-[var(--tf-bg-subtle)] p-3.5"><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tf-text-muted)]">Status</div><div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[var(--tf-success)]"><CheckCircle2 size={13}/> {profile?.status === 'disabled' ? 'Disabled' : 'Active'}</div></div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {([
          [ClipboardList, 'Total tugas', taskStats.total, 'text-[var(--tf-primary)] bg-[var(--tf-primary-subtle)]'],
          [CircleCheck, 'Selesai', taskStats.completed, 'text-[var(--tf-success)] bg-[var(--tf-success-bg)]'],
          [TimerReset, 'Dikerjakan', taskStats.inProgress, 'text-[var(--tf-info)] bg-[var(--tf-info-bg)]'],
          [AlertTriangle, 'Terlambat', taskStats.overdue, 'text-[var(--tf-danger)] bg-[var(--tf-danger-bg)]'],
        ] as [LucideIcon, string, number, string][]).map(([Icon, label, value, tone]) => <Card key={label} className="p-4"><div className="flex items-center gap-3.5"><div className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon size={17}/></div><div><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tf-text-muted)]">{label}</div><div className="text-xl font-semibold font-mono text-[var(--tf-text-primary)]">{value}</div></div></div></Card>)}
      </div>
      <Card className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tf-text-muted)]">Produktivitas</p><h2 className="mt-1 text-xl font-medium" style={{ fontFamily: 'var(--tf-font-display)' }}>Completion Rate {taskStats.rate}%</h2><p className="mt-0.5 text-xs text-[var(--tf-text-muted)]">Ringkasan penyelesaian tugas yang tersimpan pada akun ini.</p></div><div className="h-2 w-full max-w-sm overflow-hidden rounded-full bg-[var(--tf-bg-subtle)]"><div className="h-full rounded-full bg-[var(--tf-primary)] transition-all duration-700" style={{ width: `${taskStats.rate}%` }} /></div></div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_.6fr]">
        <Card className="p-6">
          <div className="mb-5"><h2 className="text-xl font-medium" style={{ fontFamily: 'var(--tf-font-display)' }}>Identitas & Profil</h2><p className="mt-1 text-xs text-[var(--tf-text-muted)]">Perbarui informasi yang ditampilkan di seluruh ruang kerja FAZET.</p></div>
          <div className="grid gap-4">
            <label><span className="label">Nama lengkap</span><input className="input h-11" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} /></label>
            <div>
              <span className="label">Workspace akun</span>
              {isAdmin ? (
                <select className="input h-11" value={profileWorkspace} onChange={(e) => setProfileWorkspace(e.target.value === 'mazet' ? 'mazet' : 'fathur')}>
                  <option value="fathur">Fathur</option>
                  <option value="mazet">Mazet</option>
                </select>
              ) : (
                <div className="flex h-11 items-center rounded-xl border border-[var(--tf-border)] bg-[var(--tf-bg-subtle)] px-3.5 text-sm font-medium text-[var(--tf-text-primary)]">{WORKSPACES[workspaceId].name} <span className="ml-2 text-xs text-[var(--tf-text-muted)]">(ditetapkan saat daftar)</span></div>
              )}
            </div>
            <label><span className="label">Email akun</span><input className="input h-11 bg-[var(--tf-bg-subtle)] opacity-75" value={profile?.email || ''} disabled /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><div className="label">Login terakhir</div><div className="flex items-center gap-2 text-xs font-medium text-[var(--tf-text-secondary)]"><Clock3 size={14} className="text-[var(--tf-primary)]"/>{formatDateTime(profile?.lastLoginAt)}</div></div>
              <div><div className="label">Status akses</div><div className="text-xs font-semibold text-[var(--tf-success)]">{profile?.status === 'disabled' ? 'Akses dinonaktifkan' : 'Akses aktif'}</div></div>
            </div>
            {error && <div role="alert" className="rounded-xl border border-[var(--tf-danger)]/30 bg-[var(--tf-danger-bg)] px-4 py-3 text-xs font-medium text-[var(--tf-danger)]">{error}</div>}
            <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end"><Button loading={avatarUploading} variant="outline" onClick={() => inputRef.current?.click()} icon={<Camera size={15}/>}>Ganti foto</Button><Button loading={saving} onClick={save} icon={<Save size={15}/>}>Simpan perubahan</Button></div>
          </div>
        </Card>

        <div className="space-y-4">
            <Card className="p-5"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 text-[var(--tf-primary)]" size={18}/><div><h3 className="text-sm font-semibold">Keamanan Akun</h3><p className="mt-1 text-xs leading-5 text-[var(--tf-text-muted)]">Role, data, dan akses admin divalidasi melalui policy Supabase secara langsung.</p></div></div></Card>
            
            <Card className="p-5 border border-[var(--tf-primary)]/30 bg-[var(--tf-primary-subtle)]/40">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tf-primary)]">Token Chat (Rotasi 5 Menit)</div>
                <button type="button" onClick={() => { if (chatToken) { navigator.clipboard.writeText(chatToken); push({tone:'success', title:'Token Disalin', message:'Berikan ini pada rekan yang ingin chat dengan Anda'}); } }} className="rounded-lg p-1.5 text-[var(--tf-primary)] hover:bg-[var(--tf-primary-subtle)]" aria-label="Salin Token">
                  <Copy size={14}/>
                </button>
              </div>
              <div className="mt-2 text-center text-2xl font-mono font-semibold tracking-[0.22em] text-[var(--tf-text-primary)]">
                {chatToken || '------'}
              </div>
            </Card>

            <Card className="p-5"><div className="flex items-center justify-between gap-3"><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tf-text-muted)]">User ID</div><button type="button" onClick={() => void copyUserId()} className="rounded-lg p-1.5 text-[var(--tf-text-muted)] hover:bg-[var(--tf-bg-subtle)] hover:text-[var(--tf-primary)]" aria-label="Salin User ID"><Copy size={14}/></button></div><div className="mt-2 break-all font-mono text-[11px] text-[var(--tf-text-secondary)]">{user?.id}</div></Card>
          </div>
      </div>

      {/* RIWAYAT TUGAS MAZET (Khusus Akun Mazet) */}
      <MazetTaskHistory 
        userId={user?.id} 
        isMazetView={workspaceId === 'mazet' || profile?.workspaceId === 'mazet' || (profile?.name || '').toLowerCase().includes('mazet')} 
      />

      {/* JADWAL & COUNTDOWN TKA FATHUR (Khusus Akun/Profil Fathur) */}
      {!(workspaceId === 'mazet' || profile?.workspaceId === 'mazet' || (profile?.name || '').toLowerCase().includes('mazet')) && (
        <TKADashboard />
      )}
      
      {/* CHANGE PASSWORD SECTION */}
      <Card className="p-6 mb-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
            <LockKeyhole size={20} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold">Ubah Kata Sandi</h2>
            <p className="mt-1 text-sm text-slate-500">Perbarui kata sandi Anda secara berkala untuk menjaga keamanan akun.</p>
          </div>
        </div>
        
        <form className="grid gap-4 max-w-md" onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const newPass = fd.get('newPass') as string;
          const confirmPass = fd.get('confirmPass') as string;
          if (newPass.length < 8) return push({ tone: 'error', title: 'Kata Sandi Lemah', message: 'Kata sandi minimal harus 8 karakter.' });
          if (newPass !== confirmPass) return push({ tone: 'error', title: 'Konfirmasi Gagal', message: 'Kata sandi baru tidak cocok.' });
          
          try {
            // Using supabase auth to update password
            const { getSupabase } = await import('../lib/supabase');
            const client = getSupabase(workspaceId);
            const { error: updateError } = await client.auth.updateUser({ password: newPass });
            if (updateError) throw updateError;
            push({ tone: 'success', title: 'Kata Sandi Diubah', message: 'Kata sandi Anda berhasil diperbarui.' });
            (e.target as HTMLFormElement).reset();
          } catch (err: any) {
            push({ tone: 'error', title: 'Gagal Ubah Sandi', message: errorMessage(err) });
          }
        }}>
          <label>
            <span className="label">Kata Sandi Baru</span>
            <input name="newPass" type="password" required className="input h-12" placeholder="Minimal 8 karakter" />
          </label>
          <label>
            <span className="label">Konfirmasi Kata Sandi Baru</span>
            <input name="confirmPass" type="password" required className="input h-12" placeholder="Ulangi kata sandi baru" />
          </label>
          <div className="flex justify-end mt-2">
            <Button type="submit" icon={<CheckCircle2 size={16}/>}>Simpan Sandi Baru</Button>
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/70 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-500" />
                <h2 className="text-lg font-extrabold">Aktivitas login & perangkat</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">Setiap login dicatat agar kamu bisa mengetahui kapan akun digunakan dan dari perangkat apa.</p>
            </div>
            <Button variant="outline" loading={loadingSessions} onClick={() => void loadLoginSessions()} icon={<RefreshCw size={15} />}>Refresh</Button>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {loginSessions.length === 0 ? (
            <div className="px-5 py-10 text-center sm:px-6">
              <LogIn size={28} className="mx-auto text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Belum ada riwayat sesi yang tersimpan.</p>
              <p className="mt-1 text-xs text-slate-400">Login berikutnya akan otomatis masuk ke daftar perangkat.</p>
            </div>
          ) : loginSessions.map((session) => {
            const DeviceIcon = sessionIcon(session.device_type);
            return (
              <div key={session.id} className="px-5 py-4 sm:px-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className={session.is_current && !session.logout_at ? 'grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' : 'grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'}>
                      <DeviceIcon size={19} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-extrabold text-slate-900 dark:text-white">{session.device_name}</h3>
                        {session.is_current && !session.logout_at && <Badge tone="green">Aktif sekarang</Badge>}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1"><Globe2 size={12} /> {session.browser}</span>
                        <span>{session.os}</span>
                        <span>{session.device_type}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                        <span>Login: {formatSessionDate(session.login_at)}</span>
                        <span>Aktivitas: {formatSessionDate(session.last_seen_at)}</span>
                        {session.logout_at && <span>Keluar: {formatSessionDate(session.logout_at)}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 self-start rounded-full border border-slate-200 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    {sessionStatus(session)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}


