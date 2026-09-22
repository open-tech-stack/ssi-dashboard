// app/(dashboard)/evenements/page.tsx
'use client';

import {
  Calendar,
  Eye,
  Pencil,
  Plus,
  RotateCcw,
  Skull,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import EvenementDetailDialog from '@/components/evenements/EvenementDetailDialog';
import EvenementFormDialog from '@/components/evenements/EvenementFormDialog';
import { useTheme } from '@/components/providers/ThemeProvider';
import DataTable from '@/components/ui/DataTable';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/hooks/useConfirm';
import { evenementsService } from '@/services/evenements/evenements.service';
import type {
  DeletedFilter,
  Evenement,
  EvenementKind,
} from '@/types/evenement.types';
import { ALL_KINDS, EVENEMENT_KIND_LABEL } from '@/types/evenement.types';
import type { Column, RowAction } from '@/types/table.types';

// Couleur d'accent par type
function accentOf(kind: EvenementKind, colors: any): string {
  switch (kind) {
    case 'MARIAGE':
      return '#EC4899';
    case 'CAMP':
      return colors.success;
    case 'SORTIE':
      return colors.info;
    case 'CONFERENCE':
      return colors.primary;
    case 'FORMATION':
      return colors.warning;
    case 'ACTION_DE_GRACE':
      return '#A855F7';
    case 'JOURNEE':
      return '#F97316';
    case 'AUTRE':
    default:
      return colors.textSecondary;
  }
}

export default function EvenementsPage() {
  const { colors } = useTheme();
  const toast = useToast();
  const confirm = useConfirm();

  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtres
  const [kindFilter, setKindFilter] = useState<EvenementKind | ''>('');
  const [deletedFilter, setDeletedFilter] = useState<DeletedFilter>('active');

  // Dialogues
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Evenement | null>(null);
  const [viewing, setViewing] = useState<Evenement | null>(null);

  // ---- Chargement ----
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await evenementsService.list({
        kind: kindFilter || undefined,
        period: 'all',
        deleted: deletedFilter,
        page: 1,
        pageSize: 300,
      });
      setEvenements(res.items);
    } catch {
      setError('Impossible de charger les événements.');
      toast.error('Impossible de charger les événements.');
    } finally {
      setLoading(false);
    }
  }, [kindFilter, deletedFilter, toast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ---- Stats ----
  const stats = useMemo(() => {
    const active = evenements.filter((e) => !e.isDeleted).length;
    const deleted = evenements.filter((e) => e.isDeleted).length;
    return { active, deleted, total: evenements.length };
  }, [evenements]);

  // ---- Colonnes ----
  const columns: Column<Evenement>[] = useMemo(
    () => [
      {
        key: 'kind',
        label: 'Type',
        sortable: true,
        width: '160px',
        render: (value: EvenementKind) => {
          const tone = accentOf(value, colors);
          return (
            <span
              className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-black tracking-widest"
              style={{
                backgroundColor: tone + '22',
                borderColor: tone + '55',
                color: tone,
              }}
            >
              {EVENEMENT_KIND_LABEL[value].toUpperCase()}
            </span>
          );
        },
      },
      {
        key: 'title',
        label: 'Titre',
        sortable: true,
        render: (value: string, row: Evenement) => (
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
        width: '160px',
        render: (value: string | null) => (
          <div className="flex items-center gap-1.5">
            <Calendar
              className="h-3 w-3 shrink-0"
              style={{ color: colors.textMuted }}
            />
            <span style={{ color: colors.textSecondary }} className="text-xs">
              {value
                ? new Date(value).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : '—'}
            </span>
          </div>
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
        key: 'status',
        label: 'Statut',
        sortable: true,
        width: '120px',
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
    ],
    [colors],
  );

  // ---- Actions contextuelles ----
  const actions: RowAction<Evenement>[] = useMemo(
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
            await evenementsService.remove(row.id);
            toast.success(`« ${row.title} » déplacé à la corbeille.`, {
              title: 'Événement mis à la corbeille',
              action: {
                label: 'Annuler',
                onClick: async () => {
                  try {
                    await evenementsService.restore(row.id);
                    toast.info('Événement restauré.');
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
            title: 'Restaurer cet événement ?',
            message: `« ${row.title} » redeviendra actif et visible.`,
            variant: 'info',
            confirmLabel: 'Restaurer',
          });
          if (!ok) return;

          try {
            await evenementsService.restore(row.id);
            toast.success(`« ${row.title} » restauré.`, {
              title: 'Événement restauré',
            });
            loadAll();
          } catch {
            toast.error('Impossible de restaurer cet événement.');
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
            await evenementsService.hardDelete(row.id);
            toast.success(`« ${row.title} » supprimé définitivement.`, {
              title: 'Événement supprimé',
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
            Événements
          </h1>
          <p
            className="mt-1 text-sm font-medium"
            style={{ color: colors.textSecondary }}
          >
            Mariages, camps, sorties, conférences, formations…
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
            Nouvel événement
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
            setKindFilter(e.target.value as EvenementKind | '')
          }
          className="h-8 rounded-md border px-3 text-xs font-bold outline-none"
          style={{
            backgroundColor: colors.surfaceAlt,
            borderColor: colors.border,
            color: colors.text,
          }}
        >
          <option value="">Tous les types</option>
          {ALL_KINDS.map((k) => (
            <option key={k} value={k}>
              {EVENEMENT_KIND_LABEL[k]}
            </option>
          ))}
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
        data={evenements}
        columns={columns}
        loading={loading}
        config={{
          searchable: true,
          searchPlaceholder: 'Rechercher un événement…',
          pagination: true,
          defaultPageSize: 10,
          selectable: true,
          actions,
          emptyMessage:
            deletedFilter === 'deleted'
              ? 'Aucun événement dans la corbeille.'
              : 'Aucun événement enregistré.',
          rowClassName: (row: Evenement) =>
            row.isDeleted ? 'opacity-60' : '',
        }}
      />

      {/* ═══════════ FORMULAIRE ═══════════ */}
      <EvenementFormDialog
        open={formOpen}
        evenement={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSuccess={() => {
          setFormOpen(false);
          setEditing(null);
          toast.success(
            editing
              ? 'Événement modifié avec succès.'
              : 'Événement créé avec succès.',
          );
          loadAll();
        }}
      />

      {/* ═══════════ DÉTAIL ═══════════ */}
      <EvenementDetailDialog
        open={!!viewing}
        evenement={viewing}
        onClose={() => setViewing(null)}
      />
    </div>
  );
}