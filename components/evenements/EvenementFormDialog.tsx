// components/evenements/EvenementFormDialog.tsx
'use client';

import { Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useTheme } from '@/components/providers/ThemeProvider';
import { evenementsService } from '@/services/evenements/evenements.service';
import type {
  CreateEvenementPayload,
  Evenement,
  EvenementKind,
  EvenementStatus,
  PublicCible,
} from '@/types/evenement.types';
import {
  ALL_KINDS,
  ALL_PUBLICS,
  EVENEMENT_KIND_LABEL,
  PUBLIC_CIBLE_LABEL,
} from '@/types/evenement.types';
import type { Priority } from '@/types/programme.types';

interface Props {
  open: boolean;
  evenement: Evenement | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EvenementFormDialog({
  open,
  evenement,
  onClose,
  onSuccess,
}: Props) {
  const { colors } = useTheme();

  // ---- État principal ----
  const [kind, setKind] = useState<EvenementKind>('MARIAGE');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [detail, setDetail] = useState('');
  const [priority, setPriority] = useState<Priority>('NORMAL');
  const [status, setStatus] = useState<EvenementStatus>('A_VENIR');
  const [location, setLocation] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [notification, setNotification] = useState(false); // 🔔 AJOUT

  // MARIAGE
  const [groomName, setGroomName] = useState('');
  const [brideName, setBrideName] = useState('');
  const [townHallTime, setTownHallTime] = useState('');
  const [townHallPlace, setTownHallPlace] = useState('');
  const [ceremonyTime, setCeremonyTime] = useState('');
  const [ceremonyPlace, setCeremonyPlace] = useState('');
  const [receptionPlace, setReceptionPlace] = useState('');

  // CAMP / SORTIE / JOURNEE
  const [audience, setAudience] = useState<PublicCible | ''>('');
  const [audienceOther, setAudienceOther] = useState('');
  const [theme, setTheme] = useState('');

  // CONFERENCE
  const [speaker, setSpeaker] = useState('');

  // FORMATION
  const [trainer, setTrainer] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ---- Reset à l'ouverture ----
  useEffect(() => {
    if (!open) return;
    if (evenement) {
      setKind(evenement.kind);
      setTitle(evenement.title);
      setSummary(evenement.summary);
      setDetail(evenement.detail ?? '');
      setPriority(evenement.priority);
      setStatus(evenement.rawStatus as EvenementStatus);
      setLocation(evenement.location ?? '');
      setStartsAt(toLocalInput(evenement.startsAt));
      setEndsAt(toLocalInput(evenement.endsAt));
      setNotification(evenement.notification); // 🔔 AJOUT

      setGroomName(evenement.groomName ?? '');
      setBrideName(evenement.brideName ?? '');
      setTownHallTime(evenement.townHallTime ?? '');
      setTownHallPlace(evenement.townHallPlace ?? '');
      setCeremonyTime(evenement.ceremonyTime ?? '');
      setCeremonyPlace(evenement.ceremonyPlace ?? '');
      setReceptionPlace(evenement.receptionPlace ?? '');

      setAudience(evenement.audience ?? '');
      setAudienceOther(evenement.audienceOther ?? '');
      setTheme(evenement.theme ?? '');

      setSpeaker(evenement.speaker ?? '');
      setTrainer(evenement.trainer ?? '');
    } else {
      setKind('MARIAGE');
      setTitle('');
      setSummary('');
      setDetail('');
      setPriority('NORMAL');
      setStatus('A_VENIR');
      setLocation('');
      setStartsAt('');
      setEndsAt('');
      setNotification(false); // 🔔 AJOUT

      setGroomName('');
      setBrideName('');
      setTownHallTime('');
      setTownHallPlace('');
      setCeremonyTime('');
      setCeremonyPlace('');
      setReceptionPlace('');

      setAudience('');
      setAudienceOther('');
      setTheme('');

      setSpeaker('');
      setTrainer('');
    }
    setError(null);
  }, [open, evenement]);

  if (!open) return null;

  const isEditing = !!evenement;

  // ---- Validation locale ----
  const validate = (): string | null => {
    if (!title.trim()) return 'Le titre est obligatoire.';
    if (!summary.trim()) return 'Le résumé est obligatoire.';

    if (kind === 'MARIAGE') {
      if (!groomName.trim()) return 'Le nom du marié est obligatoire.';
      if (!brideName.trim()) return 'Le nom de la mariée est obligatoire.';
    }
    if (kind === 'CAMP' || kind === 'SORTIE') {
      if (!audience) return 'Le public cible est obligatoire.';
      if (!theme.trim()) return 'Le thème principal est obligatoire.';
    }
    if (kind === 'CONFERENCE') {
      if (!speaker.trim()) return 'Le conférencier est obligatoire.';
      if (!theme.trim()) return 'Le thème est obligatoire.';
    }
    if (kind === 'FORMATION') {
      if (!trainer.trim()) return 'Le formateur est obligatoire.';
    }
    if (kind === 'JOURNEE') {
      if (!audience) return 'Le public cible est obligatoire.';
    }
    return null;
  };

  // ---- Submit ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    // Construction du payload
    const payload: CreateEvenementPayload = {
      kind,
      title: title.trim(),
      summary: summary.trim(),
      detail: detail.trim() || null,
      priority,
      status,
      location: location.trim() || null,
      startsAt: startsAt ? new Date(startsAt).toISOString() : null,
      endsAt: endsAt ? new Date(endsAt).toISOString() : null,
      notification, // 🔔 AJOUT
    };

    if (kind === 'MARIAGE') {
      payload.groomName = groomName.trim();
      payload.brideName = brideName.trim();
      payload.townHallTime = townHallTime.trim() || null;
      payload.townHallPlace = townHallPlace.trim() || null;
      payload.ceremonyTime = ceremonyTime.trim() || null;
      payload.ceremonyPlace = ceremonyPlace.trim() || null;
      payload.receptionPlace = receptionPlace.trim() || null;
    }

    if (kind === 'CAMP' || kind === 'SORTIE' || kind === 'JOURNEE') {
      payload.audience = (audience || null) as PublicCible | null;
      if (audience === 'AUTRE') {
        payload.audienceOther = audienceOther.trim() || null;
      }
    }

    if (kind === 'CAMP' || kind === 'SORTIE' || kind === 'CONFERENCE') {
      payload.theme = theme.trim();
    }

    if (kind === 'CONFERENCE') {
      payload.speaker = speaker.trim();
    }

    if (kind === 'FORMATION') {
      payload.trainer = trainer.trim();
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        await evenementsService.update(evenement!.id, payload);
      } else {
        await evenementsService.create(payload);
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
              {isEditing ? "Modifier l'événement" : 'Nouvel événement'}
            </h2>
            <p
              className="mt-0.5 text-xs"
              style={{ color: colors.textSecondary }}
            >
              Choisis le type, les champs s'adaptent automatiquement.
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

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-5">
            <div className="flex flex-col gap-5">
              {/* Type d'événement */}
              <Field label="TYPE D'ÉVÉNEMENT *">
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {ALL_KINDS.map((k) => {
                    const active = kind === k;
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setKind(k)}
                        className="flex h-10 items-center justify-center rounded-lg border-2 px-2 text-xs font-bold transition"
                        style={{
                          backgroundColor: active
                            ? colors.primary + '22'
                            : colors.surfaceAlt,
                          borderColor: active ? colors.primary : colors.border,
                          color: active ? colors.primary : colors.textSecondary,
                        }}
                      >
                        {EVENEMENT_KIND_LABEL[k]}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* Bloc commun */}
              <Field label="TITRE *">
                <Input value={title} onChange={setTitle} colors={colors} />
              </Field>

              <Field label="RÉSUMÉ *">
                <Input value={summary} onChange={setSummary} colors={colors} />
              </Field>

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
                    onChange={(v) => setStatus(v as EvenementStatus)}
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="DÉBUT">
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
                <Field label="FIN">
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

              {/* ============ CHAMPS SPÉCIFIQUES PAR TYPE ============ */}

              {/* MARIAGE */}
              {kind === 'MARIAGE' && (
                <Section title="DÉTAILS DU MARIAGE" colors={colors}>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="NOM DU MARIÉ *">
                      <Input
                        value={groomName}
                        onChange={setGroomName}
                        colors={colors}
                        placeholder="Ali Diallo"
                      />
                    </Field>
                    <Field label="NOM DE LA MARIÉE *">
                      <Input
                        value={brideName}
                        onChange={setBrideName}
                        colors={colors}
                        placeholder="Fatou Ndiaye"
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="MAIRIE — HEURE">
                      <Input
                        value={townHallTime}
                        onChange={setTownHallTime}
                        colors={colors}
                        placeholder="10h00"
                      />
                    </Field>
                    <Field label="MAIRIE — LIEU">
                      <Input
                        value={townHallPlace}
                        onChange={setTownHallPlace}
                        colors={colors}
                        placeholder="Mairie de Kaloum"
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="CÉRÉMONIE — HEURE">
                      <Input
                        value={ceremonyTime}
                        onChange={setCeremonyTime}
                        colors={colors}
                        placeholder="12h00"
                      />
                    </Field>
                    <Field label="CÉRÉMONIE — LIEU">
                      <Input
                        value={ceremonyPlace}
                        onChange={setCeremonyPlace}
                        colors={colors}
                        placeholder="Temple central"
                      />
                    </Field>
                  </div>

                  <Field label="RÉCEPTION — LIEU">
                    <Input
                      value={receptionPlace}
                      onChange={setReceptionPlace}
                      colors={colors}
                      placeholder="Salle Le Palmier"
                    />
                  </Field>
                </Section>
              )}

              {/* CAMP / SORTIE / JOURNEE */}
              {(kind === 'CAMP' || kind === 'SORTIE' || kind === 'JOURNEE') && (
                <Section title="PUBLIC & THÈME" colors={colors}>
                  <Field label="POUR QUI ? *">
                    <Select
                      value={audience}
                      onChange={(v) => setAudience(v as PublicCible | '')}
                      colors={colors}
                      options={[
                        { value: '', label: '— Sélectionner —' },
                        ...ALL_PUBLICS.map((a) => ({
                          value: a,
                          label: PUBLIC_CIBLE_LABEL[a],
                        })),
                      ]}
                    />
                  </Field>

                  {audience === 'AUTRE' && (
                    <Field label="PRÉCISION">
                      <Input
                        value={audienceOther}
                        onChange={setAudienceOther}
                        colors={colors}
                        placeholder="Ex : Nouveaux convertis"
                      />
                    </Field>
                  )}

                  {(kind === 'CAMP' || kind === 'SORTIE') && (
                    <Field label="THÈME PRINCIPAL *">
                      <Input
                        value={theme}
                        onChange={setTheme}
                        colors={colors}
                        placeholder="Une génération qui ne recule pas"
                      />
                    </Field>
                  )}
                </Section>
              )}

              {/* CONFERENCE */}
              {kind === 'CONFERENCE' && (
                <Section title="DÉTAILS DE LA CONFÉRENCE" colors={colors}>
                  <Field label="CONFÉRENCIER *">
                    <Input
                      value={speaker}
                      onChange={setSpeaker}
                      colors={colors}
                      placeholder="Pasteur Ousmane Baldé"
                    />
                  </Field>
                  <Field label="THÈME *">
                    <Input
                      value={theme}
                      onChange={setTheme}
                      colors={colors}
                      placeholder="Bâtir un foyer selon Dieu"
                    />
                  </Field>
                </Section>
              )}

              {/* FORMATION */}
              {kind === 'FORMATION' && (
                <Section title="DÉTAILS DE LA FORMATION" colors={colors}>
                  <Field label="FORMATEUR *">
                    <Input
                      value={trainer}
                      onChange={setTrainer}
                      colors={colors}
                      placeholder="Moussa Sow"
                    />
                  </Field>
                </Section>
              )}

              {/* ACTION_DE_GRACE / AUTRE : rien de spécifique */}

              {/* Détail long */}
              <Field label="DÉTAIL (optionnel)">
                <textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  rows={4}
                  className="rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{
                    backgroundColor: colors.surfaceAlt,
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                  placeholder="Informations complémentaires…"
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

          {/* Footer */}
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
// Sous-composants
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

function Section({
  title,
  colors,
  children,
}: {
  title: string;
  colors: any;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col gap-4 rounded-xl border p-4"
      style={{
        backgroundColor: colors.surfaceAlt,
        borderColor: colors.border,
      }}
    >
      <h3
        className="text-[10px] font-extrabold tracking-widest"
        style={{ color: colors.textMuted }}
      >
        {title}
      </h3>
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
        backgroundColor: colors.surface,
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
        backgroundColor: colors.surface,
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

function toLocalInput(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}