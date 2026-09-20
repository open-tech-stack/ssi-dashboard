// app/(dashboard)/notifications/page.tsx
'use client';

import { CheckCheck, Loader2, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import NotificationItem from '@/components/notifications/NotificationItem';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useUnreadCount } from '@/hooks/useUnreadCount';
import { notificationsService } from '@/services/notifications/notifications.service';
import type {
  Notification,
  NotificationType,
} from '@/types/notification.types';

type ReadFilter = 'all' | 'unread' | 'read';

export default function NotificationsPage() {
  const { colors } = useTheme();
  const { refresh: refreshUnread } = useUnreadCount();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType | ''>('');
  const [markingAll, setMarkingAll] = useState(false);

  // ---- Chargement ----
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = {
        page: 1,
        pageSize: 200,
      };
      if (typeFilter) params.type = typeFilter;
      if (readFilter === 'unread') params.read = false;
      if (readFilter === 'read') params.read = true;

      const res = await notificationsService.list(params);
      setNotifications(res.items);
    } catch {
      setError('Impossible de charger les notifications.');
    } finally {
      setLoading(false);
    }
  }, [readFilter, typeFilter]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ---- Marquer une notification lue ----
  const handleMarkRead = useCallback(
    async (id: string) => {
      try {
        await notificationsService.markRead(id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
        );
        refreshUnread();
      } catch {
        // silencieux
      }
    },
    [refreshUnread],
  );

  // ---- Marquer toutes lues ----
  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationsService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      refreshUnread();
    } catch {
      alert('Impossible de marquer toutes les notifications.');
    } finally {
      setMarkingAll(false);
    }
  };

  // ---- Supprimer toutes les lues ----
  const handleRemoveAllRead = async () => {
    if (
      !confirm(
        'Supprimer toutes les notifications lues ? Cette action est irréversible.',
      )
    )
      return;

    try {
      await notificationsService.removeAllRead();
      setNotifications((prev) => prev.filter((n) => !n.read));
      refreshUnread();
    } catch {
      alert('Impossible de supprimer les notifications lues.');
    }
  };

  // ---- Compteurs ----
  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.read).length;
    return { total, unread };
  }, [notifications]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      {/* Titre + actions */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-black tracking-wide"
            style={{ color: colors.text }}
          >
            Notifications
          </h1>
          <p
            className="mt-1 text-sm font-medium"
            style={{ color: colors.textSecondary }}
          >
            {stats.unread > 0
              ? `${stats.unread} non lue${stats.unread > 1 ? 's' : ''} sur ${stats.total}`
              : 'Toutes les notifications sont lues.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={markingAll || stats.unread === 0}
            className="flex h-10 items-center gap-2 rounded-lg border px-3 text-xs font-bold transition hover:opacity-90 disabled:opacity-40"
            style={{
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: colors.surface,
            }}
          >
            {markingAll ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4" />
            )}
            Tout marquer lu
          </button>

          <button
            type="button"
            onClick={handleRemoveAllRead}
            className="flex h-10 items-center gap-2 rounded-lg border px-3 text-xs font-bold transition hover:bg-red-500/10 hover:text-red-500"
            style={{
              borderColor: colors.border,
              color: colors.textSecondary,
              backgroundColor: colors.surface,
            }}
          >
            <Trash2 className="h-4 w-4" />
            Supprimer les lues
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div
        className="flex flex-wrap items-center gap-3 rounded-xl border p-3"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        {/* Read filter */}
        <div className="flex gap-1">
          {(['all', 'unread', 'read'] as ReadFilter[]).map((r) => {
            const active = readFilter === r;
            const label =
              r === 'all' ? 'Toutes' : r === 'unread' ? 'Non lues' : 'Lues';
            return (
              <button
                key={r}
                type="button"
                onClick={() => setReadFilter(r)}
                className="h-8 rounded-md border px-3 text-xs font-bold transition"
                style={{
                  backgroundColor: active
                    ? colors.primary + '22'
                    : 'transparent',
                  borderColor: active ? colors.primary : colors.border,
                  color: active ? colors.primary : colors.textSecondary,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value as NotificationType | '')
          }
          className="h-8 rounded-md border px-3 text-xs font-bold outline-none"
          style={{
            backgroundColor: colors.surfaceAlt,
            borderColor: colors.border,
            color: colors.text,
          }}
        >
          <option value="">Tous les types</option>
          <option value="PROGRAMME">Programme</option>
          <option value="EVENEMENT">Événement</option>
          <option value="INFO">Info</option>
          <option value="PRIERE">Prière</option>
          <option value="RAPPEL">Rappel</option>
          <option value="GENERIC">Générique</option>
        </select>
      </div>

      {/* Erreur */}
      {error && (
        <div
          className="rounded-lg border p-3 text-sm"
          style={{
            backgroundColor: colors.danger + '11',
            borderColor: colors.danger + '44',
            color: colors.danger,
          }}
        >
          {error}
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-xl border p-16"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <Loader2
            className="h-6 w-6 animate-spin"
            style={{ color: colors.primary }}
          />
          <p className="text-xs font-semibold" style={{ color: colors.textMuted }}>
            Chargement des notifications…
          </p>
        </div>
      ) : notifications.length === 0 ? (
        <div
          className="rounded-xl border border-dashed p-16 text-center"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <p className="text-sm font-bold" style={{ color: colors.text }}>
            Aucune notification
          </p>
          <p
            className="mt-1 text-xs"
            style={{ color: colors.textSecondary }}
          >
            {readFilter === 'unread'
              ? 'Toutes les notifications sont lues.'
              : 'Les notifications apparaîtront ici.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkRead={handleMarkRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}