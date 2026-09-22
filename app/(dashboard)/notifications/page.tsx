// app/(dashboard)/notifications/page.tsx
'use client';

import { CheckCheck, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import NotificationFilters, {
  type ReadFilter,
} from '@/components/notifications/NotificationFilters';
import NotificationItem from '@/components/notifications/NotificationItem';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/hooks/useConfirm';
import { useUnreadCount } from '@/hooks/useUnreadCount';
import { notificationsService } from '@/services/notifications/notifications.service';
import type {
  Notification,
  NotificationType,
} from '@/types/notification.types';
import { DeletedFilter } from '@/types';

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
function groupLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  if (d >= today) return "Aujourd'hui";
  if (d >= yesterday) return 'Hier';
  if (d >= weekAgo) return 'Cette semaine';
  return 'Plus ancien';
}

// ------------------------------------------------------------------
// Composant
// ------------------------------------------------------------------
export default function NotificationsPage() {
  const { colors } = useTheme();
  const toast = useToast();
  const confirm = useConfirm();
  const { refresh: refreshUnread } = useUnreadCount();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtres
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType | ''>('');
  const [deletedFilter, setDeletedFilter] =
    useState<DeletedFilter>('active');

  const [markingAll, setMarkingAll] = useState(false);

  // ---- Chargement ----
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = {
        page: 1,
        pageSize: 200,
        deleted: deletedFilter,
      };
      if (typeFilter) params.type = typeFilter;
      if (readFilter === 'unread') params.read = false;
      if (readFilter === 'read') params.read = true;

      const res = await notificationsService.list(params);
      setNotifications(res.items as unknown as Notification[]);
    } catch {
      setError('Impossible de charger les notifications.');
      toast.error('Impossible de charger les notifications.');
    } finally {
      setLoading(false);
    }
  }, [readFilter, typeFilter, deletedFilter, toast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ---- Stats ----
  const stats = useMemo(() => {
    const active = notifications.filter((n) => !n.isDeleted).length;
    const deleted = notifications.filter((n) => n.isDeleted).length;
    const unread = notifications.filter(
      (n) => !n.read && !n.isDeleted,
    ).length;
    return { active, deleted, total: notifications.length, unread };
  }, [notifications]);

  // ---- Actions ----
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

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      const res = await notificationsService.markAllRead();
      setNotifications((prev) =>
        prev.map((n) => (n.isDeleted ? n : { ...n, read: true })),
      );
      refreshUnread();
      toast.success(
        `${res.count} notification${res.count > 1 ? 's' : ''} marquée${res.count > 1 ? 's' : ''} comme lue${res.count > 1 ? 's' : ''}.`,
        { title: 'Tout marqué lu' },
      );
    } catch {
      toast.error('Impossible de marquer toutes les notifications.');
    } finally {
      setMarkingAll(false);
    }
  };

  // ---- Soft delete (admin) ----
  const handleSoftDelete = useCallback(
    async (n: Notification) => {
      const ok = await confirm({
        title: 'Supprimer cette notification ?',
        message: `« ${n.title} » sera masquée POUR TOUS les utilisateurs. Vous pourrez la restaurer plus tard.`,
        variant: 'warning',
        confirmLabel: 'Supprimer',
      });
      if (!ok) return;

      try {
        await notificationsService.remove(n.id);
        toast.success(`« ${n.title} » supprimée.`, {
          title: 'Notification supprimée',
          action: {
            label: 'Annuler',
            onClick: async () => {
              try {
                await notificationsService.restore(n.id);
                toast.info('Notification restaurée.');
                loadAll();
              } catch {
                toast.error('Impossible de restaurer.');
              }
            },
          },
        });
        loadAll();
        refreshUnread();
      } catch {
        toast.error('Impossible de supprimer.');
      }
    },
    [confirm, toast, loadAll, refreshUnread],
  );

  // ---- Restore (admin) ----
  const handleRestore = useCallback(
    async (n: Notification) => {
      const ok = await confirm({
        title: 'Restaurer cette notification ?',
        message: `« ${n.title} » redeviendra visible pour tous les utilisateurs.`,
        variant: 'info',
        confirmLabel: 'Restaurer',
      });
      if (!ok) return;

      try {
        await notificationsService.restore(n.id);
        toast.success(`« ${n.title} » restaurée.`, {
          title: 'Notification restaurée',
        });
        loadAll();
        refreshUnread();
      } catch {
        toast.error('Impossible de restaurer.');
      }
    },
    [confirm, toast, loadAll, refreshUnread],
  );

  // ---- Hard delete (admin) ----
  const handleHardDelete = useCallback(
    async (n: Notification) => {
      const ok = await confirm({
        title: '⚠️ Suppression DÉFINITIVE',
        message: `« ${n.title} » sera définitivement supprimée. Cette action est IRRÉVERSIBLE.`,
        variant: 'danger',
        confirmLabel: 'Supprimer définitivement',
        requireInput: true,
        confirmWord: 'SUPPRIMER',
      });
      if (!ok) return;

      try {
        await notificationsService.hardDelete(n.id);
        toast.success(`« ${n.title} » supprimée définitivement.`, {
          title: 'Notification supprimée',
          duration: 5000,
        });
        loadAll();
      } catch {
        toast.error('Impossible de supprimer définitivement.');
      }
    },
    [confirm, toast, loadAll],
  );

  // ---- Groupement par date (exclut les supprimées) ----
  const grouped = useMemo(() => {
    const groups = new Map<string, Notification[]>();
    const order = ["Aujourd'hui", 'Hier', 'Cette semaine', 'Plus ancien'];
    order.forEach((k) => groups.set(k, []));

    for (const n of notifications) {
      const key = groupLabel(n.createdAt);
      groups.get(key)?.push(n);
    }

    return order
      .map((key) => ({ key, items: groups.get(key) ?? [] }))
      .filter((g) => g.items.length > 0);
  }, [notifications]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      {/* ═══════════ HEADER ═══════════ */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h1
            className="text-2xl font-black tracking-wide"
            style={{ color: colors.text }}
          >
            Notifications
          </h1>
          {stats.unread > 0 && (
            <span
              className="rounded-full px-2 py-0.5 text-xs font-black tracking-wide"
              style={{
                backgroundColor: colors.primary + '22',
                color: colors.primary,
              }}
            >
              {stats.unread} non lue{stats.unread > 1 ? 's' : ''}
            </span>
          )}
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
        </div>
      </div>

      {/* ═══════════ FILTRES ═══════════ */}
      <NotificationFilters
        readFilter={readFilter}
        onReadFilterChange={setReadFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        deletedFilter={deletedFilter}
        onDeletedFilterChange={setDeletedFilter}
        counts={{
          active: stats.active,
          deleted: stats.deleted,
          total: stats.total,
        }}
        showDeletedFilter
      />

      {/* ═══════════ ERREUR ═══════════ */}
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

      {/* ═══════════ LISTE ═══════════ */}
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
          <p
            className="text-xs font-semibold"
            style={{ color: colors.textMuted }}
          >
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
          <p className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
            {readFilter === 'unread'
              ? 'Toutes les notifications sont lues.'
              : deletedFilter === 'deleted'
                ? 'Aucune notification dans la corbeille.'
                : 'Les notifications apparaîtront ici.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map((group) => (
            <div key={group.key} className="flex flex-col gap-2">
              {/* Titre de groupe */}
              <div className="flex items-center gap-3 px-1">
                <h2
                  className="text-[10px] font-black uppercase tracking-widest"
                  style={{ color: colors.textMuted }}
                >
                  {group.key}
                </h2>
                <div
                  className="h-px flex-1"
                  style={{ backgroundColor: colors.border }}
                />
                <span
                  className="text-[10px] font-bold"
                  style={{ color: colors.textMuted }}
                >
                  {group.items.length}
                </span>
              </div>

              {/* Items du groupe */}
              {group.items.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={handleMarkRead}
                  onSoftDelete={handleSoftDelete}
                  onRestore={handleRestore}
                  onHardDelete={handleHardDelete}
                  isAdmin
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}