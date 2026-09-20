// components/groups/GroupFormDialog.tsx
'use client';

import { Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useTheme } from '@/components/providers/ThemeProvider';
import { groupsService } from '@/services/groups/groups.service';
import type { Group } from '@/types/group.types';

interface Props {
  open: boolean;
  group: Group | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GroupFormDialog({
  open,
  group,
  onClose,
  onSuccess,
}: Props) {
  const { colors } = useTheme();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (group) {
      setName(group.name);
      setDescription(group.description ?? '');
    } else {
      setName('');
      setDescription('');
    }
    setError(null);
  }, [open, group]);

  if (!open) return null;

  const isEditing = !!group;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Le nom du groupe est obligatoire.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        await groupsService.update(group!.id, {
          name: name.trim(),
          description: description.trim() || null,
        });
      } else {
        await groupsService.create({
          name: name.trim(),
          description: description.trim() || null,
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
              {isEditing ? 'Modifier le groupe' : 'Nouveau groupe'}
            </h2>
            <p
              className="mt-0.5 text-xs"
              style={{ color: colors.textSecondary }}
            >
              {isEditing
                ? group!.name
                : 'Ex : Groupe musical, Équipe de protocole…'}
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
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-bold tracking-widest"
              style={{ color: colors.textMuted }}
            >
              NOM *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-lg border px-3 text-sm outline-none"
              style={{
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.border,
                color: colors.text,
              }}
              placeholder="Groupe musical"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-bold tracking-widest"
              style={{ color: colors.textMuted }}
            >
              DESCRIPTION
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="rounded-lg border px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.border,
                color: colors.text,
              }}
              placeholder="Chorale et instrumentistes…"
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