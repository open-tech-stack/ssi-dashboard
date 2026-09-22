// app/(dashboard)/people/page.tsx
'use client';

import {
  Pencil,
  Plus,
  RotateCcw,
  Skull,
  Trash2,
  UserCircle2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import PersonFormDialog from '@/components/people/PersonFormDialog';
import { useTheme } from '@/components/providers/ThemeProvider';
import DataTable from '@/components/ui/DataTable';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/hooks/useConfirm';
import { peopleService } from '@/services/people/people.service';
import type {Person } from '@/types/person.types';
import type { Column, RowAction } from '@/types/table.types';
import { DeletedFilter } from '@/types';

export default function PeoplePage() {
  const { colors } = useTheme();
  const toast = useToast();
  const confirm = useConfirm();

  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deletedFilter, setDeletedFilter] =
    useState<DeletedFilter>('active');

  const [formOpen, setFormOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  // ---- Chargement ----
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await peopleService.list({
        deleted: deletedFilter,
        page: 1,
        pageSize: 500,
      });
      setPeople(res.items);
    } catch {
      setError('Impossible de charger les personnes.');
      toast.error('Impossible de charger les personnes.');
    } finally {
      setLoading(false);
    }
  }, [deletedFilter, toast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ---- Stats ----
  const stats = useMemo(() => {
    const active = people.filter((p) => !p.isDeleted).length;
    const deleted = people.filter((p) => p.isDeleted).length;
    return { active, deleted, total: people.length };
  }, [people]);

  // ---- Colonnes ----
  const columns: Column<Person>[] = useMemo(
    () => [
      {
        key: 'fullName',
        label: 'Nom complet',
        sortable: true,
        render: (value: string, row: Person) => (
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
                SUPPRIMÉE
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'firstName',
        label: 'Prénom',
        sortable: true,
        render: (value: string) => (
          <span style={{ color: colors.textSecondary }}>{value}</span>
        ),
      },
      {
        key: 'lastName',
        label: 'Nom',
        sortable: true,
        render: (value: string | null) => (
          <span style={{ color: colors.textSecondary }}>{value ?? '—'}</span>
        ),
      },
      {
        key: 'role',
        label: 'Rôle',
        width: '180px',
        render: (value: string | null) =>
          value ? (
            <span
              className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-black tracking-widest"
              style={{
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.border,
                color: colors.textSecondary,
              }}
            >
              {value.toUpperCase()}
            </span>
          ) : (
            <span style={{ color: colors.textMuted }}>—</span>
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

  // ---- Actions contextuelles ----
  const actions: RowAction<Person>[] = useMemo(
    () => [
      {
        icon: Pencil,
        label: 'Modifier',
        onClick: (row) => {
          setEditingPerson(row);
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
            message: `« ${row.fullName} » sera déplacé dans la corbeille. Vous pourrez la restaurer plus tard.`,
            variant: 'warning',
            confirmLabel: 'Mettre à la corbeille',
          });
          if (!ok) return;

          try {
            await peopleService.remove(row.id);
            toast.success(`« ${row.fullName} » déplacée à la corbeille.`, {
              title: 'Personne mise à la corbeille',
              action: {
                label: 'Annuler',
                onClick: async () => {
                  try {
                    await peopleService.restore(row.id);
                    toast.info('Personne restaurée.');
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
            title: 'Restaurer cette personne ?',
            message: `« ${row.fullName} » redeviendra active et visible.`,
            variant: 'info',
            confirmLabel: 'Restaurer',
          });
          if (!ok) return;

          try {
            await peopleService.restore(row.id);
            toast.success(`« ${row.fullName} » restaurée.`, {
              title: 'Personne restaurée',
            });
            loadAll();
          } catch {
            toast.error('Impossible de restaurer cette personne.');
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
            message: `« ${row.fullName} » sera définitivement supprimée. Cette action est IRRÉVERSIBLE.`,
            variant: 'danger',
            confirmLabel: 'Supprimer définitivement',
            requireInput: true,
            confirmWord: 'SUPPRIMER',
          });
          if (!ok) return;

          try {
            await peopleService.hardDelete(row.id);
            toast.success(`« ${row.fullName} » supprimée définitivement.`, {
              title: 'Personne supprimée',
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
            Personnes
          </h1>
          <p
            className="mt-1 text-sm font-medium"
            style={{ color: colors.textSecondary }}
          >
            Répertoire des personnes (membres, intervenants, invités).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingPerson(null);
              setFormOpen(true);
            }}
            className="flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-bold shadow-md transition hover:opacity-90"
            style={{
              backgroundColor: colors.primary,
              color: colors.onPrimary,
            }}
          >
            <Plus className="h-4 w-4" />
            Nouvelle personne
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
        data={people}
        columns={columns}
        loading={loading}
        config={{
          searchable: true,
          searchPlaceholder: 'Rechercher un nom…',
          pagination: true,
          defaultPageSize: 10,
          selectable: true,
          actions,
          emptyMessage:
            deletedFilter === 'deleted'
              ? 'Aucune personne dans la corbeille.'
              : 'Aucune personne enregistrée.',
          rowClassName: (row: Person) => (row.isDeleted ? 'opacity-60' : ''),
        }}
      />

      {/* ═══════════ FORMULAIRE ═══════════ */}
      <PersonFormDialog
        open={formOpen}
        person={editingPerson}
        onClose={() => {
          setFormOpen(false);
          setEditingPerson(null);
        }}
        onSuccess={() => {
          setFormOpen(false);
          setEditingPerson(null);
          toast.success(
            editingPerson
              ? 'Personne modifiée avec succès.'
              : 'Personne créée avec succès.',
          );
          loadAll();
        }}
      />
    </div>
  );
}