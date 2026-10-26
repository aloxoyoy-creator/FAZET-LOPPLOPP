import { useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { friendlyError } from '../lib/errors';
import { Mail, Lock, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export function AuthLayout({
  children,
  title,
  subtitle,
  eyebrow,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-[#F6F4EF] dark:bg-[#0D0D0C] text-[#181715] dark:text-[#F2EFE9] selection:bg-[#9E7B42]/20">
      {/* Left Form Column */}
      <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between px-6 py-10 sm:px-12 lg:px-16 xl:px-20">
        {/* Top Brand Mark */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#181715] dark:bg-[#F2EFE9] text-[#F6F4EF] dark:text-[#0D0D0C] grid place-items-center font-serif text-lg font-semibold tracking-tight">
              F
            </div>
            <div>
              <span className="text-sm font-semibold tracking-[0.18em] uppercase block">FAZET</span>
              <span className="text-[10px] tracking-[0.14em] uppercase text-[#7A756C] block">Private Studio</span>
            </div>
          </div>
          <span className="text-[11px] font-mono text-[#7A756C] tracking-wider">EDITION 2026</span>
        </div>

        {/* Main Form Container */}
        <div className="mx-auto w-full max-w-md my-12">
          {eyebrow && (
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9E7B42] mb-2">
              {eyebrow}
            </div>
          )}
          <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-[#181715] dark:text-[#F2EFE9]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-[#7A756C] leading-relaxed">
              {subtitle}
            </p>
          )}

          <div className="mt-8 rounded-2xl bg-[#FCFBF8] dark:bg-[#151513] p-6 sm:p-8 border border-[#181715]/10 dark:border-[#F2EFE9]/10 shadow-[0_20px_50px_-24px_rgba(24,23,21,0.12)]">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[11px] text-[#7A756C] border-t border-[#181715]/8 dark:border-[#F2EFE9]/8 pt-5">
          <span>FAZET Studio</span>
          <span>Fathur &amp; Mazet Workspace</span>
        </div>
      </div>

      {/* Right Editorial Showcase Column */}
      <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 relative overflow-hidden bg-[#141311] text-[#F2EFE9] p-14 xl:p-20 flex-col justify-between border-l border-[#181715]/10">
        {/* Subtle luxury ambient glow */}
        <div
          className="pointer-events-none absolute -top-32 -right-32 h-[480px] w-[480px] rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, #C8A96E 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-40 -left-24 h-[420px] w-[420px] rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #8C734B 0%, transparent 70%)' }}
        />

        <div className="relative z-10 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-[#A39E93]">
          <span>Quiet Luxury Workspace</span>
          <span>Academic &amp; Personal Rhythm</span>
        </div>

        <div className="relative z-10 max-w-xl my-auto space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C8A96E]/30 bg-[#C8A96E]/10 px-3.5 py-1 text-[11px] tracking-[0.16em] uppercase text-[#D8BE8B]">
            Terstruktur &bull; Tenang &bull; Personal
          </div>
          <h2 className="font-serif text-4xl xl:text-5xl font-normal leading-[1.12] tracking-tight text-[#F7F4EE]">
            Ruang produktivitas dan catatan perjalanan dalam satu kanvas yang tenang.
          </h2>
          <p className="text-sm xl:text-base text-[#A39E93] leading-relaxed font-normal">
            Dirancang dengan estetika minimalis untuk mengelola jadwal akademik, prioritas tugas, keuangan harian, dan momen kebersamaan tanpa distorsi visual.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
            <div>
              <div className="font-serif text-2xl text-[#D8BE8B]">Fokus</div>
              <div className="text-xs text-[#8F8A80] mt-0.5">Agenda &amp; prioritas harian</div>
            </div>
            <div>
              <div className="font-serif text-2xl text-[#D8BE8B]">Finansial</div>
              <div className="text-xs text-[#8F8A80] mt-0.5">Catatan &amp; analisis rapi</div>
            </div>
            <div>
              <div className="font-serif text-2xl text-[#D8BE8B]">Bersama</div>
              <div className="text-xs text-[#8F8A80] mt-0.5">Galeri &amp; ruang terhubung</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-[#7A756C]">
          <span>Dirancang eksklusif untuk Fathur &amp; Mazet</span>
          <span className="font-mono">{new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  );
}

export function FazetLoginPage({
  initialView = 'login',
}: {
  initialView?: 'login' | 'forgot';
}) {
  const { login, activeWorkspace, switchWorkspace, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [workspace, setWorkspace] = useState<'fathur' | 'mazet'>(
    activeWorkspace === 'fathur' || activeWorkspace === 'mazet' ? activeWorkspace : 'fathur'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'login' | 'forgot'>(initialView);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (workspace !== activeWorkspace) {
        await switchWorkspace(workspace);
      }

      if (view === 'login') {
        await login(email, password, rememberMe, workspace);
        const from = (location.state as { from?: string } | null)?.from || '/';
        navigate(from, { replace: true });
      } else {
        await resetPassword(email, workspace);
        setMessage('Instruksi pemulihan telah dikirim ke email Anda.');
      }
    } catch (err: unknown) {
      const fallback = err instanceof Error ? err.message : 'Login gagal. Periksa kembali email dan kata sandi Anda.';
      setError(friendlyError(err) || fallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow={view === 'login' ? 'Autentikasi Workspace' : 'Pemulihan Akun'}
      title={view === 'login' ? 'Selamat Datang Kembali' : 'Atur Ulang Kata Sandi'}
      subtitle={
        view === 'login'
          ? 'Pilih profil ruang kerja Anda dan masuk untuk melanjutkan.'
          : 'Masukkan alamat email Anda untuk menerima tautan pemulihan.'
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-rose-500/8 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-medium p-3.5 rounded-xl flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}
        {message && (
          <div className="bg-emerald-500/8 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium p-3.5 rounded-xl flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <p>{message}</p>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-[11px] font-semibold text-[#7A756C] uppercase tracking-[0.14em]">
            Pilih Ruang Kerja
          </label>
          <div className="grid grid-cols-2 gap-2.5 p-1 rounded-xl bg-[#EFECE5] dark:bg-[#1E1E1C] border border-[#181715]/8 dark:border-white/8">
            <button
              type="button"
              onClick={() => setWorkspace('fathur')}
              className={`py-2.5 px-4 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                workspace === 'fathur'
                  ? 'bg-[#FCFBF8] dark:bg-[#282825] text-[#181715] dark:text-[#F2EFE9] shadow-2xs border border-[#181715]/10 dark:border-white/10'
                  : 'text-[#7A756C] hover:text-[#181715] dark:hover:text-[#F2EFE9]'
              }`}
            >
              Fathur
            </button>
            <button
              type="button"
              onClick={() => setWorkspace('mazet')}
              className={`py-2.5 px-4 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                workspace === 'mazet'
                  ? 'bg-[#FCFBF8] dark:bg-[#282825] text-[#181715] dark:text-[#F2EFE9] shadow-2xs border border-[#181715]/10 dark:border-white/10'
                  : 'text-[#7A756C] hover:text-[#181715] dark:hover:text-[#F2EFE9]'
              }`}
            >
              Mazet
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-[11px] font-semibold text-[#7A756C] uppercase tracking-[0.14em]">
              Alamat Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-[#7A756C]" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-[#F6F4EF]/70 dark:bg-[#1E1E1C] border border-[#181715]/12 dark:border-white/10 rounded-xl text-[#181715] dark:text-[#F2EFE9] placeholder-[#7A756C]/60 focus:bg-[#FCFBF8] dark:focus:bg-[#232321] focus:border-[#9E7B42] focus:outline-none transition-colors text-sm"
                placeholder="nama@email.com"
              />
            </div>
          </div>

          {view === 'login' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-[11px] font-semibold text-[#7A756C] uppercase tracking-[0.14em]">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-xs font-medium text-[#9E7B42] hover:underline cursor-pointer"
                  >
                    Lupa kata sandi?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-[#7A756C]" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-11 py-3 bg-[#F6F4EF]/70 dark:bg-[#1E1E1C] border border-[#181715]/12 dark:border-white/10 rounded-xl text-[#181715] dark:text-[#F2EFE9] placeholder-[#7A756C]/60 focus:bg-[#FCFBF8] dark:focus:bg-[#232321] focus:border-[#9E7B42] focus:outline-none transition-colors text-sm"
                    placeholder="Masukkan kata sandi"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#7A756C] hover:text-[#181715] dark:hover:text-[#F2EFE9] transition-colors cursor-pointer"
                    title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center pt-1">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-[#181715]/20 accent-[#181715] dark:accent-[#C8A96E]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-[#7A756C]">
                  Pertahankan sesi masuk di perangkat ini
                </label>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-[0.14em] text-[#FCFBF8] dark:text-[#141311] bg-[#181715] dark:bg-[#E5DEC9] hover:bg-[#2C2A26] dark:hover:bg-[#F2EFE9] disabled:opacity-60 transition-all cursor-pointer"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          ) : (
            <>
              <span>{view === 'login' ? 'Masuk ke Studio' : 'Kirim Tautan Pemulihan'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>

        {view === 'forgot' && (
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setView('login')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#7A756C] hover:text-[#181715] dark:hover:text-[#F2EFE9] transition-colors cursor-pointer"
            >
              <ArrowLeft size={13} /> Kembali ke halaman masuk
            </button>
          </div>
        )}
      </form>
    </AuthLayout>
  );
}

export default function Login() {
  return <FazetLoginPage initialView="login" />;
}
