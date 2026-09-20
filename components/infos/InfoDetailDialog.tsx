// components/infos/InfoDetailDialog.tsx
'use client';

import { X } from 'lucide-react';

import { useTheme } from '@/components/providers/ThemeProvider';
import type { Info } from '@/types/info.types';

interface Props {
  open: boolean;
  info: Info | null;
  onClose: () => void;
}

export default function InfoDetailDialog({ open, info, onClose }: Props) {
  const { colors } = useTheme();
  if (!open || !info) return null;

  const tone =
    info.priority === 'URGENT'
      ? colors.danger
      : info.priority === 'IMPORTANT'
      ? colors.warning
      : colors.primary;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div
        className="relative flex h-full max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border shadow-2xl"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        {/* Header */}
        <div
          className="flex shrink-0 items-start justify-between border-b p-5"
          style={{ borderColor: colors.border }}
        >
          <div className="flex-1">
            {info.priority !== 'NORMAL' && (
              <span
                className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-black tracking-widest"
                style={{
                  backgroundColor: tone + '22',
                  borderColor: tone + '55',
                  color: tone,
                }}
              >
                {info.priority}
              </span>
            )}
            <h2
              className="mt-2 text-xl font-black"
              style={{ color: colors.text }}
            >
              {info.title}
            </h2>
            <p
              className="mt-1 text-xs"
              style={{ color: colors.textMuted }}
            >
              Publiée le{' '}
              {new Date(info.createdAt).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
            style={{ borderColor: colors.border, color: colors.text }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex flex-col gap-4">
            {/* Résumé */}
            <div
              className="rounded-lg border p-4"
              style={{
                backgroundColor: colors.primary + '11',
                borderColor: colors.primary + '33',
              }}
            >
              <h3
                className="mb-1.5 text-[10px] font-extrabold tracking-widest"
                style={{ color: colors.primary }}
              >
                RÉSUMÉ
              </h3>
              <p
                className="text-sm font-semibold leading-relaxed"
                style={{ color: colors.text }}
              >
                {info.summary}
              </p>
            </div>

            {/* Détail */}
            {info.detail && (
              <div>
                <h3
                  className="mb-2 text-[10px] font-extrabold tracking-widest"
                  style={{ color: colors.textMuted }}
                >
                  DÉTAIL
                </h3>
                <p
                  className="whitespace-pre-line text-sm leading-relaxed"
                  style={{ color: colors.text }}
                >
                  {info.detail}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex shrink-0 justify-end border-t p-4"
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
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}