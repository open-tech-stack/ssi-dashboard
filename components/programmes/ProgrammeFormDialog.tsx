// components/programmes/ProgrammeFormDialog.tsx
'use client';

import { Loader2, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import SectionEditor from '@/components/programmes/SectionEditor';
import { useTheme } from '@/components/providers/ThemeProvider';
import { programmesService } from '@/services/programmes/programmes.service';
import type { Group } from '@/types/group.types';
import type { Person } from '@/types/person.types';
import type {
  CreateProgrammePayload,
  Priority,
  Programme,
  ProgrammeKind,
  ProgrammeSectionKey,
  ProgrammeSectionPayload,
  ProgrammeStatus,
} from '@/types/programme.types';

interface Props {
  open: boolean;
  programme: Programme | null;
  people: Person[];
  groups: Group[];
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_SECTION: ProgrammeSectionPayload = {
  key: 'ACCUEIL',
  label: 'Accueil',
  order: 0,
  personIds: [],
  groupId: null,
  value: null,
};

export default function ProgrammeFormDialog({
  open,
  programme,
  people,
  groups,
  onClose,
  onSuccess,
}: Props) {
  const { colors } = useTheme();

  // ---- Form state ----
  const [kind, setKind] = useState<ProgrammeKind>('CULTE_DIMANCHE');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<Priority>('NORMAL');
  const [status, setStatus] = useState<ProgrammeStatus>('A_VENIR');
  const [location, setLocation] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [hasHolyCommunion, setHasHolyCommunion] = useState(false);
  const [holyCommunionMessage, setHolyCommunionMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [notification, setNotification] = useState(false); // 🔔 AJOUT
  const [sections, setSections] = useState<ProgrammeSectionPayload[]>([
    { ...DEFAULT_SECTION },
  ]);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ---- Reset à l'ouverture ----
  useEffect(() => {
    if (!open) return;
    if (programme) {
      setKind(programme.kind);
      setTitle(programme.title);
      setSummary(programme.summary);
      setContent(programme.content ?? '');
      setPriority(programme.priority);
      setStatus(programme.rawStatus as ProgrammeStatus);
      setLocation(programme.location ?? '');
      setStartsAt(toLocalInput(programme.startsAt));
      setEndsAt(toLocalInput(programme.endsAt));
      setHasHolyCommunion(!!programme.hasHolyCommunion);
      setHolyCommunionMessage(programme.holyCommunionMessage ?? '');
      setNotes(programme.notes ?? '');
      setNotification(programme.notification); // 🔔 AJOUT
      setSections(
        programme.sections.map((s) => ({
          key: s.key as ProgrammeSectionKey,
          label: s.label,
          order: s.order,
          personIds: s.persons.map((p) => p.id),
          groupId: s.group?.id ?? null,
          value: s.value,
        })),
      );
    } else {
      setKind('CULTE_DIMANCHE');
      setTitle('Culte de dimanche');
      setSummary('');
      setContent('');
      setPriority('NORMAL');
      setStatus('A_VENIR');
      setLocation('');
      setStartsAt('');
      setEndsAt('');
      setHasHolyCommunion(false);
      setHolyCommunionMessage('');
      setNotes('');
      setNotification(false); // 🔔 AJOUT
      setSections([{ ...DEFAULT_SECTION }]);
    }
    setError(null);
  }, [open, programme]);

  if (!open) return null;

  const isEditing = !!programme;
  const isDimanche = kind === 'CULTE_DIMANCHE';

  // ---- Actions sections ----
  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        key: 'LIBRE',
        label: '',
        order: prev.length,
        personIds: [],
        groupId: null,
        value: null,
      },
    ]);
  };

  const updateSection = (index: number, next: ProgrammeSectionPayload) => {
    setSections((prev) => prev.map((s, i) => (i === index ? next : s)));
  };

  const removeSection = (index: number) => {
    setSections((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, order: i })),
    );
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    setSections((prev) => {
      const copy = [...prev];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy.map((s, i) => ({ ...s, order: i }));
    });
  };

  // ---- Submit ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Le titre est obligatoire.');
      return;
    }
    if (!summary.trim()) {
      setError('Le résumé est obligatoire.');
      return;
    }
    if (sections.length === 0) {
      setError('Ajoute au moins une section.');
      return;
    }

    const payload: CreateProgrammePayload = {
      kind,
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim() || null,
      priority,
      status,
      location: location.trim() || null,
      startsAt: startsAt ? new Date(startsAt).toISOString() : null,
      endsAt: endsAt ? new Date(endsAt).toISOString() : null,
      notes: notes.trim() || null,
      hasHolyCommunion: isDimanche ? hasHolyCommunion : undefined,
      holyCommunionMessage:
        isDimanche && holyCommunionMessage.trim()
          ? holyCommunionMessage.trim()
          : undefined,
      notification, // 🔔 AJOUT
      sections: sections.map((s, i) => ({
        key: s.key,
        label: s.label,
        order: i,
        personIds: s.personIds ?? [],
        groupId: s.groupId ?? null,
        value: s.value ?? null,
      })),
    };

    setSubmitting(true);
    try {
      if (isEditing) {
        await programmesService.update(programme!.id, payload);
      } else {
        await programmesService.create(payload);
      }
      onSuccess();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        "Une erreur est survenue lors de l'enregistrement.";
      setError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div
        className="relative flex h-full max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border shadow-2xl"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        {/* Header */}
        <div
          className="flex shrink-0 items-center justify-between border-b p-5"
          style={{ borderColor: colors.border }}
        >
          <div>
            <h2
              className="text-lg font-extrabold tracking-wide"
              style={{ color: colors.text }}
            >
              {isEditing ? 'Modifier le programme' : 'Nouveau programme'}
            </h2>
            <p
              className="mt-0.5 text-xs"
              style={{ color: colors.textSecondary }}
            >
              Remplis les infos et construis le déroulement.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border"
            style={{ borderColor: colors.border, color: colors.text }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form scrollable */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-5">
            <div className="flex flex-col gap-5">
              {/* Type de programme */}
              <Field label="TYPE DE PROGRAMME *">
                <div className="flex gap-2">
                  {(['CULTE_DIMANCHE', 'PRIERE_VENDREDI'] as ProgrammeKind[]).map(
                    (k) => {
                      const active = kind === k;
                      return (
                        <button
                          key={k}
                          type="button"
                          onClick={() => {
                            setKind(k);
                            if (k === 'PRIERE_VENDREDI') {
                              setHasHolyCommunion(false);
                              setHolyCommunionMessage('');
                            }
                          }}
                          className="flex h-10 flex-1 items-center justify-center rounded-lg border-2 text-sm font-bold transition"
                          style={{
                            backgroundColor: active
                              ? colors.primary + '22'
                              : colors.surfaceAlt,
                            borderColor: active ? colors.primary : colors.border,
                            color: active ? colors.primary : colors.textSecondary,
                          }}
                        >
                          {k === 'CULTE_DIMANCHE'
                            ? 'Culte de dimanche'
                            : 'Prière du vendredi'}
                        </button>
                      );
                    },
                  )}
                </div>
              </Field>

              {/* Titre + résumé */}
              <Field label="TITRE *">
                <Input
                  value={title}
                  onChange={setTitle}
                  colors={colors}
                  placeholder="Culte de dimanche"
                />
              </Field>

              <Field label="RÉSUMÉ *">
                <Input
                  value={summary}
                  onChange={setSummary}
                  colors={colors}
                  placeholder="Culte dominical…"
                />
              </Field>

              {/* Lieu + priorité + statut */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Field label="LIEU">
                  <Input
                    value={location}
                    onChange={setLocation}
                    colors={colors}
                    placeholder="Temple central"
                  />
                </Field>

                <Field label="PRIORITÉ">
                  <Select
                    value={priority}
                    onChange={(v) => setPriority(v as Priority)}
                    colors={colors}
                    options={[
                      { value: 'NORMAL', label: 'Normale' },
                      { value: 'IMPORTANT', label: 'Importante' },
                      { value: 'URGENT', label: 'Urgente' },
                    ]}
                  />
                </Field>

                <Field label="STATUT">
                  <Select
                    value={status}
                    onChange={(v) => setStatus(v as ProgrammeStatus)}
                    colors={colors}
                    options={[
                      { value: 'A_VENIR', label: 'À venir' },
                      { value: 'EN_COURS', label: 'En cours' },
                      { value: 'TERMINE', label: 'Terminé' },
                      { value: 'ANNULE', label: 'Annulé' },
                      { value: 'EXPIRE', label: 'Expiré' },
                    ]}
                  />
                </Field>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="DATE / HEURE DE DÉBUT">
                  <input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="h-10 rounded-lg border px-3 text-sm outline-none"
                    style={{
                      backgroundColor: colors.surfaceAlt,
                      borderColor: colors.border,
                      color: colors.text,
                      colorScheme: 'dark',
                    }}
                  />
                </Field>

                <Field label="DATE / HEURE DE FIN">
                  <input
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="h-10 rounded-lg border px-3 text-sm outline-none"
                    style={{
                      backgroundColor: colors.surfaceAlt,
                      borderColor: colors.border,
                      color: colors.text,
                      colorScheme: 'dark',
                    }}
                  />
                </Field>
              </div>

              {/* Sainte-Cène (uniquement dimanche) */}
              {isDimanche && (
                <div
                  className="flex flex-col gap-3 rounded-xl border p-4"
                  style={{
                    backgroundColor: colors.surfaceAlt,
                    borderColor: colors.border,
                  }}
                >
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={hasHolyCommunion}
                      onChange={(e) => setHasHolyCommunion(e.target.checked)}
                      className="h-5 w-5 rounded border-2"
                      style={{
                        accentColor: colors.primary,
                      }}
                    />
                    <span
                      className="text-sm font-bold"
                      style={{ color: colors.text }}
                    >
                      Sainte-Cène ce dimanche
                    </span>
                  </label>

                  <Field label="MESSAGE SAINTE-CÈNE (optionnel)">
                    <textarea
                      value={holyCommunionMessage}
                      onChange={(e) => setHolyCommunionMessage(e.target.value)}
                      rows={2}
                      className="rounded-lg border px-3 py-2 text-sm outline-none"
                      style={{
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.text,
                      }}
                      placeholder="Ce dimanche nous aurons la Sainte-Cène. Préparez vos cœurs…"
                    />
                  </Field>
                </div>
              )}

              {/* Notes */}
              <Field label="NOTES (optionnel)">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{
                    backgroundColor: colors.surfaceAlt,
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                  placeholder="Merci d'arriver 10 minutes avant…"
                />
              </Field>

              {/* 🔔 Notification — AJOUT */}
              <div
                className="flex items-start gap-3 rounded-xl border p-4 transition"
                style={{
                  backgroundColor: notification
                    ? colors.primary + '11'
                    : colors.surfaceAlt,
                  borderColor: notification
                    ? colors.primary + '55'
                    : colors.border,
                }}
              >
                <input
                  id="notify-checkbox"
                  type="checkbox"
                  checked={notification}
                  onChange={(e) => setNotification(e.target.checked)}
                  className="mt-0.5 h-5 w-5 cursor-pointer rounded border-2"
                  style={{ accentColor: colors.primary }}
                />
                <label
                  htmlFor="notify-checkbox"
                  className="flex-1 cursor-pointer"
                >
                  <span
                    className="block text-sm font-bold"
                    style={{ color: colors.text }}
                  >
                    🔔 Envoyer une notification aux membres
                  </span>
                  <span
                    className="mt-0.5 block text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    Les membres recevront une notification push et verront le
                    badge s'incrémenter dans l'application mobile.
                  </span>
                </label>
              </div>

              {/* Sections */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3
                    className="text-xs font-extrabold tracking-widest"
                    style={{ color: colors.textMuted }}
                  >
                    DÉROULEMENT ({sections.length})
                  </h3>
                  <button
                    type="button"
                    onClick={addSection}
                    className="flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition"
                    style={{
                      borderColor: colors.primary + '55',
                      color: colors.primary,
                      backgroundColor: colors.primary + '11',
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Ajouter une section
                  </button>
                </div>

                {sections.map((section, i) => (
                  <SectionEditor
                    key={i}
                    section={section}
                    index={i}
                    people={people}
                    groups={groups}
                    onChange={(next) => updateSection(i, next)}
                    onRemove={() => removeSection(i)}
                    onMove={(dir) => moveSection(i, dir)}
                    canMoveUp={i > 0}
                    canMoveDown={i < sections.length - 1}
                  />
                ))}
              </div>

              {/* Erreur */}
              {error && (
                <div
                  className="rounded-lg border p-3 text-xs font-semibold"
                  style={{
                    backgroundColor: colors.danger + '11',
                    borderColor: colors.danger + '44',
                    color: colors.danger,
                  }}
                >
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div
            className="flex shrink-0 justify-end gap-2 border-t p-4"
            style={{ borderColor: colors.border }}
          >
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border px-4 text-sm font-bold"
              style={{
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.surfaceAlt,
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-bold shadow-md transition disabled:opacity-60"
              style={{
                backgroundColor: colors.primary,
                color: colors.onPrimary,
              }}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Sous-composants utilitaires
// ------------------------------------------------------------------
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-[10px] font-extrabold tracking-widest"
        style={{ color: colors.textMuted }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  colors,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  colors: any;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-10 rounded-lg border px-3 text-sm outline-none"
      style={{
        backgroundColor: colors.surfaceAlt,
        borderColor: colors.border,
        color: colors.text,
      }}
    />
  );
}

function Select({
  value,
  onChange,
  colors,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  colors: any;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-lg border px-3 text-sm outline-none"
      style={{
        backgroundColor: colors.surfaceAlt,
        borderColor: colors.border,
        color: colors.text,
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// Convertit ISO -> "YYYY-MM-DDTHH:mm" pour <input type="datetime-local">
function toLocalInput(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}