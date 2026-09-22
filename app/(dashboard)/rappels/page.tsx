// app/(dashboard)/rappels/page.tsx
'use client';

import {
  AlertTriangle,
  Bell,
  Eye,
  ListChecks,
  Pencil,
  Plus,
  RotateCcw,
  Skull,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import RappelDetailDialog from '@/components/rappels/RappelDetailDialog';
import RappelFormDialog from '@/components/rappels/RappelFormDialog';
import { useTheme } from '@/components/providers/ThemeProvider';
import DataTable from '@/components/ui/DataTable';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/hooks/useConfirm';
import { rappelsService } from '@/services/rappels/rappels.service';
import { RappelPriority, Rappel, DeletedFilter, Column, RAPPEL_PRIORITY_LABEL, RowAction, ALL_PRIORITIES } from '@/types';

function toneOf(priority: RappelPriority, colors: any): string {
  switch (priority) {
    case 'URGENT':
      return colors.danger;
    case 'IMPORTANT':
      return colors.warning;
    default:
      return colors.textMuted;
  }
}

export default function RappelsPage() {
  const { colors } = useTheme();
  const toast = useToast();
  const confirm = useConfirm();

  const [rappels, setRappels] = useState<Rappel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [priorityFilter, setPriorityFilter] = useState<RappelPriority | ''>('');
  const [deletedFilter, setDeletedFilter] = useState<DeletedFilter>('active');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Rappel | null>(null);
  const [viewing, setViewing] = useState<Rappel | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await rappelsService.list({
        priority: priorityFilter || undefined,
        deleted: deletedFilter,
        page: 1,
        pageSize: 300,
      });
      setRappels(res.items);
    } catch {
      setError('Impossible de charger les rappels.');
      toast.error('Impossible de charger les rappels.');
    } finally {
      setLoading(false);
    }
  }, [priorityFilter, deletedFilter, toast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const stats = useMemo(() => {
    const active = rappels.filter((r) => !r.isDeleted).length;
    const deleted = rappels.filter((r) => r.isDeleted).length;
    return { active, deleted, total: rappels.length };
  }, [rappels]);

  // Colonnes
  const columns: Column<Rappel>[] = useMemo(
    () => [
      {
        key: 'priority',
        label: 'Priorité',
        sortable: true,
        width: '120px',
        render: (value: RappelPriority) => {
          const tone = toneOf(value, colors);
          return (
            <span
              className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-black tracking-widest"
              style={{
                backgroundColor:
                  value === 'NORMAL' ? colors.surfaceAlt : tone + '22',
                borderColor:
                  value === 'NORMAL' ? colors.border : tone + '55',
                color: value === 'NORMAL' ? colors.textSecondary : tone,
              }}
            >
              {value !== 'NORMAL' && (
                <AlertTriangle className="h-2.5 w-2.5" />
              )}
              {RAPPEL_PRIORITY_LABEL[value].toUpperCase()}
            </span>
          );
        },
      },
      {
        key: 'title',
        label: 'Titre',
        sortable: true,
        render: (value: string, row: Rappel) => (
          <div className="flex items-center gap-2">
            <span
              style={{
                color: row.isDeleted ? colors.textMuted : colors.text,
                textDecoration: row.isDeleted ? 'line-through' : 'none',
              }}
              className="font-bold"
            >
              {value}
            </span>
            {row.notification && !row.isDeleted && (
              <Bell
                className="h-3.5 w-3.5"
                style={{ color: colors.success }}
                aria-label="Notification envoyée"
              />
            )}
            {row.isDeleted && (
              <span
                className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-black tracking-widest"
                style={{
                  backgroundColor: colors.danger + '11',
                  borderColor: colors.danger + '44',
                  color: colors.danger,
                }}
              >
                <Skull className="h-2.5 w-2.5" />
                SUPPRIMÉ
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'elements',
        label: 'Éléments',
        width: '130px',
        render: (_: any, row: Rappel) => (
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold"
            style={{
              backgroundColor: colors.primary + '11',
              borderColor: colors.primary + '33',
              color: colors.primary,
            }}
          >
            <ListChecks className="h-3 w-3" />
            {row.elements.length} élément{row.elements.length > 1 ? 's' : ''}
          </span>
        ),
      },
      {
        key: 'detail',
        label: 'Détail',
        render: (value: string | null) => (
          <span
            style={{ color: colors.textSecondary }}
            className="text-xs line-clamp-1"
          >
            {value ?? '—'}
          </span>
        ),
      },
      {
        key: 'createdAt',
        label: 'Créé le',
        sortable: true,
        width: '160px',
        render: (value: string) => (
          <span style={{ color: colors.textSecondary }} className="text-xs">
            {new Date(value).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        ),
      },
    ],
    [colors],
  );

  // Actions
  const actions: RowAction<Rappel>[] = useMemo(
    () => [
      {
        icon: Eye,
        label: 'Voir',
        onClick: (row) => setViewing(row),
      },
      {
        icon: Pencil,
        label: 'Modifier',
        onClick: (row) => {
          setEditing(row);
          setFormOpen(true);
        },
        hidden: (row) => row.isDeleted,
      },
      {
        icon: Trash2,
        label: 'Mettre à la corbeille',
        onClick: async (row) => {
          const ok = await confirm({
            title: 'Mettre à la corbeille ?',
            message: `« ${row.title} » sera déplacé dans la corbeille. Vous pourrez le restaurer plus tard.`,
            variant: 'warning',
            confirmLabel: 'Mettre à la corbeille',
          });
          if (!ok) return;

          try {
            await rappelsService.remove(row.id);
            toast.success(`« ${row.title} » déplacé à la corbeille.`, {
              title: 'Rappel mis à la corbeille',
              action: {
                label: 'Annuler',
                onClick: async () => {
                  try {
                    await rappelsService.restore(row.id);
                    toast.info('Rappel restauré.');
                    loadAll();
                  } catch {
                    toast.error('Impossible de restaurer.');
                  }
                },
              },
            });
            loadAll();
          } catch {
            toast.error('Impossible de mettre à la corbeille.');
          }
        },
        hidden: (row) => row.isDeleted,
        className: 'hover:bg-amber-500/10 hover:text-amber-500',
      },
      {
        icon: RotateCcw,
        label: 'Restaurer',
        onClick: async (row) => {
          const ok = await confirm({
            title: 'Restaurer ce rappel ?',
            message: `« ${row.title} » redeviendra actif et visible.`,
            variant: 'info',
            confirmLabel: 'Restaurer',
          });
          if (!ok) return;

          try {
            await rappelsService.restore(row.id);
            toast.success(`« ${row.title} » restauré.`, {
              title: 'Rappel restauré',
            });
            loadAll();
          } catch {
            toast.error('Impossible de restaurer ce rappel.');
          }
        },
        hidden: (row) => !row.isDeleted,
        className: 'hover:bg-green-500/10 hover:text-green-500',
      },
      {
        icon: Skull,
        label: 'Supprimer définitivement',
        onClick: async (row) => {
          const ok = await confirm({
            title: '⚠️ Suppression DÉFINITIVE',
            message: `« ${row.title} » sera définitivement supprimé. Cette action est IRRÉVERSIBLE.`,
            variant: 'danger',
            confirmLabel: 'Supprimer définitivement',
            requireInput: true,
            confirmWord: 'SUPPRIMER',
          });
          if (!ok) return;

          try {
            await rappelsService.hardDelete(row.id);
            toast.success(`« ${row.title} » supprimé définitivement.`, {
              title: 'Rappel supprimé',
              duration: 5000,
            });
            loadAll();
          } catch {
            toast.error('Impossible de supprimer définitivement.');
          }
        },
        hidden: (row) => !row.isDeleted,
        className: 'hover:bg-red-500/10 hover:text-red-500',
      },
    ],
    [confirm, toast, loadAll],
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-black tracking-wide"
            style={{ color: colors.text }}
          >
            Rappels
          </h1>
          <p
            className="mt-1 text-sm font-medium"
            style={{ color: colors.textSecondary }}
          >
            Listes d'éléments à retenir.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-bold shadow-md transition hover:opacity-90"
            style={{
              backgroundColor: colors.primary,
              color: colors.onPrimary,
            }}
          >
            <Plus className="h-4 w-4" />
            Nouveau rappel
          </button>
        </div>
      </div>

      {/* Barre de filtres */}
      <div
        className="flex flex-wrap items-center gap-3 rounded-xl border p-3"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        <div
          className="flex rounded-lg border p-0.5"
          style={{
            backgroundColor: colors.surfaceAlt,
            borderColor: colors.border,
          }}
        >
          {(
            [
              { value: 'active', label: 'Actifs', count: stats.active },
              { value: 'deleted', label: 'Corbeille', count: stats.deleted },
              { value: 'all', label: 'Tous', count: stats.total },
            ] as const
          ).map((opt) => {
            const active = deletedFilter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDeletedFilter(opt.value)}
                className="flex h-7 items-center gap-1.5 rounded-md px-3 text-xs font-bold transition"
                style={{
                  backgroundColor: active ? colors.surface : 'transparent',
                  color: active ? colors.text : colors.textSecondary,
                  boxShadow: active ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {opt.label}
                <span
                  className="rounded-full px-1.5 text-[10px] font-black"
                  style={{
                    backgroundColor: active
                      ? colors.primary + '22'
                      : colors.border,
                    color: active ? colors.primary : colors.textMuted,
                  }}
                >
                  {opt.count}
                </span>
              </button>
            );
          })}
        </div>

        <select
          value={priorityFilter}
          onChange={(e) =>
            setPriorityFilter(e.target.value as RappelPriority | '')
          }
          className="h-8 rounded-md border px-3 text-xs font-bold outline-none"
          style={{
            backgroundColor: colors.surfaceAlt,
            borderColor: colors.border,
            color: colors.text,
          }}
        >
          <option value="">Toutes priorités</option>
          {ALL_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {RAPPEL_PRIORITY_LABEL[p]}
            </option>
          ))}
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

      {/* Table */}
      <DataTable
        data={rappels}
        columns={columns}
        loading={loading}
        config={{
          searchable: true,
          searchPlaceholder: 'Rechercher un rappel…',
          pagination: true,
          defaultPageSize: 10,
          selectable: true,
          actions,
          emptyMessage:
            deletedFilter === 'deleted'
              ? 'Aucun rappel dans la corbeille.'
              : 'Aucun rappel enregistré.',
          rowClassName: (row: Rappel) => (row.isDeleted ? 'opacity-60' : ''),
        }}
      />

      {/* Formulaire */}
      <RappelFormDialog
        open={formOpen}
        rappel={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSuccess={() => {
          setFormOpen(false);
          setEditing(null);
          toast.success(
            editing
              ? 'Rappel modifié avec succès.'
              : 'Rappel créé avec succès.',
          );
          loadAll();
        }}
      />

      {/* Détail */}
      <RappelDetailDialog
        open={!!viewing}
        rappel={viewing}
        onClose={() => setViewing(null)}
      />
    </div>
  );
}