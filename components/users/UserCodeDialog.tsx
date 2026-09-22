// components/users/UserCodeDialog.tsx
'use client';

import { Check, Copy, KeyRound, X } from 'lucide-react';
import { useState } from 'react';

import { useTheme } from '@/components/providers/ThemeProvider';
import type { User } from '@/types/user.types';

interface Props {
  open: boolean;
  user: User | null;
  personName?: string | null;
  onClose: () => void;
}

export default function UserCodeDialog({
  open,
  user,
  personName,
  onClose,
}: Props) {
  const { colors } = useTheme();
  const [copied, setCopied] = useState(false);

  if (!open || !user) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(user.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silencieux
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div
        className="relative w-full max-w-md rounded-2xl border shadow-2xl"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          animation: 'confirm-in 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b p-5"
          style={{ borderColor: colors.border }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                backgroundColor: colors.primary + '22',
                color: colors.primary,
              }}
            >
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2
                className="text-base font-extrabold tracking-wide"
                style={{ color: colors.text }}
              >
                Code d&apos;accès
              </h2>
              <p
                className="text-xs"
                style={{ color: colors.textSecondary }}
              >
                {personName ?? `Utilisateur ${user.id.slice(0, 8)}…`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border transition hover:opacity-80"
            style={{ borderColor: colors.border, color: colors.text }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 p-5">
          {/* Code */}
          <div
            className="flex items-center justify-between gap-3 rounded-xl border-2 p-4"
            style={{
              backgroundColor: colors.surfaceAlt,
              borderColor: colors.primary + '55',
            }}
          >
            <span
              className="font-mono text-lg font-black tracking-[0.25em]"
              style={{ color: colors.primary }}
            >
              {user.code}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition hover:opacity-80"
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

          {/* Rôle */}
          <div
            className="flex items-center justify-between rounded-lg border p-3"
            style={{
              backgroundColor: colors.surfaceAlt,
              borderColor: colors.border,
            }}
          >
            <span
              className="text-[10px] font-extrabold tracking-widest"
              style={{ color: colors.textMuted }}
            >
              RÔLE
            </span>
            <span
              className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-black tracking-widest"
              style={{
                backgroundColor:
                  user.role === 'ADMIN'
                    ? colors.primary + '22'
                    : colors.surface,
                borderColor:
                  user.role === 'ADMIN'
                    ? colors.primary + '55'
                    : colors.border,
                color:
                  user.role === 'ADMIN'
                    ? colors.primary
                    : colors.textSecondary,
              }}
            >
              {user.role}
            </span>
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
            utilisateur. Ne le partagez qu&apos;avec la personne concernée.
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex justify-end border-t p-4"
          style={{ borderColor: colors.border }}
        >
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border px-4 text-sm font-bold transition hover:opacity-90"
            style={{
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: colors.surfaceAlt,
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}