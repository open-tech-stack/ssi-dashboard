// hooks/useUnreadCount.ts
'use client';

import { useCallback, useEffect, useState } from 'react';

import { notificationsService } from '@/services/notifications/notifications.service';

/**
 * Compteur de notifications non lues avec polling toutes les 60s.
 * Utilisé par le badge dans le Header.
 */
export function useUnreadCount(pollMs = 60_000) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await notificationsService.unreadCount();
      setCount(res.count);
    } catch {
      // silencieux — on garde l'ancienne valeur
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const interval = setInterval(refresh, pollMs);

    // Rafraîchit au retour sur l'onglet
    const onFocus = () => refresh();
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onFocus);
    }

    return () => {
      clearInterval(interval);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onFocus);
      }
    };
  }, [refresh, pollMs]);

  return { count, loading, refresh };
}