// REFERENSI untuk saat folder src/ proyek tersedia lagi.
// Ini padanan TSX dari patch yang sudah diuji di dist/ (belum dikompilasi terhadap src asli,
// karena zip yang diterima tidak berisi src/). Sesuaikan path import useAuth/st dengan proyekmu.
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';   // = fungsi It() di bundle
import { friendlyError } from '@/lib/errors';        // = fungsi st() di bundle

export function FazetLoginPage({ initialView = 'login' }: { initialView?: 'login' | 'forgot' }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const host = useRef<HTMLDivElement>(null);
  const ctx = useRef({ auth, navigate, location });
  const [failed, setFailed] = useState(false);
  ctx.current = { auth, navigate, location };

  useEffect(() => {
    let dead = false;
    let inst: { destroy(): void } | null = null;
    // Modul ada di public/assets/fazet-login-9.js (atau impor langsung dari src/features/login).
    import(/* @vite-ignore */ '/assets/fazet-login-9.js')
      .then((m) => {
        if (dead || !host.current) return;
        const c = () => ctx.current;
        const from = () => (c().location.state as { from?: string } | null)?.from || '/';
        inst = m.mountFazetLogin(host.current, {
          workspace: c().auth.activeWorkspace,
          initialView,
          sessions: { fathur: c().auth.hasWorkspaceSession('fathur'), mazet: c().auth.hasWorkspaceSession('mazet') },
          login: (email: string, pw: string, remember: boolean, ws: 'fathur' | 'mazet') => c().auth.login(email, pw, remember, ws),
          resetPassword: (email: string, ws: 'fathur' | 'mazet') => c().auth.resetPassword(email, ws),
          signOut: () => c().auth.logout(),
          onSuccess: () => c().navigate(from(), { replace: true }),
          openWorkspace: (ws: 'fathur' | 'mazet') => { c().auth.switchWorkspace(ws); c().navigate(from(), { replace: true }); },
          navigate: (p: string) => c().navigate(p),
          formatError: friendlyError,
        });
      })
      .catch(() => { if (!dead) setFailed(true); });
    return () => { dead = true; inst?.destroy(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (failed) return <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: '#05070c', color: '#f8fafc' }}>Halaman login gagal dimuat. <button onClick={() => location.reload()}>Muat ulang</button></div>;
  return <div ref={host} style={{ minHeight: '100dvh', background: '#05070c' }} />;
}
// Rute:  /login → <FazetLoginPage />   ·   /forgot-password → <FazetLoginPage initialView="forgot" />
