// components/infos/InfoFormDialog.tsx
'use client';

import { Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useTheme } from '@/components/providers/ThemeProvider';
import { infosService } from '@/services/infos/infos.service';
import type { Info, InfoPriority } from '@/types/info.types';

interface Props {
  open: boolean;
  info: Info | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InfoFormDialog({
  open,
  info,
  onClose,
  onSuccess,
}: Props) {
  const { colors } = useTheme();

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [detail, setDetail] = useState('');
  const [priority, setPriority] = useState<InfoPriority>('NORMAL');
  const [notification, setNotification] = useState(false); // 🔔 AJOUT

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (info) {
      setTitle(info.title);
      setSummary(info.summary);
      setDetail(info.detail ?? '');
      setPriority(info.priority);
      setNotification(info.notification); // 🔔 AJOUT
    } else {
      setTitle('');
      setSummary('');
      setDetail('');
      setPriority('NORMAL');
      setNotification(false); // 🔔 AJOUT
    }
    setError(null);
  }, [open, info]);

  if (!open) return null;

  const isEditing = !!info;

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

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        summary: summary.trim(),
        detail: detail.trim() || null,
        priority,
        notification, // 🔔 AJOUT
      };

      if (isEditing) {
        await infosService.update(info!.id, payload);
      } else {
        await infosService.create(payload);
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
        className="relative w-full max-w-lg rounded-2xl border shadow-2xl"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
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
              {isEditing ? "Modifier l'info" : 'Nouvelle info'}
            </h2>
            <p
              className="mt-0.5 text-xs"
              style={{ color: colors.textSecondary }}
            >
              Titre + résumé + détail. C'est tout.
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
              placeholder="Répétition de la chorale déplacée"
            />
          </Field>

          <Field label="RÉSUMÉ *">
            <input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="h-10 rounded-lg border px-3 text-sm outline-none"
              style={{
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.border,
                color: colors.text,
              }}
              placeholder="La répétition de cette semaine aura lieu vendredi…"
            />
          </Field>

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
              placeholder="En raison d'une indisponibilité de la salle annexe…"
            />
          </Field>

          <Field label="PRIORITÉ">
            <div className="flex gap-2">
              {(['NORMAL', 'IMPORTANT', 'URGENT'] as InfoPriority[]).map((p) => {
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
                      backgroundColor: active ? tone + '22' : colors.surfaceAlt,
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
              })}
            </div>
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
                Les membres recevront une notification push et verront le badge
                s'incrémenter dans l'application mobile.
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