// app/(dashboard)/prieres/page.tsx
'use client';

import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import PriereDetailDialog from '@/components/prieres/PriereDetailDialog';
import PriereFormDialog from '@/components/prieres/PriereFormDialog';
import { useTheme } from '@/components/providers/ThemeProvider';
import DataTable from '@/components/ui/DataTable';
import { prieresService } from '@/services/prieres/prieres.service';
import type { Priere, PrierePriority } from '@/types/priere.types';
import type { Column, RowAction } from '@/types/table.types';

export default function PrieresPage() {
  const { colors } = useTheme();

  const [prieres, setPrieres] = useState<Priere[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [priorityFilter, setPriorityFilter] = useState<PrierePriority | ''>('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Priere | null>(null);
  const [viewing, setViewing] = useState<Priere | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await prieresService.list({
        priority: priorityFilter || undefined,
        page: 1,
        pageSize: 300,
      });
      setPrieres(res.items);
    } catch {
      setError('Impossible de charger les prières.');
    } finally {
      setLoading(false);
    }
  }, [priorityFilter]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Colonnes
  const columns: Column<Priere>[] = useMemo(
    () => [
      {
        key: 'priority',
        label: 'Priorité',
        sortable: true,
        width: '120px',
        render: (value: PrierePriority) => {
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
      },
      {
        icon: Trash2,
        label: 'Supprimer',
        onClick: async (row) => {
          if (!confirm(`Supprimer "${row.title}" ? (soft delete)`)) return;
          try {
            await prieresService.remove(row.id);
            setPrieres((prev) => prev.filter((p) => p.id !== row.id));
          } catch {
            alert('Impossible de supprimer cette prière.');
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
          <select
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value as PrierePriority | '')
            }
            className="h-10 rounded-lg border px-3 text-sm font-semibold outline-none"
            style={{
              backgroundColor: colors.surfaceAlt,
              borderColor: colors.border,
              color: colors.text,
            }}
          >
            <option value="">Toutes priorités</option>
            <option value="URGENT">Urgentes</option>
            <option value="IMPORTANT">Importantes</option>
            <option value="NORMAL">Normales</option>
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
            Nouvelle prière
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
          emptyMessage: 'Aucune prière enregistrée.',
        }}
      />

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
          loadAll();
        }}
      />

      <PriereDetailDialog
        open={!!viewing}
        priere={viewing}
        onClose={() => setViewing(null)}
      />
    </div>
  );
}