import { supabase } from '../lib/supabase';
import { subscribeToPostgresChanges } from '../lib/realtime';
import type { Notification } from '../types';

function mapNotification(r: Record<string, unknown>): Notification {
  return {
    id: String(r.id),
    userId: String(r.user_id),
    title: String(r.title ?? ''),
    message: String(r.message ?? ''),
    type: (r.type as Notification['type']) || 'system',
    read: Boolean(r.read),
    createdAt: r.created_at ? String(r.created_at) : undefined,
    actionUrl: r.action_url ? String(r.action_url) : undefined,
  };
}

export function subscribeNotifications(
  uid: string,
  cb: (items: Notification[]) => void,
  onError?: (e: unknown) => void
) {
  let mounted = true;

  const fetchList = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        onError?.(error);
        return;
      }
      if (mounted) {
        cb((data || []).map(mapNotification));
      }
    } catch (err) {
      onError?.(err);
    }
  };

  void fetchList();

  const unsubscribe = subscribeToPostgresChanges({
    topic: `notifications:${uid}`,
    table: 'notifications',
    filter: `user_id=eq.${uid}`,
    onChange: () => void fetchList(),
    onError
  });

  return () => {
    mounted = false;
    unsubscribe();
  };
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteNotification(id: string) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function deleteAllReadNotifications(uid: string) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', uid)
    .eq('read', true);
  if (error) throw error;
}

export async function createNotificationOnce(args: {
  userId: string;
  title: string;
  message: string;
  type: Notification['type'];
  actionUrl?: string;
  idempotencyKey: string;
}) {
  const { data, error } = await supabase
    .from('notifications')
    .upsert(
      {
        user_id: args.userId,
        title: args.title,
        message: args.message,
        type: args.type,
        action_url: args.actionUrl ?? null,
        idempotency_key: args.idempotencyKey
      },
      { onConflict: 'user_id,idempotency_key' }
    )
    .select('*')
    .maybeSingle();

  if (error) throw error;
  return data ? mapNotification(data) : null;
}

export async function createNotification(args: {
  userId: string;
  title: string;
  message: string;
  type: Notification['type'];
  actionUrl?: string;
}) {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: args.userId,
      title: args.title,
      message: args.message,
      type: args.type,
      action_url: args.actionUrl ?? null,
      read: false
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapNotification(data);
}

export async function markAllNotificationsRead(uid: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', uid)
    .eq('read', false);
  if (error) throw error;
}
