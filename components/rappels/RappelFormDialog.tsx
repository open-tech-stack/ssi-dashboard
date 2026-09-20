// components/rappels/RappelFormDialog.tsx
'use client';

import { GripVertical, Loader2, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useTheme } from '@/components/providers/ThemeProvider';
import { rappelsService } from '@/services/rappels/rappels.service';
import type { Rappel, RappelPriority } from '@/types/rappel.types';

interface Props {
  open: boolean;
  rappel: Rappel | null;
  onClose: () => void;
  onSuccess: () => void;
}

/** Item local du formulaire (avant envoi au serveur) */
interface LocalElement {
  text: string;
}

export default function RappelFormDialog({
  open,
  rappel,
  onClose,
  onSuccess,
}: Props) {
  const { colors } = useTheme();

  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [priority, setPriority] = useState<RappelPriority>('NORMAL');
  const [notification, setNotification] = useState(false); // 🔔 AJOUT
  const [elements, setElements] = useState<LocalElement[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (rappel) {
      setTitle(rappel.title);
      setDetail(rappel.detail ?? '');
      setPriority(rappel.priority);
      setNotification(rappel.notification); // 🔔 AJOUT
      setElements(
        [...rappel.elements]
          .sort((a, b) => a.order - b.order)
          .map((el) => ({ text: el.text })),
      );
    } else {
      setTitle('');
      setDetail('');
      setPriority('NORMAL');
      setNotification(false); // 🔔 AJOUT
      setElements([{ text: '' }]);
    }
    setError(null);
  }, [open, rappel]);

  if (!open) return null;

  const isEditing = !!rappel;

  // ---- Actions éléments ----
  const addElement = () => setElements((prev) => [...prev, { text: '' }]);

  const updateElement = (index: number, text: string) => {
    setElements((prev) => prev.map((el, i) => (i === index ? { text } : el)));
  };

  const removeElement = (index: number) => {
    setElements((prev) => prev.filter((_, i) => i !== index));
  };

  const moveElement = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= elements.length) return;
    setElements((prev) => {
      const copy = [...prev];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
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

    // On ne garde que les éléments non vides
    const cleanElements = elements
      .map((el) => el.text.trim())
      .filter((t) => t.length > 0)
      .map((text, i) => ({ text, order: i }));

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        detail: detail.trim() || null,
        priority,
        notification, // 🔔 AJOUT
        elements: cleanElements,
      };

      if (isEditing) {
        await rappelsService.update(rappel!.id, payload);
      } else {
        await rappelsService.create(payload);
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
        className="relative flex h-full max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border shadow-2xl"
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
              {isEditing ? 'Modifier le rappel' : 'Nouveau rappel'}
            </h2>
            <p
              className="mt-0.5 text-xs"
              style={{ color: colors.textSecondary }}
            >
              Ajoute une liste d'éléments à retenir.
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
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-5">
            <div className="flex flex-col gap-4">
              <Field label="TITRE *">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-10 rounded-lg border px-3 text-sm outline-none"
                  style={{
                    backgroundColor: colors.surfaceAlt,
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                  placeholder="Rappels du culte de dimanche"
                />
              </Field>

              <Field label="PRIORITÉ">
                <div className="flex gap-2">
                  {(['NORMAL', 'IMPORTANT', 'URGENT'] as RappelPriority[]).map(
                    (p) => {
                      const active = priority === p;
                      const tone =
                        p === 'URGENT'
                          ? colors.danger
                          : p === 'IMPORTANT'
                          ? colors.warning
                          : colors.textMuted;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className="flex h-10 flex-1 items-center justify-center rounded-lg border-2 text-xs font-bold transition"
                          style={{
                            backgroundColor: active
                              ? tone + '22'
                              : colors.surfaceAlt,
                            borderColor: active ? tone : colors.border,
                            color: active ? tone : colors.textSecondary,
                          }}
                        >
                          {p === 'NORMAL'
                            ? 'Normale'
                            : p === 'IMPORTANT'
                            ? 'Importante'
                            : 'Urgente'}
                        </button>
                      );
                    },
                  )}
                </div>
              </Field>

              {/* Éléments */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label
                    className="text-[10px] font-extrabold tracking-widest"
                    style={{ color: colors.textMuted }}
                  >
                    ÉLÉMENTS À RETENIR ({elements.length})
                  </label>
                  <button
                    type="button"
                    onClick={addElement}
                    className="flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition"
                    style={{
                      borderColor: colors.primary + '55',
                      color: colors.primary,
                      backgroundColor: colors.primary + '11',
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Ajouter
                  </button>
                </div>

                {elements.length === 0 && (
                  <div
                    className="rounded-lg border border-dashed p-4 text-center text-xs"
                    style={{
                      borderColor: colors.border,
                      color: colors.textMuted,
                    }}
                  >
                    Aucun élément. Clique sur "Ajouter".
                  </div>
                )}

                {elements.map((el, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg border p-2"
                    style={{
                      backgroundColor: colors.surfaceAlt,
                      borderColor: colors.border,
                    }}
                  >
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        disabled={i === 0}
                        onClick={() => moveElement(i, -1)}
                        className="text-[9px] leading-none disabled:opacity-30"
                        style={{ color: colors.textMuted }}
                        title="Monter"
                      >
                        ▲
                      </button>
                      <GripVertical
                        className="h-3 w-3"
                        style={{ color: colors.textMuted }}
                      />
                      <button
                        type="button"
                        disabled={i === elements.length - 1}
                        onClick={() => moveElement(i, 1)}
                        className="text-[9px] leading-none disabled:opacity-30"
                        style={{ color: colors.textMuted }}
                        title="Descendre"
                      >
                        ▼
                      </button>
                    </div>

                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-black"
                      style={{
                        backgroundColor: colors.primary + '22',
                        color: colors.primary,
                      }}
                    >
                      {i + 1}
                    </span>

                    <input
                      value={el.text}
                      onChange={(e) => updateElement(i, e.target.value)}
                      placeholder="Apporter sa Bible et un cahier"
                      className="h-9 flex-1 rounded-md border px-2 text-sm outline-none"
                      style={{
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.text,
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => removeElement(i)}
                      className="flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-red-500/10 hover:text-red-500"
                      style={{ color: colors.textMuted }}
                      title="Supprimer cet élément"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <Field label="DÉTAIL (optionnel)">
                <textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  rows={3}
                  className="rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{
                    backgroundColor: colors.surfaceAlt,
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                  placeholder="Information complémentaire…"
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