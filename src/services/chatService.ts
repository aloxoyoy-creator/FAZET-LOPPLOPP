import { supabase, fathurSupabase, mazetSupabase } from '../lib/supabase';
import { subscribeToPostgresChanges } from '../lib/realtime';
import type { WorkspaceId } from '../context/WorkspaceContext';

export interface ChatConversation {
  id: string;
  workspaceId: WorkspaceId;
  title: string | null;
  kind: 'direct' | 'group' | 'workspace';
  updatedAt: string;
  unreadCount?: number;
  is_locked?: boolean;
}

export interface ChatMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  body: string;
  createdAt: string;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  attachmentType?: string | null;
  readBy: string[];
  is_edited?: boolean;
  is_deleted?: boolean;
  is_pinned?: boolean;
}

export async function listConversations(userId: string, workspaceId: string): Promise<ChatConversation[]> {
  const { data: members, error: memErr } = await supabase
    .from('conversation_members')
    .select('conversation_id, last_read_at')
    .eq('user_id', userId);

  if (memErr) throw memErr;
  const conversationIds = (members || []).map(m => m.conversation_id);
  
  if (conversationIds.length === 0) return [];

  const { data: convs, error: convErr } = await supabase
    .from('conversations')
    .select('id, workspace_id, kind, title, updated_at, is_locked')
    .in('id', conversationIds)
    .eq('workspace_id', workspaceId)
    .order('updated_at', { ascending: false });

  if (convErr) throw convErr;
  
  const result: ChatConversation[] = [];
  for (const conv of convs || []) {
    const memberRow = members.find(m => m.conversation_id === conv.id);
    const lastReadAt = memberRow?.last_read_at;

    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conv.id)
      .neq('sender_id', userId)
      .gt('created_at', lastReadAt || '1970-01-01T00:00:00Z');

    result.push({
      id: conv.id,
      workspaceId: conv.workspace_id as WorkspaceId,
      title: conv.title,
      kind: conv.kind,
      updatedAt: conv.updated_at,
      is_locked: conv.is_locked,
      unreadCount: count || 0
    });
  }
  
  return result;
}

export async function listWorkspaceUsers(workspaceId: WorkspaceId, query: string = ''): Promise<ChatMember[]> {
  let req = supabase.from('users').select('id, name, email, photo_url, workspace_id').eq('status', 'active');
  const q = query.trim();
  if (q) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(q) || /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(q);
    if (isUUID) {
      req = req.eq('id', q);
    } else {
      req = req.or(`name.ilike.%${q}%,email.ilike.%${q}%,id.eq.${q}`);
    }
  }
  const { data, error } = await req.limit(50);
  if (error) throw error;
  
  return (data || []).map(r => ({
    id: r.id,
    name: r.name,
    email: r.email,
    photoUrl: r.photo_url,
    workspaceId: r.workspace_id,
    role: 'member'
  }));
}

export async function getMyChatToken(userId: string): Promise<string> {
  const { data, error } = await supabase.rpc('get_current_chat_token', { p_user_id: userId });
  if (error) throw error;
  return data as string;
}

export async function createSecureDirectChat(workspaceId: WorkspaceId, targetUserId: string, token: string): Promise<string> {
  const { data, error } = await supabase.rpc('create_secure_direct_chat', {
    p_workspace_id: workspaceId,
    p_target_user_id: targetUserId,
    p_token: token
  });
  if (error) throw error;
  return data as string;
}

export async function createConversation(workspaceId: WorkspaceId, kind: 'direct'|'group', title: string, memberIds: string[]): Promise<string> {
  const { data, error } = await supabase.rpc('create_conversation_with_members', {
    p_workspace_id: workspaceId,
    p_kind: kind,
    p_title: title,
    p_member_ids: memberIds
  });
  if (error) throw error;
  return data as string;
}

export async function fetchMessages(conversationId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      id,
      conversation_id,
      sender_id,
      body,
      created_at,
      attachment_path,
      attachment_name,
      attachment_type,
      is_edited,
      is_deleted,
      is_pinned,
      users!messages_sender_id_fkey(name),
      message_reads(user_id)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(500);

  if (error) throw error;

  return Promise.all((data || []).map(async (r: any) => {
    let attachmentUrl = null;
    if (r.attachment_path) {
      const { data: urlData } = await supabase.storage.from('chat-attachments').createSignedUrl(r.attachment_path, 3600);
      attachmentUrl = urlData?.signedUrl;
    }
    
    return {
      id: r.id,
      conversationId: r.conversation_id,
      senderId: r.sender_id,
      senderName: Array.isArray(r.users) ? r.users[0]?.name : r.users?.name || 'Unknown',
      body: r.body,
      createdAt: r.created_at,
      attachmentUrl,
      attachmentName: r.attachment_name,
      attachmentType: r.attachment_type,
      is_edited: r.is_edited,
      is_deleted: r.is_deleted,
      is_pinned: r.is_pinned,
      readBy: (r.message_reads || []).map((mr: any) => mr.user_id)
    };
  }));
}

export async function sendMessage(conversationId: string, userId: string, body: string, file?: File | null) {
  let attachment_path = null;
  let attachment_name = null;
  let attachment_type = null;
  let attachment_size = null;

  const messageId = crypto.randomUUID();

  if (file) {
    attachment_name = file.name;
    attachment_type = file.type || 'application/octet-stream';
    attachment_size = file.size;
    attachment_path = `${conversationId}/${userId}/${messageId}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    
    const { error: uploadError } = await supabase.storage.from('chat-attachments').upload(attachment_path, file);
    if (uploadError) throw uploadError;
  }

  const { error } = await supabase.from('messages').insert({
    id: messageId,
    conversation_id: conversationId,
    sender_id: userId,
    body: body.trim() || 'ðŸ“Ž Lampiran',
    attachment_path,
    attachment_name,
    attachment_type,
    attachment_size
  });

  if (error) throw error;
}

export async function markAsRead(conversationId: string, messageIds: string[], userId: string) {
  if (messageIds.length > 0) {
    await supabase.from('message_reads').upsert(
      messageIds.map(id => ({ message_id: id, user_id: userId })),
      { onConflict: 'message_id,user_id' }
    );
  }
  await supabase.from('conversation_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);
}

export function subscribeMessages(conversationId: string, onChange: () => void, onError: (err: any) => void) {
  const unsub1 = subscribeToPostgresChanges({ topic: `chat:${conversationId}`, table: 'messages', filter: `conversation_id=eq.${conversationId}`, onChange, onError });
  const unsub2 = subscribeToPostgresChanges({ topic: `reads:${conversationId}`, table: 'message_reads', onChange, onError });
  return () => { unsub1(); unsub2(); };
}

export function subscribeConversations(workspaceId: string, userId: string, onChange: () => void) {
  const unsub1 = subscribeToPostgresChanges({ topic: `conv:${userId}`, table: 'conversation_members', onChange, onError: console.error });
  const unsub2 = subscribeToPostgresChanges({ topic: `msgs:${userId}`, table: 'messages', onChange, onError: console.error });
  return () => { unsub1(); unsub2(); };
}

export async function editMessage(messageId: string, newBody: string) {
  const { error } = await supabase.from('messages').update({ body: newBody, is_edited: true }).eq('id', messageId);
  if (error) throw error;
}

export async function deleteMessage(messageId: string) {
  const { error } = await supabase.from('messages').update({ body: 'ðŸš« Pesan ini telah dihapus', is_deleted: true }).eq('id', messageId);
  if (error) throw error;
}

export async function deleteConversation(conversationId: string) {
  const { error } = await supabase.from('conversations').delete().eq('id', conversationId);
  if (error) throw error;
}

export async function toggleLockConversation(conversationId: string, isLocked: boolean) {
  const { error } = await supabase.from('conversations').update({ is_locked: isLocked }).eq('id', conversationId);
  if (error) throw error;
}


export async function togglePinMessage(messageId: string, pin: boolean) {
  const { error } = await supabase.from('messages').update({ is_pinned: pin }).eq('id', messageId);
  if (error) throw error;
}

export async function toggleStarMessage(userId: string, messageId: string, star: boolean) {
  if (star) {
    const { error } = await supabase.from('starred_messages').insert({ user_id: userId, message_id: messageId });
    if (error) throw error;
  } else {
    const { error } = await supabase.from('starred_messages').delete().eq('user_id', userId).eq('message_id', messageId);
    if (error) throw error;
  }
}

export async function fetchStatuses(workspaceId: string) {
  const { data, error } = await supabase
    .from('chat_statuses')
    .select('id, user_id, body, media_path, expires_at, created_at, users(name, photo_url)')
    .eq('workspace_id', workspaceId)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function postStatus(workspaceId: string, userId: string, body: string, mediaPath?: string) {
  const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabase.from('chat_statuses').insert({
    workspace_id: workspaceId,
    user_id: userId,
    body,
    media_path: mediaPath,
    expires_at
  });
  if (error) throw error;
}

