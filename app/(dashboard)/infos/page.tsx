// app/(dashboard)/infos/page.tsx
'use client';

import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import InfoDetailDialog from '@/components/infos/InfoDetailDialog';
import InfoFormDialog from '@/components/infos/InfoFormDialog';
import { useTheme } from '@/components/providers/ThemeProvider';
import DataTable from '@/components/ui/DataTable';
import { infosService } from '@/services/infos/infos.service';
import type { Info, InfoPriority } from '@/types/info.types';
import type { Column, RowAction } from '@/types/table.types';

export default function InfosPage() {
  const { colors } = useTheme();

  const [infos, setInfos] = useState<Info[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [priorityFilter, setPriorityFilter] = useState<InfoPriority | ''>('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Info | null>(null);
  const [viewing, setViewing] = useState<Info | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await infosService.list({
        priority: priorityFilter || undefined,
        page: 1,
        pageSize: 300,
      });
      setInfos(res.items);
    } catch {
      setError('Impossible de charger les informations.');
    } finally {
      setLoading(false);
    }
  }, [priorityFilter]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Colonnes
  const columns: Column<Info>[] = useMemo(
    () => [
      {
        key: 'priority',
        label: 'Priorité',
        sortable: true,
        width: '120px',
        render: (value: InfoPriority) => {
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
        key: 'summary',
        label: 'Résumé',
        render: (value: string) => (
          <span
            style={{ color: colors.textSecondary }}
            className="text-xs line-clamp-1"
          >
            {value}
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
  const actions: RowAction<Info>[] = useMemo(
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
            await infosService.remove(row.id);
            setInfos((prev) => prev.filter((p) => p.id !== row.id));
          } catch {
            alert('Impossible de supprimer cette info.');
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
            Infos
          </h1>
          <p
            className="mt-1 text-sm font-medium"
            style={{ color: colors.textSecondary }}
          >
            Canal libre : annonces, rappels, prières, événements…
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value as InfoPriority | '')
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
            Nouvelle info
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
        data={infos}
        columns={columns}
        loading={loading}
        config={{
          searchable: true,
          searchPlaceholder: 'Rechercher une info…',
          pagination: true,
          defaultPageSize: 10,
          selectable: true,
          actions,
          emptyMessage: 'Aucune information enregistrée.',
        }}
      />

      <InfoFormDialog
        open={formOpen}
        info={editing}
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

      <InfoDetailDialog
        open={!!viewing}
        info={viewing}
        onClose={() => setViewing(null)}
      />
    </div>
  );
}