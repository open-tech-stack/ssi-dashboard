// app/(dashboard)/prieres/page.tsx
'use client';

import {
  AlertTriangle,
  Bell,
  Eye,
  HandHeart,
  Pencil,
  Plus,
  RotateCcw,
  Skull,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import PriereDetailDialog from '@/components/prieres/PriereDetailDialog';
import PriereFormDialog from '@/components/prieres/PriereFormDialog';
import { useTheme } from '@/components/providers/ThemeProvider';
import DataTable from '@/components/ui/DataTable';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/hooks/useConfirm';
import { prieresService } from '@/services';
import { PrierePriority, Priere, DeletedFilter, Column, PRIERE_PRIORITY_LABEL, RowAction, ALL_PRIORITIES } from '@/types';


function toneOf(priority: PrierePriority, colors: any): string {
  switch (priority) {
    case 'URGENT':
      return colors.danger;
    case 'IMPORTANT':
      return colors.warning;
    default:
      return colors.textMuted;
  }
}

export default function PrieresPage() {
  const { colors } = useTheme();
  const toast = useToast();
  const confirm = useConfirm();

  const [prieres, setPrieres] = useState<Priere[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [priorityFilter, setPriorityFilter] = useState<PrierePriority | ''>('');
  const [deletedFilter, setDeletedFilter] = useState<DeletedFilter>('active');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Priere | null>(null);
  const [viewing, setViewing] = useState<Priere | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await prieresService.list({
        priority: priorityFilter || undefined,
        deleted: deletedFilter,
        page: 1,
        pageSize: 300,
      });
      setPrieres(res.items);
    } catch {
      setError('Impossible de charger les prières.');
      toast.error('Impossible de charger les prières.');
    } finally {
      setLoading(false);
    }
  }, [priorityFilter, deletedFilter, toast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const stats = useMemo(() => {
    const active = prieres.filter((p) => !p.isDeleted).length;
    const deleted = prieres.filter((p) => p.isDeleted).length;
    return { active, deleted, total: prieres.length };
  }, [prieres]);

  // Colonnes
  const columns: Column<Priere>[] = useMemo(
    () => [
      {
        key: 'priority',
        label: 'Priorité',
        sortable: true,
        width: '120px',
        render: (value: PrierePriority) => {
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
              {PRIERE_PRIORITY_LABEL[value].toUpperCase()}
            </span>
          );
        },
      },
      {
        key: 'title',
        label: 'Titre',
        sortable: true,
        render: (value: string, row: Priere) => (
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
                SUPPRIMÉE
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'date',
        label: 'Date',
        sortable: true,
        width: '160px',
        render: (value: string | null) => (
          <span style={{ color: colors.textSecondary }} className="text-xs">
            {value
              ? new Date(value).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : '—'}
          </span>
        ),
      },
      {
        key: 'location',
        label: 'Lieu',
        width: '180px',
        render: (value: string | null) => (
          <span style={{ color: colors.textSecondary }} className="text-xs">
            {value ?? '—'}
          </span>
        ),
      },
      {
        key: 'createdAt',
        label: 'Créée le',
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
  const actions: RowAction<Priere>[] = useMemo(
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
            message: `« ${row.title} » sera déplacée dans la corbeille. Vous pourrez la restaurer plus tard.`,
            variant: 'warning',
            confirmLabel: 'Mettre à la corbeille',
          });
          if (!ok) return;

          try {
            await prieresService.remove(row.id);
            toast.success(`« ${row.title} » déplacée à la corbeille.`, {
              title: 'Prière mise à la corbeille',
              action: {
                label: 'Annuler',
                onClick: async () => {
                  try {
                    await prieresService.restore(row.id);
                    toast.info('Prière restaurée.');
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
            title: 'Restaurer cette prière ?',
            message: `« ${row.title} » redeviendra active et visible.`,
            variant: 'info',
            confirmLabel: 'Restaurer',
          });
          if (!ok) return;

          try {
            await prieresService.restore(row.id);
            toast.success(`« ${row.title} » restaurée.`, {
              title: 'Prière restaurée',
            });
            loadAll();
          } catch {
            toast.error('Impossible de restaurer cette prière.');
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
            message: `« ${row.title} » sera définitivement supprimée. Cette action est IRRÉVERSIBLE.`,
            variant: 'danger',
            confirmLabel: 'Supprimer définitivement',
            requireInput: true,
            confirmWord: 'SUPPRIMER',
          });
          if (!ok) return;

          try {
            await prieresService.hardDelete(row.id);
            toast.success(`« ${row.title} » supprimée définitivement.`, {
              title: 'Prière supprimée',
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
            Prières
          </h1>
          <p
            className="mt-1 text-sm font-medium"
            style={{ color: colors.textSecondary }}
          >
            Sujets de prière et veillées.
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
            Nouvelle prière
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
        {/* Segmented */}
        <div
          className="flex rounded-lg border p-0.5"
          style={{
            backgroundColor: colors.surfaceAlt,
            borderColor: colors.border,
          }}
        >
          {(
            [
              { value: 'active', label: 'Actives', count: stats.active },
              { value: 'deleted', label: 'Corbeille', count: stats.deleted },
              { value: 'all', label: 'Toutes', count: stats.total },
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

        {/* Filtre priorité */}
        <select
          value={priorityFilter}
          onChange={(e) =>
            setPriorityFilter(e.target.value as PrierePriority | '')
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
              {PRIERE_PRIORITY_LABEL[p]}
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
        data={prieres}
        columns={columns}
        loading={loading}
        config={{
          searchable: true,
          searchPlaceholder: 'Rechercher une prière…',
          pagination: true,
          defaultPageSize: 10,
          selectable: true,
          actions,
          emptyMessage:
            deletedFilter === 'deleted'
              ? 'Aucune prière dans la corbeille.'
              : 'Aucune prière enregistrée.',
          rowClassName: (row: Priere) => (row.isDeleted ? 'opacity-60' : ''),
        }}
      />

      {/* Formulaire */}
      <PriereFormDialog
        open={formOpen}
        priere={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSuccess={() => {
          setFormOpen(false);
          setEditing(null);
          toast.success(
            editing
              ? 'Prière modifiée avec succès.'
              : 'Prière créée avec succès.',
          );
          loadAll();
        }}
      />

      {/* Détail */}
      <PriereDetailDialog
        open={!!viewing}
        priere={viewing}
        onClose={() => setViewing(null)}
      />
    </div>
  );
}