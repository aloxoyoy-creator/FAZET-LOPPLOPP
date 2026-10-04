import { getSupabase, setActiveWorkspace, setAuthPersistence, APP_URL, type WorkspaceId } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import { trackEvent } from '../lib/analytics';
import { recordLoginSession, recordLogoutSession } from './loginSessionService';
import { recordLoginActivity } from './loginActivityService';

export async function login(
  email: string,
  password: string,
  remember: boolean,
  workspace: WorkspaceId = 'fathur',
): Promise<{ user: User; session: Session }> {
  setAuthPersistence(remember);
  const client = getSupabase(workspace);

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error('Akun tidak dapat dibuatkan sesi. Silakan coba lagi.');

  if (!data.user.email_confirmed_at) {
    await client.auth.signOut({ scope: 'local' });
    const verificationError = new Error(
      'Email akun ini belum diverifikasi. Buka email konfirmasi sebelum masuk.',
    );
    verificationError.name = 'EmailNotVerifiedError';
    throw verificationError;
  }

  try {
    const { data: profileRow, error: profileError } = await client
      .from('users')
      .select('status')
      .eq('id', data.user.id)
      .maybeSingle();
    if (!profileError && profileRow?.status === 'disabled') {
      await client.auth.signOut({ scope: 'local' });
      const blockedError = new Error(
        'Akun ini sedang diblokir di workspace ' +
          (workspace === 'mazet' ? 'Mazet' : 'Fathur') +
          '. Gunakan menu Lupa Password untuk pemulihan dan membuka kembali akses.',
      );
      blockedError.name = 'AccountBlockedError';
      throw blockedError;
    }
  } catch (statusCheckError) {
    if (statusCheckError instanceof Error && statusCheckError.name === 'AccountBlockedError') {
      throw statusCheckError;
    }
    console.warn('FAZET account status check skipped:', statusCheckError);
  }

  setActiveWorkspace(workspace);


  try {
    await recordLoginSession(data.user.id, remember);
    await recordLoginActivity('login', { workspace });
  } catch (sessionError) {
    console.error('FAZET login session tracking failed', sessionError);
  }

  await trackEvent('login');
  if (!data.session) {
    throw new Error('Login berhasil tetapi sesi tidak tersedia. Silakan coba lagi.');
  }
  return { user: data.user, session: data.session };
}

export async function register(
  name: string,
  email: string,
  password: string,
  workspace: WorkspaceId,
) {
  if (name.trim().length < 2) throw new Error('Nama lengkap minimal 2 karakter.');
  if (password.length < 8) throw new Error('Password minimal 8 karakter.');
  if (workspace !== 'fathur' && workspace !== 'mazet') {
    throw new Error('Workspace pendaftaran tidak valid.');
  }

  const client = getSupabase(workspace);
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name.trim(),
        preferred_workspace: workspace,
      },
      emailRedirectTo: `${APP_URL}/auth/confirm?workspace=${workspace}`,
    },
  });

  if (error) throw error;
  await trackEvent('sign_up');

  if (data.user && data.session) {
    await client.auth.signOut({ scope: 'local' });
    throw new Error('Pendaftaran masuk tetapi konfirmasi email Supabase belum aktif.');
  }
  if (!data.user) throw new Error('Akun belum dapat dibuat. Silakan coba lagi.');

  return data.user;
}

export async function resendConfirmationEmail(
  email: string,
  workspace: WorkspaceId = 'fathur',
) {
  const client = getSupabase(workspace);
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) throw new Error('Masukkan email akun terlebih dahulu.');

  const { error } = await client.auth.resend({
    type: 'signup',
    email: cleanEmail,
    options: {
      emailRedirectTo: `${APP_URL}/auth/confirm?workspace=${workspace}`,
    },
  });

  if (error) throw error;
}

export async function confirmEmailFromToken(
  tokenHash: string,
  workspace: WorkspaceId = 'fathur',
) {
  const client = getSupabase(workspace);
  if (!tokenHash) throw new Error('Token verifikasi email tidak ditemukan.');

  const { data, error } = await client.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'email',
  });

  if (error) throw error;
  if (!data.user?.email_confirmed_at) throw new Error('Email belum terverifikasi.');

  await client.auth.signOut({ scope: 'local' });
  return data.user;
}

export async function resetPassword(
  email: string,
  workspace: WorkspaceId = 'fathur',
) {
  const client = getSupabase(workspace);
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) throw new Error('Masukkan email akun terlebih dahulu.');

  const { error } = await client.auth.resetPasswordForEmail(cleanEmail, {
    redirectTo: `${APP_URL}/auth/reset-password?workspace=${workspace}&recovery=1`,
  });
  if (error) throw error;
}

export async function recoverBlockedAccount(workspace: WorkspaceId = 'fathur') {
  const client = getSupabase(workspace);
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError) throw userError;
  const user = userData.user;
  if (!user) throw new Error('Sesi pemulihan tidak valid. Buka kembali tautan dari email terbaru.');

  const { error: rpcError } = await client.rpc('recover_my_account');
  if (!rpcError) return user;

  const { error: updateError } = await client
    .from('users')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', user.id);
  if (updateError) {
    throw new Error(
      'Password dapat diproses, tetapi pembukaan blokir belum tersedia. Jalankan SQL recovery yang disertakan dalam proyek lalu ulangi pemulihan.',
    );
  }
  return user;
}

export async function logout(workspace?: WorkspaceId) {
  const target: WorkspaceId =
    workspace ??
    (typeof window !== 'undefined' &&
    window.localStorage.getItem('fazet.activeWorkspace') === 'mazet'
      ? 'mazet'
      : 'fathur');

  setActiveWorkspace(target);
  const client = getSupabase(target);
  const { data } = await client.auth.getUser();

  if (data.user) {
    try {
      await recordLogoutSession(data.user.id);
    } catch (sessionError) {
      console.error('FAZET logout session tracking failed', sessionError);
    }
  }

  await recordLoginActivity('logout').catch(() => undefined);
  await trackEvent('logout').catch(() => undefined);

  const { error } = await client.auth.signOut({ scope: 'local' });
  if (error) throw error;
}
