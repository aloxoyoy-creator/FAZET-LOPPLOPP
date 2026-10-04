import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import {
  getActiveWorkspace,
  getSupabase,
  setActiveWorkspace,
  type WorkspaceId,
} from '../lib/supabase';
import {
  login as loginService,
  logout as logoutService,
  register as registerService,
  resetPassword as resetService,
} from '../services/authService';
import { subscribeUserProfile } from '../services/userService';
import { touchCurrentLoginSession } from '../services/loginSessionService';
import { recordLoginActivity } from '../services/loginActivityService';
import type { UserProfile } from '../types';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  isAdmin: boolean;
  activeWorkspace: WorkspaceId;
  workspaceSessions: Record<WorkspaceId, Session | null>;
  hasWorkspaceSession: (workspace: WorkspaceId) => boolean;
  login: (
    email: string,
    password: string,
    remember: boolean,
    workspace?: WorkspaceId,
  ) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    workspace: WorkspaceId,
  ) => Promise<void>;
  logout: (workspace?: WorkspaceId) => Promise<void>;
  resetPassword: (email: string, workspace?: WorkspaceId) => Promise<void>;
  switchWorkspace: (workspace: WorkspaceId) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapProfile(row: Record<string, any>, workspace: WorkspaceId): UserProfile {
  return {
    uid: row.id,
    name: row.name || row.email || 'Pengguna',
    email: row.email || '',
    photoURL: row.photo_url || undefined,
    role: row.role === 'admin' ? 'admin' : 'user',
    status: row.status === 'disabled' ? 'disabled' : 'active',
    workspaceId: workspace,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at,
  };
}

function fallbackProfile(user: User, workspace: WorkspaceId): UserProfile {
  const metadata = user.user_metadata ?? {};
  return {
    uid: user.id,
    name: String(metadata.name || metadata.full_name || user.email || 'Pengguna'),
    email: user.email || '',
    photoURL: metadata.avatar_url ? String(metadata.avatar_url) : undefined,
    role:
      user.app_metadata?.role === 'admin' || user.user_metadata?.role === 'admin'
        ? 'admin'
        : 'user',
    status: 'active',
    workspaceId: workspace,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [activeWorkspace, setActiveWorkspaceState] =
    useState<WorkspaceId>(getActiveWorkspace());
  const [workspaceSessions, setWorkspaceSessions] = useState<
    Record<WorkspaceId, Session | null>
  >({ fathur: null, mazet: null });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const profileCleanup = useRef<(() => void) | undefined>(undefined);

  const refreshActiveProfile = async (
    workspace: WorkspaceId = activeWorkspace,
    sessions = workspaceSessions,
  ) => {
    const session = sessions[workspace];
    if (!session?.user) {
      setProfile(null);
      return;
    }

    try {
      const { data, error } = await getSupabase(workspace)
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(
        data
          ? mapProfile(data as Record<string, any>, workspace)
          : {
              uid: session.user.id,
              name:
                String(
                  session.user.user_metadata?.name ||
                    session.user.user_metadata?.full_name ||
                    session.user.email ||
                    'Pengguna',
                ),
              email: session.user.email || '',
              role:
                session.user.app_metadata?.role === 'admin' ||
                session.user.user_metadata?.role === 'admin'
                  ? 'admin'
                  : 'user',
              status: 'active',
              workspaceId: workspace,
            },
      );
    } catch (error) {
      // A successful Supabase Auth session must not be blocked by an optional
      // profile-table/RLS/realtime failure. Keep an auth-derived profile and
      // let the rest of the app continue; the DB profile can refresh later.
      console.error('FAZET profile load failed', error);
      setProfile(fallbackProfile(session.user, workspace));
    }
  };

  useEffect(() => {
    let alive = true;
    const cleanup: Array<() => void> = [];

    const initialize = async () => {
      try {
        const workspaces: WorkspaceId[] = ['fathur', 'mazet'];
        const sessions = await Promise.all(
          workspaces.map(async (workspace) => {
            const { data, error } = await getSupabase(workspace).auth.getSession();
            if (error) throw error;
            return [workspace, data.session] as const;
          }),
        );

        if (!alive) return;

        const next = {
          fathur: sessions.find(([key]) => key === 'fathur')?.[1] ?? null,
          mazet: sessions.find(([key]) => key === 'mazet')?.[1] ?? null,
        };

        const preferred =
          next[activeWorkspace] != null
            ? activeWorkspace
            : next.fathur != null
              ? 'fathur'
              : next.mazet != null
                ? 'mazet'
                : activeWorkspace;

        setWorkspaceSessions(next);

        if (preferred !== activeWorkspace) {
          setActiveWorkspace(preferred);
          setActiveWorkspaceState(preferred);
        }

        setLoading(false);
      } catch (error) {
        console.error('FAZET auth initialization failed', error);
        if (alive) {
          setAuthError(
            error instanceof Error
              ? error.message
              : 'Sesi belum dapat diperiksa.',
          );
          setLoading(false);
        }
      }
    };

    (['fathur', 'mazet'] as WorkspaceId[]).forEach((workspace) => {
      try {
        const {
          data: { subscription },
        } = getSupabase(workspace).auth.onAuthStateChange((_event, session) => {
          if (!alive) return;
          setWorkspaceSessions((previous) => ({
            ...previous,
            [workspace]: session,
          }));
        });
        cleanup.push(() => subscription.unsubscribe());
      } catch (error) {
        console.error(`FAZET ${workspace} auth listener failed`, error);
      }
    });

    void initialize();

    return () => {
      alive = false;
      cleanup.forEach((fn) => fn());
      profileCleanup.current?.();
      profileCleanup.current = undefined;
    };
    // Active workspace is deliberately captured from initial app boot here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    profileCleanup.current?.();
    profileCleanup.current = undefined;

    const session = workspaceSessions[activeWorkspace];
    if (!session?.user) {
      setProfile(null);
      return;
    }

    try {
      profileCleanup.current = subscribeUserProfile(
        session.user.id,
        (nextProfile) => {
          if (nextProfile) setProfile(nextProfile);
          else void refreshActiveProfile(activeWorkspace, workspaceSessions);
        },
        (error) => console.error('FAZET profile subscription failed', error),
      );
    } catch (error) {
      console.error('FAZET profile subscription setup failed', error);
    }

    void refreshActiveProfile(activeWorkspace, workspaceSessions);

    const heartbeat = () => {
      void touchCurrentLoginSession(session.user.id).catch(() => undefined);
      void recordLoginActivity('heartbeat').catch(() => undefined);
    };
    heartbeat();
    const timer = window.setInterval(heartbeat, 60_000);

    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspace, workspaceSessions.fathur, workspaceSessions.mazet]);

  const switchWorkspace = async (workspace: WorkspaceId) => {
    setActiveWorkspace(workspace);
    setActiveWorkspaceState(workspace);

    const session = workspaceSessions[workspace];
    if (session?.user) {
      await refreshActiveProfile(workspace, workspaceSessions);
    } else {
      setProfile(null);
    }
  };

  const login = async (
    email: string,
    password: string,
    remember: boolean,
    workspace: WorkspaceId = activeWorkspace,
  ) => {
    setAuthError(null);
    const result = await loginService(email, password, remember, workspace);
    setActiveWorkspace(workspace);
    setActiveWorkspaceState(workspace);

    // Use the session returned by signInWithPassword immediately. Do not make
    // a second getSession() call a prerequisite for navigation; this prevents
    // a storage race from sending a valid login back through the guest guard.
    const nextSessions = { ...workspaceSessions, [workspace]: result.session };
    setWorkspaceSessions(nextSessions);
    setProfile(fallbackProfile(result.user, workspace));

    // Database profile loading is non-blocking after authentication succeeds.
    void refreshActiveProfile(workspace, nextSessions);
  };

  const logout = async (workspace?: WorkspaceId) => {
    const target = workspace ?? activeWorkspace;
    await logoutService(target);
    setWorkspaceSessions((previous) => ({
      ...previous,
      [target]: null,
    }));

    if (target === activeWorkspace) {
      const fallback =
        workspaceSessions[target === 'fathur' ? 'mazet' : 'fathur'];
      if (fallback) {
        const nextWorkspace = target === 'fathur' ? 'mazet' : 'fathur';
        setActiveWorkspace(nextWorkspace);
        setActiveWorkspaceState(nextWorkspace);
      } else {
        setProfile(null);
      }
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user: workspaceSessions[activeWorkspace]?.user ?? null,
      session: workspaceSessions[activeWorkspace],
      profile,
      loading,
      authError,
      isAuthenticated: Boolean(
        workspaceSessions[activeWorkspace]?.user?.email_confirmed_at,
      ),
      isEmailVerified: Boolean(
        workspaceSessions[activeWorkspace]?.user?.email_confirmed_at,
      ),
      isAdmin:
        profile?.role === 'admin' ||
        workspaceSessions[activeWorkspace]?.user?.app_metadata?.role === 'admin' ||
        workspaceSessions[activeWorkspace]?.user?.user_metadata?.role === 'admin',
      activeWorkspace,
      workspaceSessions,
      hasWorkspaceSession: (workspace) => Boolean(workspaceSessions[workspace]?.user),
      login,
      register: async (name, email, password, workspace) => {
        await registerService(name, email, password, workspace);
      },
      logout,
      resetPassword: resetService,
      switchWorkspace,
      refreshProfile: () => refreshActiveProfile(activeWorkspace, workspaceSessions),
    }),
    [activeWorkspace, workspaceSessions, profile, loading, authError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
