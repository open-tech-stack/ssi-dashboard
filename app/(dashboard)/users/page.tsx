// app/(dashboard)/users/page.tsx
'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useTheme } from '@/components/providers/ThemeProvider';
import DataTable from '@/components/ui/DataTable';
import UserFormDialog from '@/components/users/UserFormDialog';
import { usersService } from '@/services/users/users.service';
import type { Column, RowAction } from '@/types/table.types';
import type { User } from '@/types/user.types';
import { Person } from '@/types/person.types';
import { peopleService } from '@/services';

export default function UsersPage() {
  const { colors } = useTheme();

  // ---- Données ----
  const [users, setUsers] = useState<User[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- Formulaire ----
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // ---- Chargement ----
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, peopleRes] = await Promise.all([
        usersService.list({ page: 1, pageSize: 200 }),
        peopleService.list({ page: 1, pageSize: 500 }),
      ]);
      setUsers(usersRes.items);
      setPeople(peopleRes.items);
    } catch {
      setError('Impossible de charger les utilisateurs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Map personId -> fullName pour affichage
  const personNameById = useMemo(() => {
    const map = new Map<string, string>();
    people.forEach((p) => map.set(p.id, p.fullName));
    return map;
  }, [people]);

  // ---- Colonnes ----
  const columns: Column<User>[] = useMemo(
    () => [
      {
        key: 'code',
        label: 'Code',
        sortable: true,
        width: '180px',
        render: (value: string) => (
          <span
            className="font-mono text-xs font-bold tracking-widest"
            style={{ color: colors.primary }}
          >
            {value}
          </span>
        ),
      },
      {
        key: 'role',
        label: 'Rôle',
        sortable: true,
        width: '120px',
        render: (value: string) => (
          <span
            className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-black tracking-widest"
            style={{
              backgroundColor:
                value === 'ADMIN'
                  ? colors.primary + '22'
                  : colors.surfaceAlt,
              borderColor:
                value === 'ADMIN' ? colors.primary + '55' : colors.border,
              color: value === 'ADMIN' ? colors.primary : colors.textSecondary,
            }}
          >
            {value}
          </span>
        ),
      },
      {
        key: 'personId',
        label: 'Personne',
        render: (value: string | null) => {
          if (!value) return <span style={{ color: colors.textMuted }}>—</span>;
          return (
            <span style={{ color: colors.text }}>
              {personNameById.get(value) ?? '—'}
            </span>
          );
        },
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
    [colors, personNameById],
  );

  // ---- Actions par ligne ----
  const actions: RowAction<User>[] = useMemo(
    () => [
      {
        icon: Pencil,
        label: 'Modifier',
        onClick: (row) => {
          setEditingUser(row);
          setFormOpen(true);
        },
      },
      {
        icon: Trash2,
        label: 'Supprimer',
        onClick: async (row) => {
          if (
            !confirm(
              `Supprimer l'utilisateur ${row.code} ? Cette action est réversible côté backend (soft delete).`,
            )
          )
            return;
          try {
            await usersService.remove(row.id);
            setUsers((prev) => prev.filter((u) => u.id !== row.id));
          } catch {
            alert('Impossible de supprimer cet utilisateur.');
          }
        },
        className: 'hover:bg-red-500/10 hover:text-red-500',
      },
    ],
    [],
  );

  // ---- Handlers ----
  const handleCreate = () => {
    setEditingUser(null);
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditingUser(null);
    loadAll();
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      {/* Titre + action */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-black tracking-wide"
            style={{ color: colors.text }}
          >
            Utilisateurs
          </h1>
          <p
            className="mt-1 text-sm font-medium"
            style={{ color: colors.textSecondary }}
          >
            Gérez les comptes et les codes d'accès des membres de l'église.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          className="flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-bold shadow-md transition hover:opacity-90"
          style={{
            backgroundColor: colors.primary,
            color: colors.onPrimary,
          }}
        >
          <Plus className="h-4 w-4" />
          Nouvel utilisateur
        </button>
      </div>

      {/* Erreur */}
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

      {/* Tableau */}
      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        config={{
          searchable: true,
          searchPlaceholder: 'Rechercher un code…',
          pagination: true,
          defaultPageSize: 10,
          selectable: true,
          actions,
          emptyMessage: 'Aucun utilisateur pour le moment.',
        }}
      />

      {/* Formulaire (création / édition) */}
      <UserFormDialog
        open={formOpen}
        user={editingUser}
        people={people}
        onClose={() => {
          setFormOpen(false);
          setEditingUser(null);
        }}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}