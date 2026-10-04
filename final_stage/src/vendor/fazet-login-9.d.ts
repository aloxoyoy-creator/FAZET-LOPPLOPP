import type { ReactNode } from 'react';

type WorkspaceId = 'fathur' | 'mazet';

type FazetLoginOptions = {
  workspace: WorkspaceId;
  initialView?: 'login' | 'forgot';
  sessions?: {
    fathur: boolean;
    mazet: boolean;
  };
  login?: (
    email: string,
    password: string,
    remember: boolean,
    workspace: WorkspaceId,
  ) => unknown;
  resetPassword?: (email: string, workspace: WorkspaceId) => unknown;
  recoveryMode?: 'password' | 'blocked';
  signOut?: () => unknown;
  onSuccess?: () => void;
  openWorkspace?: (workspace: WorkspaceId) => unknown;
  navigate?: (path: string) => unknown;
  formatError?: (error: unknown) => string;
};

type FazetLoginInstance = {
  destroy(): void;
};

declare const mountFazetLogin: (
  host: HTMLElement,
  options: FazetLoginOptions,
) => FazetLoginInstance;

export default mountFazetLogin;
