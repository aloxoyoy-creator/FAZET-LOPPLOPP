import { useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { friendlyError } from '../lib/errors';
import { Mail, Lock, ArrowRight, Building2, Briefcase, Sparkles } from 'lucide-react';

export function AuthLayout({
  children,
  eyebrow,
  title,
  subtitle
}: {
  children: ReactNode;
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-screen bg-[#05070c] flex w-full">
      {/* Left Panel - Image/Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 border-r border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-[#05070c] to-slate-900 z-10" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        
        <div className="relative z-20 flex flex-col justify-center px-20 text-white w-full h-full">
          <div className="mb-8 inline-flex p-4 bg-white/5 rounded-3xl backdrop-blur-xl border border-white/10 w-fit">
            <img 
              src="/brand/fathur-school-hub-crest.png" 
              alt="FAZET Logo" 
              className="h-16 w-16 rounded-2xl shadow-2xl"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight">
            Elevate Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Productivity
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-md leading-relaxed mb-12">
            Sistem manajemen terpadu yang dirancang eksklusif untuk memaksimalkan efisiensi dan alur kerja harian.
          </p>
          
          <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <span>Versi 2.0 Total Redesign</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="w-full max-w-md relative z-10">
          <div className="lg:hidden flex justify-center mb-8">
            <img 
              src="/brand/fathur-school-hub-crest.png" 
              alt="FAZET Logo" 
              className="h-14 w-14 rounded-2xl shadow-xl"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">{title}</h2>
            {subtitle && <p className="text-slate-400 text-sm leading-relaxed">{subtitle}</p>}
          </div>

          {children}

          <div className="mt-12 pt-8 border-t border-slate-800/50 text-center lg:text-left">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} FAZET Systems. All rights reserved.
            </p>
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
        await login(email, password, true, workspace);
        const from = (location.state as any)?.from || '/';
        navigate(from, { replace: true });
      } else {
        await resetPassword(email, workspace);
        setMessage('Instruksi pemulihan telah dikirim ke email Anda.');
      }
    } catch (err: any) {
      setError(friendlyError(err) || err.message || 'Otentikasi gagal. Silakan periksa kredensial Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title={view === 'login' ? 'Selamat Datang' : 'Lupa Kata Sandi'}
      subtitle={view === 'login' ? 'Masuk untuk mengakses dasbor dan ruang kerja Anda.' : 'Masukkan email Anda untuk menerima tautan reset.'}
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="mt-0.5">⚠️</div>
            <p>{error}</p>
          </div>
        )}
        {message && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="mt-0.5">✨</div>
            <p>{message}</p>
          </div>
        )}
        
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Lingkungan Kerja (Workspace)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setWorkspace('fathur')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                workspace === 'fathur' 
                  ? 'bg-blue-600/10 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:border-slate-700'
              }`}
            >
              <Briefcase className={`w-4 h-4 ${workspace === 'fathur' ? 'text-blue-400' : 'text-slate-500'}`} />
              Fathur
            </button>
            <button
              type="button"
              onClick={() => setWorkspace('mazet')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                workspace === 'mazet' 
                  ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:border-slate-700'
              }`}
            >
              <Building2 className={`w-4 h-4 ${workspace === 'mazet' ? 'text-indigo-400' : 'text-slate-500'}`} />
              Mazet
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Alamat Surel
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm"
                placeholder="nama@email.com"
              />
            </div>
          </div>

          {view === 'login' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Kata Sandi
                </label>
                <button 
                  type="button" 
                  onClick={() => setView('forgot')}
                  className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors"
                >
                  Lupa?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group relative w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all overflow-hidden"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {view === 'login' ? 'Masuk ke Sistem' : 'Kirim Tautan'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        {view === 'forgot' && (
          <div className="text-center pt-2">
            <button 
              type="button" 
              onClick={() => setView('login')}
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Kembali ke Login
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
