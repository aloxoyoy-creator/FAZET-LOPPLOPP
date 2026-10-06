import { useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { friendlyError } from '../lib/errors';
import { Mail, Lock, ArrowRight, Building2, Briefcase, Zap, AlertCircle } from 'lucide-react';

export function AuthLayout({
  children,
  title,
  subtitle,
  eyebrow
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  return (
    <div className="min-h-screen flex w-full bg-[#f4f7f6] text-slate-800 font-sans selection:bg-indigo-200">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-600/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">Fazet.</span>
          </div>

          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-slate-500 font-medium text-base mb-8">
              {subtitle}
            </p>
          )}

          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
            {children}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xs font-semibold text-slate-400">
              Made with ❤️ for {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
      
      {/* Right Decorative Panel */}
      <div className="hidden lg:block relative w-0 flex-1 bg-indigo-50 overflow-hidden">
        {/* Soft casual shapes */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center p-20 z-10 text-center">
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-12 rounded-[3rem] shadow-2xl max-w-lg">
            <h3 className="text-3xl font-black text-slate-800 mb-4 leading-tight">Mulai atur harimu <br/> lebih terstruktur.</h3>
            <p className="text-slate-600 font-medium text-lg">Platform belajar dan manajemen waktu yang dibuat khusus untuk membuat rutinitasmu lebih menyenangkan.</p>
          </div>
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
  
  const [workspace, setWorkspace] = useState<'fathur'|'mazet'>(
    (activeWorkspace === 'fathur' || activeWorkspace === 'mazet') ? activeWorkspace : 'fathur'
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
        const from = (location.state as any)?.from || '/';
        navigate(from, { replace: true });
      } else {
        await resetPassword(email, workspace);
        setMessage('Instruksi pemulihan telah dikirim ke email Anda.');
      }
    } catch (err: any) {
      setError(friendlyError(err) || err.message || 'Ups, login gagal! Cek lagi email atau password kamu ya.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title={view === 'login' ? 'Hai, Selamat Datang! 👋' : 'Lupa Password?'}
      subtitle={view === 'login' ? 'Pilih profil kamu dan masukkan kredensial untuk masuk.' : 'Tenang, kami akan mengirimkan tautan reset ke emailmu.'}
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 text-red-600 text-sm font-semibold p-4 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        {message && (
          <div className="bg-emerald-50 text-emerald-600 text-sm font-semibold p-4 rounded-2xl flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600 font-black">✓</div>
            <p>{message}</p>
          </div>
        )}
        
        <div className="space-y-3">
          <label className="block text-[13px] font-bold text-slate-800 uppercase tracking-wider">
            Siapa yang sedang login?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setWorkspace('fathur')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-bold transition-all duration-300 border-2 ${
                workspace === 'fathur' 
                  ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-md' 
                  : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Briefcase className={`w-4 h-4 ${workspace === 'fathur' ? 'text-indigo-600' : 'text-slate-400'}`} />
              Fathur
            </button>
            <button
              type="button"
              onClick={() => setWorkspace('mazet')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-bold transition-all duration-300 border-2 ${
                workspace === 'mazet' 
                  ? 'bg-pink-50 border-pink-500 text-pink-600 shadow-md' 
                  : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Building2 className={`w-4 h-4 ${workspace === 'mazet' ? 'text-pink-500' : 'text-slate-400'}`} />
              Mazet
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-[13px] font-bold text-slate-800 uppercase tracking-wider">
              Email Kamu
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-sm font-semibold"
                placeholder="halo@fazet.com"
              />
            </div>
          </div>

          {view === 'login' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-[13px] font-bold text-slate-800 uppercase tracking-wider">
                    Password
                  </label>
                  <button 
                    type="button" 
                    onClick={() => setView('forgot')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Lupa Password?
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-sm font-semibold"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
                    title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600/30 transition-colors"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-slate-600">
                  Ingat sesi saya
                </label>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group relative w-full flex justify-center items-center gap-2 py-4 px-4 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-600/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 active:translate-y-0"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {view === 'login' ? 'Gas Masuk!' : 'Kirim Link Reset'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        {view === 'forgot' && (
          <div className="text-center pt-2">
            <button 
              type="button" 
              onClick={() => setView('login')}
              className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              &larr; Balik ke Login
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
