import { supabase } from './supabase';

export interface PresenceState {
  [key: string]: {
    user_id: string;
    online_at: string;
  }[];
}

export function subscribePresence(workspaceId: string, userId: string, onUpdate: (state: PresenceState) => void) {
  const channel = supabase.channel(`presence:${workspaceId}`, {
    config: {
      presence: {
        key: userId,
      },
    },
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      onUpdate(channel.presenceState() as PresenceState);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: userId,
          online_at: new Date().toISOString(),
        });
      }
    });

  return () => {
    void supabase.removeChannel(channel);
  };
}
