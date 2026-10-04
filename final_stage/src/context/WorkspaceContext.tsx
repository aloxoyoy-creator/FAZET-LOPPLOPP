import { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';
import type { WorkspaceId } from '../lib/supabase';

export type { WorkspaceId };

export interface WorkspaceDefinition {
  id: WorkspaceId;
  name: string;
  eyebrow: string;
  description: string;
  schoolLabel: string;
  birthdayLabel: string;
  birthdayMonth: number;
  birthdayDay: number;
  accent: string;
  scheduleSource: 'supabase' | 'mazet-json';
}

export const WORKSPACES: Record<WorkspaceId, WorkspaceDefinition> = {
  fathur: {
    id: 'fathur',
    name: 'Fathur',
    eyebrow: 'School',
    description: 'Workspace akademik pribadi Fathur.',
    schoolLabel: 'SMAN 2 Tuban',
    birthdayLabel: 'Ulang Tahun Fathur',
    birthdayMonth: 3,
    birthdayDay: 12,
    accent: 'indigo',
    scheduleSource: 'supabase',
  },
  mazet: {
    id: 'mazet',
    name: 'Mazet',
    eyebrow: 'College',
    description: 'Workspace Mazet dengan ruang data dan jadwal terpisah.',
    schoolLabel: 'Mazet • College',
    birthdayLabel: 'Ulang Tahun Mazet',
    birthdayMonth: 5,
    birthdayDay: 30,
    accent: 'violet',
    scheduleSource: 'mazet-json',
  },
};

interface WorkspaceContextValue {
  workspace: WorkspaceDefinition;
  workspaceId: WorkspaceId;
  setWorkspaceId: (id: WorkspaceId) => void;
  switchWorkspace: (id: WorkspaceId) => Promise<void>;
  hasSession: (id: WorkspaceId) => boolean;
  sessions: Record<WorkspaceId, any>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const workspaceId = auth.activeWorkspace;
  const workspace = useMemo(() => WORKSPACES[workspaceId], [workspaceId]);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      workspace,
      workspaceId,
      setWorkspaceId: (id) => void auth.switchWorkspace(id),
      switchWorkspace: (id) => auth.switchWorkspace(id),
      hasSession: auth.hasWorkspaceSession,
      sessions: auth.workspaceSessions,
    }),
    [workspace, workspaceId, auth],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used inside WorkspaceProvider');
  return context;
}
