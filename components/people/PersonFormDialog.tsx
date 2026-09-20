// components/people/PersonFormDialog.tsx
'use client';

import { Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useTheme } from '@/components/providers/ThemeProvider';
import { peopleService } from '@/services/people/people.service';
import type { Person } from '@/types/person.types';

interface Props {
  open: boolean;
  person: Person | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PersonFormDialog({
  open,
  person,
  onClose,
  onSuccess,
}: Props) {
  const { colors } = useTheme();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (person) {
      setFirstName(person.firstName);
      setLastName(person.lastName ?? '');
      setRole(person.role ?? '');
    } else {
      setFirstName('');
      setLastName('');
      setRole('');
    }
    setError(null);
  }, [open, person]);

  if (!open) return null;

  const isEditing = !!person;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim()) {
      setError('Le prénom est obligatoire.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        await peopleService.update(person!.id, {
          firstName: firstName.trim(),
          lastName: lastName.trim() || null,
          role: role.trim() || null,
        });
      } else {
        await peopleService.create({
          firstName: firstName.trim(),
          lastName: lastName.trim() || null,
          role: role.trim() || null,
        });
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
        className="relative w-full max-w-md rounded-2xl border shadow-2xl"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <div
          className="flex items-center justify-between border-b p-5"
          style={{ borderColor: colors.border }}
        >
          <div>
            <h2
              className="text-lg font-extrabold tracking-wide"
              style={{ color: colors.text }}
            >
              {isEditing ? 'Modifier la personne' : 'Nouvelle personne'}
            </h2>
            <p
              className="mt-0.5 text-xs"
              style={{ color: colors.textSecondary }}
            >
              {isEditing
                ? person!.fullName
                : 'Le nom complet est généré automatiquement.'}
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
          {/* Prénom */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-bold tracking-widest"
              style={{ color: colors.textMuted }}
            >
              PRÉNOM *
            </label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-10 rounded-lg border px-3 text-sm outline-none"
              style={{
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.border,
                color: colors.text,
              }}
              placeholder="Ali"
            />
          </div>

          {/* Nom */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-bold tracking-widest"
              style={{ color: colors.textMuted }}
            >
              NOM
            </label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-10 rounded-lg border px-3 text-sm outline-none"
              style={{
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.border,
                color: colors.text,
              }}
              placeholder="Diallo"
            />
          </div>

          {/* Rôle */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-bold tracking-widest"
              style={{ color: colors.textMuted }}
            >
              RÔLE (LIBRE)
            </label>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-10 rounded-lg border px-3 text-sm outline-none"
              style={{
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.border,
                color: colors.text,
              }}
              placeholder="Diacre, Pasteur, Choriste…"
            />
          </div>

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

          <div className="mt-2 flex justify-end gap-2">
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