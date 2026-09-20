// app/(dashboard)/people/page.tsx
'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import PersonFormDialog from '@/components/people/PersonFormDialog';
import { useTheme } from '@/components/providers/ThemeProvider';
import DataTable from '@/components/ui/DataTable';
import { peopleService } from '@/services/people/people.service';
import type { Person } from '@/types/person.types';
import type { Column, RowAction } from '@/types/table.types';

export default function PeoplePage() {
  const { colors } = useTheme();

  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await peopleService.list({ page: 1, pageSize: 500 });
      setPeople(res.items);
    } catch {
      setError('Impossible de charger les personnes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const columns: Column<Person>[] = useMemo(
    () => [
      {
        key: 'fullName',
        label: 'Nom complet',
        sortable: true,
        render: (value: string) => (
          <span style={{ color: colors.text }} className="font-bold">
            {value}
          </span>
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
        width: '160px',
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

  const actions: RowAction<Person>[] = useMemo(
    () => [
      {
        icon: Pencil,
        label: 'Modifier',
        onClick: (row) => {
          setEditingPerson(row);
          setFormOpen(true);
        },
      },
      {
        icon: Trash2,
        label: 'Supprimer',
        onClick: async (row) => {
          if (!confirm(`Supprimer ${row.fullName} ? (soft delete)`)) return;
          try {
            await peopleService.remove(row.id);
            setPeople((prev) => prev.filter((p) => p.id !== row.id));
          } catch {
            alert('Impossible de supprimer cette personne.');
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
            Personnes
          </h1>
          <p
            className="mt-1 text-sm font-medium"
            style={{ color: colors.textSecondary }}
          >
            Répertoire des personnes (membres, intervenants, invités).
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingPerson(null);
            setFormOpen(true);
          }}
          className="flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-bold shadow-md transition hover:opacity-90"
          style={{ backgroundColor: colors.primary, color: colors.onPrimary }}
        >
          <Plus className="h-4 w-4" />
          Nouvelle personne
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
          emptyMessage: 'Aucune personne enregistrée.',
        }}
      />

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
          loadAll();
        }}
      />
    </div>
  );
}