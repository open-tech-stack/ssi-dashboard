// app/(dashboard)/evenements/page.tsx
'use client';

import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import EvenementDetailDialog from '@/components/evenements/EvenementDetailDialog';
import EvenementFormDialog from '@/components/evenements/EvenementFormDialog';
import { useTheme } from '@/components/providers/ThemeProvider';
import DataTable from '@/components/ui/DataTable';
import { evenementsService } from '@/services/evenements/evenements.service';
import type { Evenement, EvenementKind } from '@/types/evenement.types';
import {
  ALL_KINDS,
  EVENEMENT_KIND_LABEL,
} from '@/types/evenement.types';
import type { Column, RowAction } from '@/types/table.types';

// Couleur d'accent par type (alignée sur le mobile)
function accentOf(kind: EvenementKind, colors: any): string {
  switch (kind) {
    case 'MARIAGE':         return '#EC4899';
    case 'CAMP':            return colors.success;
    case 'SORTIE':          return colors.info;
    case 'CONFERENCE':      return colors.primary;
    case 'FORMATION':       return colors.warning;
    case 'ACTION_DE_GRACE': return '#A855F7';
    case 'JOURNEE':         return '#F97316';
    case 'AUTRE':
    default:                return colors.textSecondary;
  }
}

export default function EvenementsPage() {
  const { colors } = useTheme();

  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [kindFilter, setKindFilter] = useState<EvenementKind | ''>('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Evenement | null>(null);
  const [viewing, setViewing] = useState<Evenement | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await evenementsService.list({
        kind: kindFilter || undefined,
        period: 'all',
        page: 1,
        pageSize: 300,
      });
      setEvenements(res.items);
    } catch {
      setError('Impossible de charger les événements.');
    } finally {
      setLoading(false);
    }
  }, [kindFilter]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Colonnes
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
        render: (value: string) => (
          <span style={{ color: colors.text }} className="font-bold">
            {value}
          </span>
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

  // Actions
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
      },
      {
        icon: Trash2,
        label: 'Supprimer',
        onClick: async (row) => {
          if (!confirm(`Supprimer "${row.title}" ? (soft delete)`)) return;
          try {
            await evenementsService.remove(row.id);
            setEvenements((prev) => prev.filter((p) => p.id !== row.id));
          } catch {
            alert('Impossible de supprimer cet événement.');
          }
        },
        className: 'hover:bg-red-500/10 hover:text-red-500',
      },
    ],
    [],
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      {/* Titre + actions */}
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
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value as EvenementKind | '')}
            className="h-10 rounded-lg border px-3 text-sm font-semibold outline-none"
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
          emptyMessage: 'Aucun événement enregistré.',
        }}
      />

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
          loadAll();
        }}
      />

      <EvenementDetailDialog
        open={!!viewing}
        evenement={viewing}
        onClose={() => setViewing(null)}
      />
    </div>
  );
}