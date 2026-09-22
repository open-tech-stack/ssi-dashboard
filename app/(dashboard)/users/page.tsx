// app/(dashboard)/users/page.tsx
'use client';

import { Eye, KeyRound, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useTheme } from '@/components/providers/ThemeProvider';
import DataTable from '@/components/ui/DataTable';
import { useToast } from '@/components/ui/Toast';
import UserCodeDialog from '@/components/users/UserCodeDialog';
import UserFormDialog from '@/components/users/UserFormDialog';
import { useConfirm } from '@/hooks/useConfirm';
import { useAuth } from '@/contexts/AuthContext';
import { peopleService } from '@/services';
import { usersService } from '@/services/users/users.service';
import type { Person } from '@/types/person.types';
import type { Column, RowAction } from '@/types/table.types';
import type { User } from '@/types/user.types';

export default function UsersPage() {
  const { colors } = useTheme();
  const toast = useToast();
  const confirm = useConfirm();
  const { user: currentUser } = useAuth();

  // ---- Données ----
  const [users, setUsers] = useState<User[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- Formulaire ----
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // ---- Dialog code ----
  const [codeUser, setCodeUser] = useState<User | null>(null);

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
      toast.error('Impossible de charger les utilisateurs.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Map personId -> fullName
  const personNameById = useMemo(() => {
    const map = new Map<string, string>();
    people.forEach((p) => map.set(p.id, p.fullName));
    return map;
  }, [people]);

  // ⚠️ Filtre : exclut l'utilisateur connecté
  const visibleUsers = useMemo(
    () => users.filter((u) => u.id !== currentUser?.id),
    [users, currentUser?.id],
  );

  // ---- Colonnes ----
  const columns: Column<User>[] = useMemo(
    () => [
      {
        key: 'role',
        label: 'Rôle',
        sortable: true,
        width: '130px',
        render: (value: string, row: User) => (
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-black tracking-widest"
              style={{
                backgroundColor:
                  value === 'ADMIN'
                    ? colors.primary + '22'
                    : colors.surfaceAlt,
                borderColor:
                  value === 'ADMIN' ? colors.primary + '55' : colors.border,
                color:
                  value === 'ADMIN' ? colors.primary : colors.textSecondary,
              }}
            >
              {value}
            </span>
            {row.id === currentUser?.id && (
              <span
                className="text-[9px] font-black tracking-widest"
                style={{ color: colors.textMuted }}
              >
                (VOUS)
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'personId',
        label: 'Personne',
        render: (value: string | null) => {
          if (!value)
            return <span style={{ color: colors.textMuted }}>—</span>;
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
    [colors, personNameById, currentUser?.id],
  );

  // ---- Actions ----
  const actions: RowAction<User>[] = useMemo(
    () => [
      {
        icon: Eye,
        label: 'Voir le code',
        onClick: (row) => setCodeUser(row),
        className: 'hover:bg-blue-500/10 hover:text-blue-500',
      },
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
        label: 'Mettre à la corbeille',
        onClick: async (row) => {
          const personLabel = row.personId
            ? personNameById.get(row.personId)
            : null;
          const label = personLabel
            ? `l'utilisateur lié à ${personLabel}`
            : `l'utilisateur ${row.id.slice(0, 8)}…`;

          const ok = await confirm({
            title: 'Mettre à la corbeille ?',
            message: `${label} sera déplacé dans la corbeille. Le compte ne pourra plus se connecter.`,
            variant: 'warning',
            confirmLabel: 'Mettre à la corbeille',
          });
          if (!ok) return;

          try {
            await usersService.remove(row.id);
            toast.success('Utilisateur mis à la corbeille.', {
              title: 'Utilisateur supprimé',
            });
            loadAll();
          } catch {
            toast.error('Impossible de supprimer cet utilisateur.');
          }
        },
        className: 'hover:bg-red-500/10 hover:text-red-500',
      },
    ],
    [confirm, toast, loadAll, personNameById],
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
      {/* ═══════════ HEADER ═══════════ */}
      <div className="flex flex-wrap items-start justify-between gap-3">
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
            Gérez les comptes et les codes d&apos;accès des membres de
            l&apos;église.
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

      {/* ═══════════ BANDEAU INFO ═══════════ */}
      <div
        className="flex items-start gap-3 rounded-xl border p-3"
        style={{
          backgroundColor: colors.primary + '08',
          borderColor: colors.primary + '33',
        }}
      >
        <KeyRound
          className="mt-0.5 h-4 w-4 shrink-0"
          style={{ color: colors.primary }}
        />
        <p
          className="text-xs leading-relaxed"
          style={{ color: colors.textSecondary }}
        >
          <b style={{ color: colors.text }}>Codes d&apos;accès sécurisés.</b>{' '}
          Les codes ne sont plus affichés dans le tableau. Cliquez sur{' '}
          <Eye className="inline h-3 w-3" /> pour consulter le code d&apos;un
          utilisateur. Votre propre compte n&apos;apparaît pas dans cette liste.
        </p>
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
        data={visibleUsers}
        columns={columns}
        loading={loading}
        config={{
          searchable: true,
          searchPlaceholder: 'Rechercher un utilisateur…',
          pagination: true,
          defaultPageSize: 10,
          selectable: true,
          actions,
          emptyMessage: 'Aucun utilisateur pour le moment.',
        }}
      />

      {/* ═══════════ FORMULAIRE ═══════════ */}
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

      {/* ═══════════ DIALOG CODE ═══════════ */}
      <UserCodeDialog
        open={!!codeUser}
        user={codeUser}
        personName={
          codeUser?.personId
            ? personNameById.get(codeUser.personId)
            : null
        }
        onClose={() => setCodeUser(null)}
      />
    </div>
  );
}