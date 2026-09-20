// app/(dashboard)/programmes/page.tsx
'use client';

import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import ProgrammeDetailDialog from '@/components/programmes/ProgrammeDetailDialog';
import ProgrammeFormDialog from '@/components/programmes/ProgrammeFormDialog';
import { useTheme } from '@/components/providers/ThemeProvider';
import DataTable from '@/components/ui/DataTable';
import { groupsService } from '@/services/groups/groups.service';
import { peopleService } from '@/services/people/people.service';
import { programmesService } from '@/services/programmes/programmes.service';
import type { Group } from '@/types/group.types';
import type { Person } from '@/types/person.types';
import type { Programme, ProgrammeKind } from '@/types/programme.types';
import { PROGRAMME_KIND_LABEL } from '@/types/programme.types';
import type { Column, RowAction } from '@/types/table.types';

export default function ProgrammesPage() {
  const { colors } = useTheme();

  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtre type côté serveur (on peut aussi le faire côté client)
  const [kindFilter, setKindFilter] = useState<ProgrammeKind | ''>('');

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
    } finally {
      setLoading(false);
    }
  }, [kindFilter]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ---- Colonnes ----
  const columns: Column<Programme>[] = useMemo(
    () => [
      {
        key: 'kind',
        label: 'Type',
        sortable: true,
        width: '180px',
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
        width: '160px',
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
      {
        key: 'sections',
        label: 'Sections',
        width: '100px',
        render: (_: any, row: Programme) => (
          <span style={{ color: colors.textSecondary }} className="text-xs">
            {row.sections.length}
          </span>
        ),
      },
    ],
    [colors],
  );

  // ---- Actions ----
  const actions: RowAction<Programme>[] = useMemo(
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
            await programmesService.remove(row.id);
            setProgrammes((prev) => prev.filter((p) => p.id !== row.id));
          } catch {
            alert('Impossible de supprimer ce programme.');
          }
        },
        className: 'hover:bg-red-500/10 hover:text-red-500',
      },
    ],
    [],
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      {/* Titre + action */}
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

        <div className="flex items-center gap-2">
          {/* Filtre type */}
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value as ProgrammeKind | '')}
            className="h-10 rounded-lg border px-3 text-sm font-semibold outline-none"
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
          emptyMessage: 'Aucun programme enregistré.',
        }}
      />

      {/* Formulaire */}
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
          loadAll();
        }}
      />

      {/* Détail */}
      <ProgrammeDetailDialog
        open={!!viewing}
        programme={viewing}
        onClose={() => setViewing(null)}
      />
    </div>
  );
}