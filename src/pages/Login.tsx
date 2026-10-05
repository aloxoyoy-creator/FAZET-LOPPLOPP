import { useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { friendlyError } from '../lib/errors';
import { Mail, Lock, ArrowRight, Building2, Briefcase, Sparkles, CheckCircle2 } from 'lucide-react';

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
    <div className="min-h-screen flex w-full bg-[#f8f9fa] text-slate-900 font-sans selection:bg-blue-200">
      {/* Left Panel - Modern Enterprise Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-slate-900">
        {/* Animated gradient mesh background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay z-0"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent z-10"></div>
        <div className="absolute -left-[20%] -top-[20%] w-[140%] h-[140%] bg-gradient-radial from-blue-500/20 to-transparent opacity-50 blur-3xl z-10 pointer-events-none"></div>

        <div className="relative z-20 flex flex-col justify-between p-16 h-full w-full">
          <div>
            <div className="inline-flex items-center gap-3 p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl mb-12">
              <img 
                src="/brand/fathur-school-hub-crest.png" 
                alt="FAZET Logo" 
                className="h-10 w-10 rounded-xl"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('hidden');
                }}
              />
              <span className="text-white font-bold tracking-wider">FAZET SYSTEMS</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6 tracking-tight">
              Platform Manajemen <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Terpadu & Cerdas
              </span>
            </h1>
            
            <p className="text-slate-300 text-lg max-w-md leading-relaxed font-medium">
              Akses ruang kerja eksklusif Anda dengan aman. Dirancang khusus untuk menunjang efisiensi harian.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 text-slate-300 bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-sm max-w-md">
              <div className="bg-emerald-500/20 p-2 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Versi 2.0 Total Redesign</p>
                <p className="text-xs opacity-80 mt-0.5">Antarmuka baru yang lebih cepat dan responsif.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-slate-300 bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-sm max-w-md">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Sinkronisasi Cloud Real-time</p>
                <p className="text-xs opacity-80 mt-0.5">Semua data Anda tersimpan aman dan terenkripsi.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center p-6 sm:p-12 relative bg-white">
        
        <div className="w-full max-w-[420px] relative z-10">
          <div className="lg:hidden flex justify-center mb-10">
            <div className="inline-flex items-center gap-3 p-3 bg-slate-900 rounded-2xl shadow-xl">
              <img 
                src="/brand/fathur-school-hub-crest.png" 
                alt="FAZET Logo" 
                className="h-10 w-10 rounded-xl"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <span className="text-white font-bold tracking-wider pr-2">FAZET SYSTEMS</span>
            </div>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">{title}</h2>
            {subtitle && <p className="text-slate-500 text-sm font-medium">{subtitle}</p>}
          </div>

          {children}

          <div className="mt-12 text-center lg:text-left">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              &copy; {new Date().getFullYear()} FAZET Systems
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
      title={view === 'login' ? 'Masuk ke Akun' : 'Lupa Kata Sandi'}
      subtitle={view === 'login' ? 'Silakan masukkan kredensial Anda untuk melanjutkan.' : 'Masukkan email Anda untuk menerima tautan reset.'}
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 text-sm p-4 rounded-r-lg flex items-start gap-3 animate-in fade-in">
            <p className="font-medium">{error}</p>
          </div>
        )}
        {message && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 text-sm p-4 rounded-r-lg flex items-start gap-3 animate-in fade-in">
            <p className="font-medium">{message}</p>
          </div>
        )}
        
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            Lingkungan Kerja (Workspace)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setWorkspace('fathur')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 border-2 ${
                workspace === 'fathur' 
                  ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <Briefcase className={`w-4 h-4 ${workspace === 'fathur' ? 'text-blue-600' : 'text-slate-400'}`} />
              Fathur
            </button>
            <button
              type="button"
              onClick={() => setWorkspace('mazet')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 border-2 ${
                workspace === 'mazet' 
                  ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <Building2 className={`w-4 h-4 ${workspace === 'mazet' ? 'text-indigo-600' : 'text-slate-400'}`} />
              Mazet
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Alamat Surel
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-0 focus:border-blue-600 transition-all sm:text-sm font-medium"
                placeholder="nama@email.com"
              />
            </div>
          </div>

          {view === 'login' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Kata Sandi
                </label>
                <button 
                  type="button" 
                  onClick={() => setView('forgot')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Lupa Sandi?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-0 focus:border-blue-600 transition-all sm:text-sm font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group relative w-full flex justify-center items-center gap-2 py-4 px-4 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg overflow-hidden"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {view === 'login' ? 'Masuk ke Dasbor' : 'Kirim Tautan Pemulihan'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        {view === 'forgot' && (
          <div className="text-center pt-2">
            <button 
              type="button" 
              onClick={() => setView('login')}
              className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              &larr; Kembali ke Login
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
