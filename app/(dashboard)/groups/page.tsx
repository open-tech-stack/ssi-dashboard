// app/(dashboard)/groups/page.tsx
'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import GroupFormDialog from '@/components/groups/GroupFormDialog';
import { useTheme } from '@/components/providers/ThemeProvider';
import DataTable from '@/components/ui/DataTable';
import { groupsService } from '@/services/groups/groups.service';
import type { Group } from '@/types/group.types';
import type { Column, RowAction } from '@/types/table.types';

export default function GroupsPage() {
  const { colors } = useTheme();

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await groupsService.list({ page: 1, pageSize: 500 });
      setGroups(res.items);
    } catch {
      setError('Impossible de charger les groupes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const columns: Column<Group>[] = useMemo(
    () => [
      {
        key: 'name',
        label: 'Nom',
        sortable: true,
        render: (value: string) => (
          <span style={{ color: colors.text }} className="font-bold">
            {value}
          </span>
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

  const actions: RowAction<Group>[] = useMemo(
    () => [
      {
        icon: Pencil,
        label: 'Modifier',
        onClick: (row) => {
          setEditingGroup(row);
          setFormOpen(true);
        },
      },
      {
        icon: Trash2,
        label: 'Supprimer',
        onClick: async (row) => {
          if (!confirm(`Supprimer le groupe "${row.name}" ? (soft delete)`))
            return;
          try {
            await groupsService.remove(row.id);
            setGroups((prev) => prev.filter((g) => g.id !== row.id));
          } catch {
            alert('Impossible de supprimer ce groupe.');
          }
        },
        className: 'hover:bg-red-500/10 hover:text-red-500',
      },
    ],
    [],
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex items-start justify-between">
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

        <button
          type="button"
          onClick={() => {
            setEditingGroup(null);
            setFormOpen(true);
          }}
          className="flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-bold shadow-md transition hover:opacity-90"
          style={{ backgroundColor: colors.primary, color: colors.onPrimary }}
        >
          <Plus className="h-4 w-4" />
          Nouveau groupe
        </button>
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
          emptyMessage: 'Aucun groupe enregistré.',
        }}
      />

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
          loadAll();
        }}
      />
    </div>
  );
}