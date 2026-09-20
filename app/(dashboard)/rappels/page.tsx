// app/(dashboard)/rappels/page.tsx
'use client';

import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import RappelDetailDialog from '@/components/rappels/RappelDetailDialog';
import RappelFormDialog from '@/components/rappels/RappelFormDialog';
import { useTheme } from '@/components/providers/ThemeProvider';
import DataTable from '@/components/ui/DataTable';
import { rappelsService } from '@/services/rappels/rappels.service';
import type { Rappel, RappelPriority } from '@/types/rappel.types';
import type { Column, RowAction } from '@/types/table.types';

export default function RappelsPage() {
  const { colors } = useTheme();

  const [rappels, setRappels] = useState<Rappel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [priorityFilter, setPriorityFilter] = useState<RappelPriority | ''>('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Rappel | null>(null);
  const [viewing, setViewing] = useState<Rappel | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await rappelsService.list({
        priority: priorityFilter || undefined,
        page: 1,
        pageSize: 300,
      });
      setRappels(res.items);
    } catch {
      setError('Impossible de charger les rappels.');
    } finally {
      setLoading(false);
    }
  }, [priorityFilter]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Colonnes
  const columns: Column<Rappel>[] = useMemo(
    () => [
      {
        key: 'priority',
        label: 'Priorité',
        sortable: true,
        width: '120px',
        render: (value: RappelPriority) => {
          const tone =
            value === 'URGENT'
              ? colors.danger
              : value === 'IMPORTANT'
              ? colors.warning
              : colors.textMuted;
          const label =
            value === 'URGENT'
              ? 'URGENT'
              : value === 'IMPORTANT'
              ? 'IMPORTANT'
              : 'NORMAL';
          return (
            <span
              className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-black tracking-widest"
              style={{
                backgroundColor: value === 'NORMAL' ? colors.surfaceAlt : tone + '22',
                borderColor: value === 'NORMAL' ? colors.border : tone + '55',
                color: value === 'NORMAL' ? colors.textSecondary : tone,
              }}
            >
              {label}
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
        key: 'elements',
        label: 'Éléments',
        width: '120px',
        render: (_: any, row: Rappel) => (
          <span
            className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold"
            style={{
              backgroundColor: colors.primary + '11',
              borderColor: colors.primary + '33',
              color: colors.primary,
            }}
          >
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
      },
      {
        icon: Trash2,
        label: 'Supprimer',
        onClick: async (row) => {
          if (!confirm(`Supprimer "${row.title}" ? (soft delete)`)) return;
          try {
            await rappelsService.remove(row.id);
            setRappels((prev) => prev.filter((r) => r.id !== row.id));
          } catch {
            alert('Impossible de supprimer ce rappel.');
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
          <select
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value as RappelPriority | '')
            }
            className="h-10 rounded-lg border px-3 text-sm font-semibold outline-none"
            style={{
              backgroundColor: colors.surfaceAlt,
              borderColor: colors.border,
              color: colors.text,
            }}
          >
            <option value="">Toutes priorités</option>
            <option value="URGENT">Urgents</option>
            <option value="IMPORTANT">Importants</option>
            <option value="NORMAL">Normaux</option>
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
            Nouveau rappel
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
          emptyMessage: 'Aucun rappel enregistré.',
        }}
      />

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
          loadAll();
        }}
      />

      <RappelDetailDialog
        open={!!viewing}
        rappel={viewing}
        onClose={() => setViewing(null)}
      />
    </div>
  );
}