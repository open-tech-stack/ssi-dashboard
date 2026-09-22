// app/(dashboard)/groups/page.tsx
'use client';

import {
  Pencil,
  Plus,
  RotateCcw,
  Skull,
  Trash2,
  UsersRound,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import GroupFormDialog from '@/components/groups/GroupFormDialog';
import { useTheme } from '@/components/providers/ThemeProvider';
import DataTable from '@/components/ui/DataTable';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/hooks/useConfirm';
import { groupsService } from '@/services/groups/groups.service';
import type { Column, RowAction } from '@/types/table.types';
import { Group, DeletedFilter } from '@/types';

export default function GroupsPage() {
  const { colors } = useTheme();
  const toast = useToast();
  const confirm = useConfirm();

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deletedFilter, setDeletedFilter] =
    useState<DeletedFilter>('active');

  const [formOpen, setFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  // ---- Chargement ----
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await groupsService.list({
        deleted: deletedFilter,
        page: 1,
        pageSize: 500,
      });
      setGroups(res.items);
    } catch {
      setError('Impossible de charger les groupes.');
      toast.error('Impossible de charger les groupes.');
    } finally {
      setLoading(false);
    }
  }, [deletedFilter, toast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ---- Stats ----
  const stats = useMemo(() => {
    const active = groups.filter((g) => !g.isDeleted).length;
    const deleted = groups.filter((g) => g.isDeleted).length;
    return { active, deleted, total: groups.length };
  }, [groups]);

  // ---- Colonnes ----
  const columns: Column<Group>[] = useMemo(
    () => [
      {
        key: 'name',
        label: 'Nom',
        sortable: true,
        render: (value: string, row: Group) => (
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
        key: 'description',
        label: 'Description',
        render: (value: string | null) => (
          <span style={{ color: colors.textSecondary }} className="text-sm">
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

  // ---- Actions ----
  const actions: RowAction<Group>[] = useMemo(
    () => [
      {
        icon: Pencil,
        label: 'Modifier',
        onClick: (row) => {
          setEditingGroup(row);
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
            message: `« ${row.name} » sera déplacé dans la corbeille. Vous pourrez le restaurer plus tard.`,
            variant: 'warning',
            confirmLabel: 'Mettre à la corbeille',
          });
          if (!ok) return;

          try {
            await groupsService.remove(row.id);
            toast.success(`« ${row.name} » déplacé à la corbeille.`, {
              title: 'Groupe mis à la corbeille',
              action: {
                label: 'Annuler',
                onClick: async () => {
                  try {
                    await groupsService.restore(row.id);
                    toast.info('Groupe restauré.');
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
            title: 'Restaurer ce groupe ?',
            message: `« ${row.name} » redeviendra actif et visible.`,
            variant: 'info',
            confirmLabel: 'Restaurer',
          });
          if (!ok) return;

          try {
            await groupsService.restore(row.id);
            toast.success(`« ${row.name} » restauré.`, {
              title: 'Groupe restauré',
            });
            loadAll();
          } catch {
            toast.error('Impossible de restaurer ce groupe.');
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
            message: `« ${row.name} » sera définitivement supprimé. Cette action est IRRÉVERSIBLE.`,
            variant: 'danger',
            confirmLabel: 'Supprimer définitivement',
            requireInput: true,
            confirmWord: 'SUPPRIMER',
          });
          if (!ok) return;

          try {
            await groupsService.hardDelete(row.id);
            toast.success(`« ${row.name} » supprimé définitivement.`, {
              title: 'Groupe supprimé',
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
      {/* ═══════════ HEADER ═══════════ */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-black tracking-wide"
            style={{ color: colors.text }}
          >
            Groupes
          </h1>
          <p
            className="mt-1 text-sm font-medium"
            style={{ color: colors.textSecondary }}
          >
            Groupes assignables aux sections de programme (musical, protocole…).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingGroup(null);
              setFormOpen(true);
            }}
            className="flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-bold shadow-md transition hover:opacity-90"
            style={{
              backgroundColor: colors.primary,
              color: colors.onPrimary,
            }}
          >
            <Plus className="h-4 w-4" />
            Nouveau groupe
          </button>
        </div>
      </div>

      {/* ═══════════ BARRE DE FILTRES ═══════════ */}
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
      </div>

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

      {/* ═══════════ TABLE ═══════════ */}
      <DataTable
        data={groups}
        columns={columns}
        loading={loading}
        config={{
          searchable: true,
          searchPlaceholder: 'Rechercher un groupe…',
          pagination: true,
          defaultPageSize: 10,
          selectable: true,
          actions,
          emptyMessage:
            deletedFilter === 'deleted'
              ? 'Aucun groupe dans la corbeille.'
              : 'Aucun groupe enregistré.',
          rowClassName: (row: Group) => (row.isDeleted ? 'opacity-60' : ''),
        }}
      />

      {/* ═══════════ FORMULAIRE ═══════════ */}
      <GroupFormDialog
        open={formOpen}
        group={editingGroup}
        onClose={() => {
          setFormOpen(false);
          setEditingGroup(null);
        }}
        onSuccess={() => {
          setFormOpen(false);
          setEditingGroup(null);
          toast.success(
            editingGroup
              ? 'Groupe modifié avec succès.'
              : 'Groupe créé avec succès.',
          );
          loadAll();
        }}
      />
    </div>
  );
}