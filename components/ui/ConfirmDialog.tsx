// components/ui/ConfirmDialog.tsx
'use client';

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { useTheme } from '@/components/providers/ThemeProvider';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
export type ConfirmVariant = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  variant?: ConfirmVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Texte exact que l'utilisateur doit taper pour confirmer (sécurité) */
  confirmWord?: string;
  /** Affiche un input pour taper confirmWord */
  requireInput?: boolean;
  /** Callback de confirmation (peut être async) */
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

// ------------------------------------------------------------------
// Config par variante
// ------------------------------------------------------------------
const VARIANT_META: Record<
  ConfirmVariant,
  { icon: LucideIcon; key: 'danger' | 'warning' | 'info' | 'success' }
> = {
  danger: { icon: AlertCircle, key: 'danger' },
  warning: { icon: AlertTriangle, key: 'warning' },
  info: { icon: AlertCircle, key: 'info' },
  success: { icon: CheckCircle2, key: 'success' },
};

// ------------------------------------------------------------------
// Composant
// ------------------------------------------------------------------
export default function ConfirmDialog({
  open,
  title,
  message,
  variant = 'danger',
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  confirmWord,
  requireInput = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');

  // Reset à l'ouverture
  useEffect(() => {
    if (open) {
      setInput('');
      setLoading(false);
    }
  }, [open]);

  // ESC pour fermer
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  const meta = VARIANT_META[variant];
  const Icon = meta.icon;
  const accent = colors[meta.key];

  const canConfirm = !requireInput || input.trim() === confirmWord;

  const handleConfirm = async () => {
    if (!canConfirm || loading) return;
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{
          animation: 'fade-in 150ms ease-out',
        }}
        onClick={() => !loading && onCancel()}
      />

      {/* Carte */}
      <div
        className="relative flex w-full max-w-md flex-col rounded-2xl border shadow-2xl"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          animation: 'confirm-in 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header avec icône */}
        <div className="flex items-start gap-4 p-5 pb-0">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: accent + '22' }}
          >
            <Icon className="h-6 w-6" style={{ color: accent }} />
          </div>

          <div className="flex-1 pt-1">
            <h2
              className="text-base font-black tracking-wide"
              style={{ color: colors.text }}
            >
              {title}
            </h2>
          </div>
        </div>

        {/* Message */}
        <div className="px-5 py-4">
          <p
            className="text-sm leading-relaxed"
            style={{ color: colors.textSecondary }}
          >
            {message}
          </p>

          {/* Input de confirmation */}
          {requireInput && confirmWord && (
            <div className="mt-4 flex flex-col gap-1.5">
              <label
                className="text-[10px] font-extrabold tracking-widest"
                style={{ color: colors.textMuted }}
              >
                TAPEZ « {confirmWord} » POUR CONFIRMER
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoFocus
                className="h-10 rounded-lg border px-3 text-sm font-mono outline-none transition"
                style={{
                  backgroundColor: colors.surfaceAlt,
                  borderColor: canConfirm ? accent + '66' : colors.border,
                  color: colors.text,
                }}
                placeholder={confirmWord}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div
          className="flex justify-end gap-2 border-t p-4"
          style={{ borderColor: colors.border }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="h-10 rounded-lg border px-4 text-sm font-bold transition hover:opacity-90 disabled:opacity-50"
            style={{
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: colors.surfaceAlt,
            }}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm || loading}
            className="flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-bold shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundColor: accent,
              color: '#FFFFFF',
            }}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}