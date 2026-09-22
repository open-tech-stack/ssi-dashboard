// components/users/UserFormDialog.tsx
'use client';

import { Check, Copy, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useTheme } from '@/components/providers/ThemeProvider';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/hooks/useConfirm';
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
  const toast = useToast();
  const confirm = useConfirm();

  const [role, setRole] = useState<UserRole>('MEMBRE');
  const [personId, setPersonId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
  const roleChanged = isEditing && user!.role !== role;

  // ------------------------------------------------------------------
  // Submit
  // ------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (role === 'MEMBRE' && !personId) {
      setError('Un utilisateur MEMBRE doit être lié à une personne.');
      return;
    }

    // ⚠️ Confirmation si changement de rôle
    if (roleChanged) {
      const fromLabel = user!.role === 'ADMIN' ? 'Administrateur' : 'Membre';
      const toLabel = role === 'ADMIN' ? 'Administrateur' : 'Membre';
      const isPromotion = role === 'ADMIN';

      const ok = await confirm({
        title: isPromotion ? 'Promouvoir cet utilisateur ?' : 'Rétrograder cet utilisateur ?',
        message: isPromotion
          ? `Cet utilisateur passera de « ${fromLabel} » à « ${toLabel} ». Il aura accès à TOUTES les fonctionnalités d'administration.`
          : `Cet utilisateur passera de « ${fromLabel} » à « ${toLabel} ». Il perdra l'accès à l'administration.`,
        variant: isPromotion ? 'warning' : 'danger',
        confirmLabel: isPromotion ? 'Promouvoir' : 'Rétrograder',
        requireInput: !isPromotion, // rétrograder = tape "CONFIRMER"
        confirmWord: !isPromotion ? 'CONFIRMER' : undefined,
      });
      if (!ok) return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        await usersService.update(user!.id, {
          role,
          personId: personId || null,
        });
        toast.success('Utilisateur modifié avec succès.', {
          title: 'Mise à jour',
        });
        onSuccess();
      } else {
        const created = await usersService.create({
          role,
          personId: personId || null,
        });
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
        {createdCode ? (
          /* ═══════════ ÉCRAN DE SUCCÈS ═══════════ */
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
          /* ═══════════ FORMULAIRE ═══════════ */
          <>
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
                    ? 'Vous pouvez modifier le rôle et la personne liée.'
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

                {/* Warning si changement de rôle */}
                {roleChanged && (
                  <div
                    className="mt-1 flex items-start gap-2 rounded-lg border p-2.5 text-[11px]"
                    style={{
                      backgroundColor:
                        (role === 'ADMIN' ? colors.warning : colors.danger) +
                        '11',
                      borderColor:
                        (role === 'ADMIN' ? colors.warning : colors.danger) +
                        '44',
                      color:
                        role === 'ADMIN' ? colors.warning : colors.danger,
                    }}
                  >
                    ⚠️{' '}
                    {role === 'ADMIN'
                      ? 'Promotion en administrateur : accès complet.'
                      : 'Rétrogradation : cet utilisateur perdra l\u2019accès administrateur.'}
                  </div>
                )}
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