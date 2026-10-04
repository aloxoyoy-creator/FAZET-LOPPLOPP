import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { friendlyError } from '../lib/errors';
import mountFazetLogin from '../vendor/fazet-login-9';

export function AuthLayout({
  children,
  eyebrow,
}: {
  children: ReactNode;
  eyebrow: string;
}) {
  return (
    <div className="auth-page min-h-screen bg-slate-950 lg:grid lg:grid-cols-[1.05fr_.95fr]">
      <aside className="auth-visual relative hidden overflow-hidden p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="auth-grid" />
        <span className="auth-orb auth-orb--one" />
        <span className="auth-orb auth-orb--two" />
        <span className="auth-orb auth-orb--three" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white">
            <img src="/brand/fathur-school-hub-crest.png" alt="FAZET" className="h-11 w-11 rounded-xl object-cover" />
            <div>
              <div className="text-sm font-black tracking-tight">FAZET</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Dual workspace</div>
            </div>
          </div>
          <div className="mt-20 max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-blue-200 backdrop-blur-md">{eyebrow}</div>
            <h2 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-[-0.04em] text-white xl:text-6xl">
              Satu ruang untuk <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300 bg-clip-text text-transparent">Fathur & Mazet.</span>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 xl:text-lg">
              Jadwal, tugas, insight, chat, dan aktivitas tetap terhubung dalam dua workspace yang terpisah tetapi bisa berkolaborasi.
            </p>
          </div>
        </div>
        <div className="relative z-10 text-xs font-semibold text-slate-500">FAZET · Fathur × Mazet workspace</div>
      </aside>
      <main className="auth-panel flex min-h-screen items-start overflow-y-auto overflow-x-hidden bg-slate-50 p-4 dark:bg-slate-950 sm:p-6 md:p-8 xl:p-10 lg:h-screen">
        <div className="mx-auto w-full max-w-[470px] py-5 sm:py-8">{children}</div>
      </main>
    </div>
  );
}

export function FazetLoginPage({
  initialView = 'login',
}: {
  initialView?: 'login' | 'forgot';
}) {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const host = useRef<HTMLDivElement>(null);
  const ctx = useRef({ auth, navigate, location });
  const [failed, setFailed] = useState(false);

  ctx.current = { auth, navigate, location };

  useEffect(() => {
    let dead = false;
    let instance: { destroy(): void } | null = null;

    if (!host.current) return;

    try {
      const current = () => ctx.current;
      const from = () =>
        ((current().location.state as { from?: string } | null)?.from) || '/';

      instance = mountFazetLogin(host.current, {
        workspace: current().auth.activeWorkspace,
        initialView,
        sessions: {
          fathur: current().auth.hasWorkspaceSession('fathur'),
          mazet: current().auth.hasWorkspaceSession('mazet'),
        },
        login: (
          email: string,
          password: string,
          remember: boolean,
          workspace: 'fathur' | 'mazet',
        ) => current().auth.login(email, password, remember, workspace),
        resetPassword: (
          email: string,
          workspace: 'fathur' | 'mazet',
        ) => current().auth.resetPassword(email, workspace),
        signOut: () => current().auth.logout(),
        onSuccess: () => current().navigate(from(), { replace: true }),
        openWorkspace: (workspace: 'fathur' | 'mazet') => {
          void current().auth.switchWorkspace(workspace);
          current().navigate(from(), { replace: true });
        },
        navigate: (path: string) => current().navigate(path),
        formatError: friendlyError,
      });
    } catch {
      if (!dead) setFailed(true);
    }

    return () => {
      dead = true;
      instance?.destroy();
    };
  }, [initialView]);

  if (failed) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          background: '#070b14',
          color: '#f8fafc',
          padding: 24,
          textAlign: 'center',
        }}
      >
        <div>
          <p style={{ fontWeight: 800, marginBottom: 12 }}>
            Halaman login gagal dimuat.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 18px',
              borderRadius: 12,
              background: '#6366f1',
              color: '#fff',
              fontWeight: 800,
            }}
          >
            Muat ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={host}
      className="fazet-auth-host"
      style={{
        minHeight: '100dvh',
        background: '#070b14',
      }}
    />
  );
}

export default function Login() {
  return <FazetLoginPage initialView="login" />;
}
