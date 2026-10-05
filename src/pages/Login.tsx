import { useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { friendlyError } from '../lib/errors';

export function AuthLayout({
  children,
  eyebrow,
}: {
  children: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ paddingTop: "max(3rem, env(safe-area-inset-top))" }}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <img 
            src="/brand/fathur-school-hub-crest.png" 
            alt="FAZET Logo" 
            className="h-16 w-16 rounded-2xl shadow-xl"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
          FAZET
        </h2>
        {eyebrow && (
          <p className="mt-2 text-center text-sm text-slate-400 font-medium">
            {eyebrow}
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-slate-800">
          {children}
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
        setMessage('Tautan reset password telah dikirim ke email Anda.');
      }
    } catch (err: any) {
      setError(friendlyError(err) || err.message || 'Gagal memproses permintaan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout eyebrow={view === 'login' ? 'Sistem login minimalis yang ringan dan cepat.' : 'Reset Password'}>
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg text-center">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 text-sm p-3 rounded-lg text-center">
            {message}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Pilih Workspace
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setWorkspace('fathur')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-colors ${
                workspace === 'fathur' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              Fathur
            </button>
            <button
              type="button"
              onClick={() => setWorkspace('mazet')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-colors ${
                workspace === 'mazet' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              Mazet
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300">
            Email
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full px-4 py-3 border border-slate-700 rounded-lg shadow-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm bg-slate-950 text-white transition-all"
              placeholder="nama@email.com"
            />
          </div>
        </div>

        {view === 'login' && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-slate-700 rounded-lg shadow-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm bg-slate-950 text-white transition-all"
                placeholder="••••••••"
              />
            </div>
            <div className="flex items-center justify-end mt-2">
              <button 
                type="button" 
                onClick={() => setView('forgot')}
                className="text-sm font-medium text-blue-400 hover:text-blue-300"
              >
                Lupa Password?
              </button>
            </div>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Memproses...' : view === 'login' ? 'Masuk' : 'Kirim Reset Password'}
          </button>
        </div>

        {view === 'forgot' && (
          <div className="text-center mt-4">
            <button 
              type="button" 
              onClick={() => setView('login')}
              className="text-sm font-medium text-slate-400 hover:text-slate-300"
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
