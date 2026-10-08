import { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database, ensureAnonymousAuth } from '../lib/firebase';

export type AccessStatus = 'none' | 'pending' | 'approved';

export function useMyMineeAccess() {
  const [status, setStatus] = useState<AccessStatus>('none');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!database) {
      setLoading(false);
      return;
    }

    ensureAnonymousAuth().then(() => {
      const accessRef = ref(database, 'myminee_access/status');
      const unsub = onValue(accessRef, (snapshot) => {
        const val = snapshot.val();
        if (val) {
          setStatus(val as AccessStatus);
        } else {
          setStatus('none');
        }
        setLoading(false);
      });

      return () => unsub();
    }).catch((err) => {
      console.error('Firebase Auth Error:', err);
      setLoading(false);
    });
  }, []);

  const requestAccess = async () => {
    if (!database) return;
    await ensureAnonymousAuth();
    await set(ref(database, 'myminee_access'), {
      status: 'pending',
      updatedAt: Date.now()
    });
  };

  const approveAccess = async () => {
    if (!database) return;
    await ensureAnonymousAuth();
    await set(ref(database, 'myminee_access'), {
      status: 'approved',
      updatedAt: Date.now()
    });
  };

  const revokeAccess = async () => {
    if (!database) return;
    await ensureAnonymousAuth();
    await set(ref(database, 'myminee_access'), {
      status: 'none',
      updatedAt: Date.now()
    });
  };

  return {
    status,
    loading,
    requestAccess,
    approveAccess,
    revokeAccess
  };
}
