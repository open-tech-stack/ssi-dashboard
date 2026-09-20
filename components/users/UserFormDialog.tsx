// components/users/UserFormDialog.tsx
'use client';

import { Check, Copy, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useTheme } from '@/components/providers/ThemeProvider';
import { usersService } from '@/services/users/users.service';
import type { UserRole } from '@/types/auth.types';
import type { User } from '@/types/user.types';
import { Person } from '@/types/person.types';

interface Props {
  open: boolean;
  user: User | null;
  people: Person[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserFormDialog({
  open,
  user,
  people,
  onClose,
  onSuccess,
}: Props) {
  const { colors } = useTheme();

  const [role, setRole] = useState<UserRole>('MEMBRE');
  const [personId, setPersonId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Étape 2 : après création, on affiche le code généré
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Reset à l'ouverture
  useEffect(() => {
    if (!open) return;
    if (user) {
      setRole(user.role);
      setPersonId(user.personId ?? '');
    } else {
      setRole('MEMBRE');
      setPersonId('');
    }
    setError(null);
    setCreatedCode(null);
    setCopied(false);
  }, [open, user]);

  if (!open) return null;

  const isEditing = !!user;

  // ------------------------------------------------------------------
  // Submit (création ou édition)
  // ------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Règle backend : MEMBRE ⇒ personId obligatoire
    if (role === 'MEMBRE' && !personId) {
      setError('Un utilisateur MEMBRE doit être lié à une personne.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        await usersService.update(user!.id, {
          role,
          personId: personId || null,
        });
        onSuccess();
      } else {
        const created = await usersService.create({
          role,
          personId: personId || null,
        });
        // ⚠️ Le code n'apparaît qu'une seule fois (dans la réponse de création)
        setCreatedCode(created.code);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        "Une erreur est survenue lors de l'enregistrement.";
      setError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  // ------------------------------------------------------------------
  // Copier le code
  // ------------------------------------------------------------------
  const handleCopyCode = async () => {
    if (!createdCode) return;
    try {
      await navigator.clipboard.writeText(createdCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silencieux
    }
  };

  // ------------------------------------------------------------------
  // Fermer après création (déclenche le refresh de la liste)
  // ------------------------------------------------------------------
  const handleCloseAfterCreate = () => {
    setCreatedCode(null);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div
        className="relative w-full max-w-md rounded-2xl border shadow-2xl"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        {/* ------------------------------------------------------------
            ÉCRAN DE SUCCÈS (après création)
        ------------------------------------------------------------ */}
        {createdCode ? (
          <div className="flex flex-col gap-5 p-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{
                  backgroundColor: colors.success + '22',
                  color: colors.success,
                }}
              >
                <Check className="h-6 w-6" />
              </div>
              <h2
                className="text-lg font-extrabold tracking-wide"
                style={{ color: colors.text }}
              >
                Utilisateur créé
              </h2>
              <p className="text-xs" style={{ color: colors.textSecondary }}>
                Transmettez ce code à l&apos;utilisateur. Il ne sera plus
                affiché ensuite.
              </p>
            </div>

            {/* Code */}
            <div
              className="flex items-center justify-between gap-3 rounded-xl border-2 p-4"
              style={{
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.primary + '55',
              }}
            >
              <span
                className="font-mono text-xl font-black tracking-[0.3em]"
                style={{ color: colors.primary }}
              >
                {createdCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex h-9 w-9 items-center justify-center rounded-lg border transition hover:opacity-80"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  color: copied ? colors.success : colors.text,
                }}
                aria-label="Copier le code"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Warning */}
            <div
              className="rounded-lg border p-3 text-xs"
              style={{
                backgroundColor: colors.warning + '11',
                borderColor: colors.warning + '44',
                color: colors.warning,
              }}
            >
              ⚠️ Ce code est le <b>seul moyen de connexion</b> de cet
              utilisateur. Notez-le maintenant, il ne sera plus visible dans
              l&apos;interface.
            </div>

            {/* Action */}
            <button
              type="button"
              onClick={handleCloseAfterCreate}
              className="h-10 w-full rounded-lg text-sm font-bold shadow-md transition hover:opacity-90"
              style={{
                backgroundColor: colors.primary,
                color: colors.onPrimary,
              }}
            >
              J&apos;ai noté le code
            </button>
          </div>
        ) : (
          /* ------------------------------------------------------------
             FORMULAIRE (création / édition)
          ------------------------------------------------------------ */
          <>
            {/* Header */}
            <div
              className="flex items-center justify-between border-b p-5"
              style={{ borderColor: colors.border }}
            >
              <div>
                <h2
                  className="text-lg font-extrabold tracking-wide"
                  style={{ color: colors.text }}
                >
                  {isEditing
                    ? 'Modifier l\u2019utilisateur'
                    : 'Nouvel utilisateur'}
                </h2>
                <p
                  className="mt-0.5 text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  {isEditing
                    ? `Code : ${user!.code}`
                    : 'Un code à 10 caractères sera généré automatiquement.'}
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
              {/* Rôle */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-bold tracking-widest"
                  style={{ color: colors.textMuted }}
                >
                  RÔLE
                </label>
                <div className="flex gap-2">
                  {(['MEMBRE', 'ADMIN'] as UserRole[]).map((r) => {
                    const active = role === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className="flex h-10 flex-1 items-center justify-center rounded-lg border-2 text-sm font-bold transition"
                        style={{
                          backgroundColor: active
                            ? colors.primary + '22'
                            : colors.surfaceAlt,
                          borderColor: active
                            ? colors.primary
                            : colors.border,
                          color: active
                            ? colors.primary
                            : colors.textSecondary,
                        }}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Personne liée */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-bold tracking-widest"
                  style={{ color: colors.textMuted }}
                >
                  PERSONNE {role === 'MEMBRE' && '*'}
                </label>
                <select
                  value={personId}
                  onChange={(e) => setPersonId(e.target.value)}
                  className="h-10 rounded-lg border px-3 text-sm outline-none"
                  style={{
                    backgroundColor: colors.surfaceAlt,
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                >
                  <option value="">
                    {role === 'MEMBRE'
                      ? '— Sélectionner une personne —'
                      : '— Aucune —'}
                  </option>
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName}
                    </option>
                  ))}
                </select>
                {role === 'MEMBRE' && (
                  <p
                    className="text-[11px]"
                    style={{ color: colors.textMuted }}
                  >
                    Un utilisateur MEMBRE doit être lié à une personne.
                  </p>
                )}
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

              {/* Boutons */}
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
          </>
        )}
      </div>
    </div>
  );
}