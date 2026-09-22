// app/(dashboard)/programmes/page.tsx
'use client';

import {
  AlertTriangle,
  Eye,
  Pencil,
  Plus,
  RotateCcw,
  Skull,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import ProgrammeDetailDialog from '@/components/programmes/ProgrammeDetailDialog';
import ProgrammeFormDialog from '@/components/programmes/ProgrammeFormDialog';
import { useTheme } from '@/components/providers/ThemeProvider';
import DataTable from '@/components/ui/DataTable';
import { useConfirm } from '@/hooks/useConfirm';
import { useToast } from '@/components/ui/Toast';
import { groupsService } from '@/services/groups/groups.service';
import { peopleService } from '@/services/people/people.service';
import { programmesService } from '@/services/programmes/programmes.service';
import type { Group } from '@/types/group.types';
import type { Person } from '@/types/person.types';
import { Programme, ProgrammeKind, DeletedFilter, Column, RowAction } from '@/types';


export default function ProgrammesPage() {
  const { colors } = useTheme();
  const toast = useToast();
  const confirm = useConfirm();

  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtres
  const [kindFilter, setKindFilter] = useState<ProgrammeKind | ''>('');
  const [deletedFilter, setDeletedFilter] = useState<DeletedFilter>('active');

  // Dialogues
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Programme | null>(null);
  const [viewing, setViewing] = useState<Programme | null>(null);

  // ---- Chargement ----
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [progRes, peopleRes, groupsRes] = await Promise.all([
        programmesService.list({
          kind: kindFilter || undefined,
          period: 'all',
          deleted: deletedFilter,
          page: 1,
          pageSize: 200,
        }),
        peopleService.list({ page: 1, pageSize: 500 }),
        groupsService.list({ page: 1, pageSize: 200 }),
      ]);
      setProgrammes(progRes.items);
      setPeople(peopleRes.items);
      setGroups(groupsRes.items);
    } catch {
      setError('Impossible de charger les programmes.');
      toast.error('Impossible de charger les programmes.');
    } finally {
      setLoading(false);
    }
  }, [kindFilter, deletedFilter, toast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ---- Stats rapides ----
  const stats = useMemo(() => {
    const active = programmes.filter((p) => !p.isDeleted).length;
    const deleted = programmes.filter((p) => p.isDeleted).length;
    return { active, deleted, total: programmes.length };
  }, [programmes]);

  // ---- Colonnes ----
  const columns: Column<Programme>[] = useMemo(
    () => [
      {
        key: 'kind',
        label: 'Type',
        sortable: true,
        width: '140px',
        render: (value: ProgrammeKind) => (
          <span
            className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-black tracking-widest"
            style={{
              backgroundColor: colors.primary + '22',
              borderColor: colors.primary + '55',
              color: colors.primary,
            }}
          >
            {value === 'CULTE_DIMANCHE' ? 'DIMANCHE' : 'VENDREDI'}
          </span>
        ),
      },
      {
        key: 'title',
        label: 'Titre',
        sortable: true,
        render: (value: string, row: Programme) => (
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
        key: 'startsAt',
        label: 'Date',
        sortable: true,
        width: '140px',
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
        width: '140px',
        render: (value: string | null) => (
          <span style={{ color: colors.textSecondary }} className="text-xs">
            {value ?? '—'}
          </span>
        ),
      },
      {
        key: 'status',
        label: 'Statut',
        sortable: true,
        width: '110px',
        render: (value: string) => {
          const tone =
            value === 'EN_COURS'
              ? colors.success
              : value === 'A_VENIR'
                ? colors.info
                : value === 'ANNULE'
                  ? colors.danger
                  : value === 'EXPIRE'
                    ? colors.warning
                    : colors.textMuted;
          const label =
            value === 'EN_COURS'
              ? 'En cours'
              : value === 'A_VENIR'
                ? 'À venir'
                : value === 'ANNULE'
                  ? 'Annulé'
                  : value === 'EXPIRE'
                    ? 'Expiré'
                    : 'Terminé';
          return (
            <span
              className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold"
              style={{
                backgroundColor: tone + '22',
                borderColor: tone + '55',
                color: tone,
              }}
            >
              {label}
            </span>
          );
        },
      },
      {
        key: 'sections',
        label: 'Sections',
        width: '90px',
        render: (_: any, row: Programme) => (
          <span style={{ color: colors.textSecondary }} className="text-xs">
            {row.sections.length}
          </span>
        ),
      },
    ],
    [colors],
  );

  // ---- Actions contextuelles ----
  const actions: RowAction<Programme>[] = useMemo(
    () => [
      {
        icon: Eye,
        label: 'Voir',
        onClick: (row) => setViewing(row),
      },
      // Modifier : seulement si actif
      {
        icon: Pencil,
        label: 'Modifier',
        onClick: (row) => {
          setEditing(row);
          setFormOpen(true);
        },
        hidden: (row) => row.isDeleted,
      },
      // Soft delete : seulement si actif
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
            await programmesService.remove(row.id);
            toast.success(`« ${row.title} » déplacé à la corbeille.`, {
              title: 'Programme mis à la corbeille',
              action: {
                label: 'Annuler',
                onClick: async () => {
                  try {
                    await programmesService.restore(row.id);
                    toast.info('Programme restauré.');
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
      // Restaurer : seulement si supprimé
      {
        icon: RotateCcw,
        label: 'Restaurer',
        onClick: async (row) => {
          const ok = await confirm({
            title: 'Restaurer ce programme ?',
            message: `« ${row.title} » redeviendra actif et visible.`,
            variant: 'info',
            confirmLabel: 'Restaurer',
          });
          if (!ok) return;

          try {
            await programmesService.restore(row.id);
            toast.success(`« ${row.title} » restauré.`, {
              title: 'Programme restauré',
            });
            loadAll();
          } catch {
            toast.error('Impossible de restaurer ce programme.');
          }
        },
        hidden: (row) => !row.isDeleted,
        className: 'hover:bg-green-500/10 hover:text-green-500',
      },
      // Hard delete : seulement si supprimé (corbeille)
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
            await programmesService.hardDelete(row.id);
            toast.success(`« ${row.title} » supprimé définitivement.`, {
              title: 'Programme supprimé',
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
            Programmes
          </h1>
          <p
            className="mt-1 text-sm font-medium"
            style={{ color: colors.textSecondary }}
          >
            Culte de dimanche et prière du vendredi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
            Nouveau programme
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
        {/* Segmented : Actifs / Corbeille / Tous */}
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

        {/* Filtre type */}
        <select
          value={kindFilter}
          onChange={(e) =>
            setKindFilter(e.target.value as ProgrammeKind | '')
          }
          className="h-8 rounded-md border px-3 text-xs font-bold outline-none"
          style={{
            backgroundColor: colors.surfaceAlt,
            borderColor: colors.border,
            color: colors.text,
          }}
        >
          <option value="">Tous les types</option>
          <option value="CULTE_DIMANCHE">Culte de dimanche</option>
          <option value="PRIERE_VENDREDI">Prière du vendredi</option>
        </select>
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
        data={programmes}
        columns={columns}
        loading={loading}
        config={{
          searchable: true,
          searchPlaceholder: 'Rechercher un programme…',
          pagination: true,
          defaultPageSize: 10,
          selectable: true,
          actions,
          emptyMessage:
            deletedFilter === 'deleted'
              ? 'Aucun programme dans la corbeille.'
              : 'Aucun programme enregistré.',
          rowClassName: (row: Programme) =>
            row.isDeleted ? 'opacity-60' : '',
        }}
      />

      {/* ═══════════ FORMULAIRE ═══════════ */}
      <ProgrammeFormDialog
        open={formOpen}
        programme={editing}
        people={people}
        groups={groups}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSuccess={() => {
          setFormOpen(false);
          setEditing(null);
          toast.success(
            editing
              ? 'Programme modifié avec succès.'
              : 'Programme créé avec succès.',
          );
          loadAll();
        }}
      />

      {/* ═══════════ DÉTAIL ═══════════ */}
      <ProgrammeDetailDialog
        open={!!viewing}
        programme={viewing}
        onClose={() => setViewing(null)}
      />
    </div>
  );
}