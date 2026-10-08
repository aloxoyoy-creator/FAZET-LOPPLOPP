import { useEffect, useState } from 'react';
import { subscribeNotifications } from '../services/notificationService';
import { showSystemNotification } from '../services/systemNotificationService';
import { useAuth } from '../context/AuthContext';
import type { Notification } from '../types';

let globalLastSeenId: string | null = null;
let globalIsInitialLoad = true;

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      globalIsInitialLoad = true;
      globalLastSeenId = null;
      return;
    }

    return subscribeNotifications(user.id, (newItems) => {
      setNotifications(newItems);
      
      if (globalIsInitialLoad) {
        if (newItems.length > 0) {
          globalLastSeenId = newItems[0].id;
        }
        globalIsInitialLoad = false;
        return;
      }

      // Check for new notifications
      if (newItems.length > 0) {
        const topItem = newItems[0];
        if (globalLastSeenId !== topItem.id && !topItem.read) {
          // New unread notification arrived
          showSystemNotification(topItem.title, topItem.message, topItem.actionUrl);
          globalLastSeenId = topItem.id;
        }
      }
    }, () => setNotifications([]));
  }, [user]);

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length
  };
}
