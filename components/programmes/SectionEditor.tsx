// components/programmes/SectionEditor.tsx
'use client';

import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Trash2,
  Type,
  User,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { useTheme } from '@/components/providers/ThemeProvider';
import type { Group } from '@/types/group.types';
import type { Person } from '@/types/person.types';
import type {
  ProgrammeSectionKey,
  ProgrammeSectionPayload,
} from '@/types/programme.types';
import { SECTION_KEY_LABEL } from '@/types/programme.types';

type SectionMode = 'persons' | 'group' | 'value';

interface Props {
  section: ProgrammeSectionPayload;
  index: number;
  people: Person[];
  groups: Group[];
  onChange: (next: ProgrammeSectionPayload) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

const SECTION_KEYS_ALL: ProgrammeSectionKey[] = [
  'ACCUEIL',
  'ANIMATION',
  'LOUANGE_ADORATION',
  'PREDICATION',
  'INTERPRETATION',
  'PARKING',
  'LIBRE',
];

const MODES: { key: SectionMode; label: string; icon: typeof User }[] = [
  { key: 'persons', label: 'Personnes', icon: User },
  { key: 'group', label: 'Groupe', icon: Users },
  { key: 'value', label: 'Texte', icon: Type },
];

/**
 * Déduit le mode initial depuis les données d'une section.
 */
function detectMode(section: ProgrammeSectionPayload): SectionMode {
  if (section.groupId) return 'group';
  if (section.value && !section.personIds?.length) return 'value';
  return 'persons';
}

export default function SectionEditor({
  section,
  index,
  people,
  groups,
  onChange,
  onRemove,
  onMove,
  canMoveUp,
  canMoveDown,
}: Props) {
  const { colors } = useTheme();

  const [mode, setMode] = useState<SectionMode>(() => detectMode(section));

  // Resync seulement si la clé change (pas à chaque render)
  useEffect(() => {
    setMode(detectMode(section));
  }, [section.key]); // ⬅️ plus précis que [index]

  const handleModeChange = (next: SectionMode) => {
    setMode(next);
    if (next === 'persons') {
      onChange({ ...section, groupId: null, value: null });
    } else if (next === 'group') {
      onChange({ ...section, personIds: [], value: null });
    } else {
      onChange({ ...section, personIds: [], groupId: null });
    }
  };

  const togglePerson = (id: string) => {
    const current = section.personIds ?? [];
    const next = current.includes(id)
      ? current.filter((p) => p !== id)
      : [...current, id];
    onChange({ ...section, personIds: next });
  };

  // Indicateur du mode actif (pastille colorée à droite)
  const modeIndicator =
    mode === 'group' && section.groupId
      ? { label: groups.find((g) => g.id === section.groupId)?.name ?? 'Groupe', color: colors.info }
      : mode === 'value' && section.value
        ? { label: section.value, color: colors.warning }
        : null;

  return (
    <div
      className="flex flex-col gap-3 rounded-xl border p-3 transition"
      style={{
        backgroundColor: colors.surfaceAlt,
        borderColor: mode === 'persons' ? colors.border : colors.primary + '33',
      }}
    >
      {/* ═══════════ HEADER ═══════════ */}
      <div className="flex items-center gap-2">
        {/* Grip + flèches */}
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            disabled={!canMoveUp}
            onClick={() => onMove(-1)}
            className="flex h-4 w-5 items-center justify-center rounded transition hover:bg-white/10 disabled:opacity-20"
            style={{ color: colors.textMuted }}
            title="Monter"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <GripVertical
            className="mx-auto h-3 w-3"
            style={{ color: colors.textMuted }}
          />
          <button
            type="button"
            disabled={!canMoveDown}
            onClick={() => onMove(1)}
            className="flex h-4 w-5 items-center justify-center rounded transition hover:bg-white/10 disabled:opacity-20"
            style={{ color: colors.textMuted }}
            title="Descendre"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>

        {/* Numéro de section */}
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-black"
          style={{
            backgroundColor: colors.primary,
            color: colors.onPrimary,
          }}
        >
          {index + 1}
        </span>

        {/* Clé (type de section) */}
        <select
          value={section.key}
          onChange={(e) =>
            onChange({
              ...section,
              key: e.target.value as ProgrammeSectionKey,
              label:
                e.target.value === 'LIBRE'
                  ? section.label || ''
                  : SECTION_KEY_LABEL[e.target.value as ProgrammeSectionKey],
            })
          }
          className="h-8 flex-1 rounded-md border px-2 text-xs font-bold outline-none"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
          }}
        >
          {SECTION_KEYS_ALL.map((k) => (
            <option key={k} value={k}>
              {SECTION_KEY_LABEL[k]}
            </option>
          ))}
        </select>

        {/* Label (éditable seulement pour LIBRE) */}
        {section.key === 'LIBRE' && (
          <input
            value={section.label}
            onChange={(e) => onChange({ ...section, label: e.target.value })}
            placeholder="Libellé"
            className="h-8 flex-1 rounded-md border px-2 text-xs outline-none"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            }}
          />
        )}

        {/* Trash */}
        <button
          type="button"
          onClick={onRemove}
          className="flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-red-500/10 hover:text-red-500"
          style={{ color: colors.textMuted }}
          title="Supprimer la section"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* ═══════════ MODE SELECTOR ═══════════ */}
      <div
        className="flex gap-1 rounded-lg p-1"
        style={{ backgroundColor: colors.surface }}
      >
        {MODES.map((m) => {
          const active = mode === m.key;
          const Icon = m.icon;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => handleModeChange(m.key)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-[10px] font-bold transition"
              style={{
                backgroundColor: active ? colors.primary + '22' : 'transparent',
                borderColor: active ? colors.primary : 'transparent',
                color: active ? colors.primary : colors.textSecondary,
              }}
            >
              <Icon className="h-3 w-3" />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* ═══════════ CONTENU SELON MODE ═══════════ */}
      {mode === 'persons' && (
        <PersonMultiSelect
          people={people}
          selectedIds={section.personIds ?? []}
          onToggle={togglePerson}
        />
      )}

      {mode === 'group' && (
        <select
          value={section.groupId ?? ''}
          onChange={(e) =>
            onChange({ ...section, groupId: e.target.value || null })
          }
          className="h-9 rounded-md border px-2 text-xs outline-none"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
          }}
        >
          <option value="">— Sélectionner un groupe —</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      )}

      {mode === 'value' && (
        <input
          value={section.value ?? ''}
          onChange={(e) => onChange({ ...section, value: e.target.value })}
          placeholder="Ex : Oui, 12h00, Salle annexe…"
          className="h-9 rounded-md border px-2 text-xs outline-none"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
          }}
        />
      )}

      {/* Indicateur discret du contenu choisi */}
      {modeIndicator && (
        <div
          className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-semibold"
          style={{
            backgroundColor: modeIndicator.color + '11',
            borderColor: modeIndicator.color + '33',
            color: modeIndicator.color,
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: modeIndicator.color }} />
          {modeIndicator.label}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Multi-select personnes (chips)
// ------------------------------------------------------------------
function PersonMultiSelect({
  people,
  selectedIds,
  onToggle,
}: {
  people: Person[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  const { colors } = useTheme();

  return (
    <div className="flex flex-col gap-2">
      {/* Chips sélectionnés */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedIds.map((id) => {
            const person = people.find((p) => p.id === id);
            if (!person) return null;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                style={{
                  backgroundColor: colors.primary + '22',
                  borderColor: colors.primary + '55',
                  color: colors.primary,
                }}
              >
                {person.fullName}
                <button
                  type="button"
                  onClick={() => onToggle(id)}
                  className="ml-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Ajout */}
      <select
        value=""
        onChange={(e) => {
          if (e.target.value) onToggle(e.target.value);
        }}
        className="h-9 rounded-md border px-2 text-xs outline-none"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          color: colors.text,
        }}
      >
        <option value="">+ Ajouter une personne…</option>
        {people
          .filter((p) => !selectedIds.includes(p.id))
          .map((p) => (
            <option key={p.id} value={p.id}>
              {p.fullName}
            </option>
          ))}
      </select>
    </div>
  );
}