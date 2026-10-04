import { createClient, type SupabaseClient, type Session } from '@supabase/supabase-js';

export type WorkspaceId = 'fathur' | 'mazet';
type WorkspaceConfig = { url: string; key: string; jwksUrl: string };

const configs: Record<WorkspaceId, WorkspaceConfig> = {
  fathur: {
    url: String(import.meta.env.VITE_FATHUR_SUPABASE_URL || '').trim(),
    key: String(import.meta.env.VITE_FATHUR_SUPABASE_PUBLISHABLE_KEY || '').trim(),
    jwksUrl: String(import.meta.env.VITE_FATHUR_SUPABASE_JWKS_URL || '').trim(),
  },
  mazet: {
    url: String(import.meta.env.VITE_MAZET_SUPABASE_URL || '').trim(),
    key: String(import.meta.env.VITE_MAZET_SUPABASE_PUBLISHABLE_KEY || '').trim(),
    jwksUrl: String(import.meta.env.VITE_MAZET_SUPABASE_JWKS_URL || '').trim(),
  },
};

export const supabaseConfig = {
  configured: Object.values(configs).every((c) => Boolean(c.url && c.key)),
  workspaces: configs,
  url: configs.fathur.url,
  key: configs.fathur.key,
};

const clients: Partial<Record<WorkspaceId, SupabaseClient>> = {};
let desiredRemember = true;
let activeWorkspace: WorkspaceId =
  typeof window !== 'undefined' && window.localStorage.getItem('fazet.activeWorkspace') === 'mazet'
    ? 'mazet'
    : 'fathur';

function scopedStorage(workspace: WorkspaceId) {
  return {
    getItem(key: string) {
      if (typeof window === 'undefined') return null;
      const scoped = `fazet:${workspace}:${key}`;
      return window.localStorage.getItem(scoped) ?? window.sessionStorage.getItem(scoped);
    },
    setItem(key: string, value: string) {
      if (typeof window === 'undefined') return;
      const scoped = `fazet:${workspace}:${key}`;
      window.localStorage.removeItem(scoped);
      window.sessionStorage.removeItem(scoped);
      (desiredRemember ? window.localStorage : window.sessionStorage).setItem(scoped, value);
    },
    removeItem(key: string) {
      if (typeof window === 'undefined') return;
      const scoped = `fazet:${workspace}:${key}`;
      window.localStorage.removeItem(scoped);
      window.sessionStorage.removeItem(scoped);
    },
  };
}

export function setAuthPersistence(remember: boolean) {
  desiredRemember = remember;
}

export function getActiveWorkspace(): WorkspaceId {
  return activeWorkspace;
}

export function setActiveWorkspace(workspace: WorkspaceId) {
  activeWorkspace = workspace;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('fazet.activeWorkspace', workspace);
  }
}

export function getSupabase(workspace: WorkspaceId = activeWorkspace): SupabaseClient {
  const config = configs[workspace];
  if (!config.url || !config.key) {
    throw new Error(`Konfigurasi Supabase ${workspace === 'mazet' ? 'Mazet' : 'Fathur'} belum tersedia.`);
  }

  if (!clients[workspace]) {
    clients[workspace] = createClient(config.url, config.key, {
      auth: {
        storage: scopedStorage(workspace),
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return clients[workspace]!;
}

export const fathurSupabase = new Proxy({} as SupabaseClient, {
  get(_target, property, receiver) {
    const client = getSupabase('fathur') as unknown as Record<PropertyKey, unknown>;
    const value = Reflect.get(client, property, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

export const mazetSupabase = new Proxy({} as SupabaseClient, {
  get(_target, property, receiver) {
    const client = getSupabase('mazet') as unknown as Record<PropertyKey, unknown>;
    const value = Reflect.get(client, property, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property, receiver) {
    const client = getSupabase(activeWorkspace) as unknown as Record<PropertyKey, unknown>;
    const value = Reflect.get(client, property, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

export async function getWorkspaceSession(workspace: WorkspaceId): Promise<Session | null> {
  try {
    return (await getSupabase(workspace).auth.getSession()).data.session ?? null;
  } catch {
    return null;
  }
}

const PRODUCTION_APP_URL = 'https://pelajaranfathur.vercel.app';
export const APP_URL = String(import.meta.env.VITE_APP_URL || PRODUCTION_APP_URL).replace(/\/$/, '');
