// components/rappels/RappelDetailDialog.tsx
'use client';

import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ListChecks,
  ScrollText,
  X,
} from 'lucide-react';

import { useTheme } from '@/components/providers/ThemeProvider';
import { Rappel, RappelPriority, RAPPEL_PRIORITY_LABEL } from '@/types';


interface Props {
  open: boolean;
  rappel: Rappel | null;
  onClose: () => void;
}

function toneOf(priority: RappelPriority, colors: any): string {
  switch (priority) {
    case 'URGENT':
      return colors.danger;
    case 'IMPORTANT':
      return colors.warning;
    default:
      return colors.primary;
  }
}

export default function RappelDetailDialog({ open, rappel, onClose }: Props) {
  const { colors } = useTheme();
  if (!open || !rappel) return null;

  const tone = toneOf(rappel.priority, colors);

  const sortedElements = [...rappel.elements].sort(
    (a, b) => a.order - b.order,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div
        className="relative flex h-full max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border shadow-2xl"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          animation: 'confirm-in 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          className="flex shrink-0 items-start justify-between border-b p-5"
          style={{ borderColor: colors.border }}
        >
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {rappel.priority !== 'NORMAL' && (
                <span
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-black tracking-widest"
                  style={{
                    backgroundColor: tone + '22',
                    borderColor: tone + '55',
                    color: tone,
                  }}
                >
                  <AlertTriangle className="h-2.5 w-2.5" />
                  {RAPPEL_PRIORITY_LABEL[rappel.priority].toUpperCase()}
                </span>
              )}

              {rappel.notification && (
                <span
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-black tracking-widest"
                  style={{
                    backgroundColor: colors.success + '22',
                    borderColor: colors.success + '55',
                    color: colors.success,
                  }}
                >
                  <Bell className="h-2.5 w-2.5" />
                  NOTIFIÉ
                </span>
              )}
            </div>

            <h2
              className="mt-2 text-xl font-black"
              style={{ color: colors.text }}
            >
              {rappel.title}
            </h2>

            <p className="mt-1 text-xs" style={{ color: colors.textMuted }}>
              Créé le{' '}
              {new Date(rappel.createdAt).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition hover:opacity-80"
            style={{ borderColor: colors.border, color: colors.text }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex flex-col gap-4">
            {/* Banner supprimé */}
            {rappel.isDeleted && (
              <div
                className="flex items-center gap-2 rounded-lg border p-3"
                style={{
                  backgroundColor: colors.danger + '11',
                  borderColor: colors.danger + '44',
                  color: colors.danger,
                }}
              >
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span className="text-xs font-black tracking-widest">
                  CE RAPPEL A ÉTÉ SUPPRIMÉ
                </span>
                <span className="ml-auto text-[10px] font-semibold">
                  {rappel.deletedAt &&
                    new Date(rappel.deletedAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                </span>
              </div>
            )}

            {/* Éléments */}
            {sortedElements.length > 0 && (
              <div
                className="rounded-lg border p-4"
                style={{
                  backgroundColor: colors.surfaceAlt,
                  borderColor: colors.border,
                }}
              >
                <h3
                  className="mb-3 flex items-center gap-1.5 text-[10px] font-extrabold tracking-widest"
                  style={{ color: colors.textMuted }}
                >
                  <ListChecks className="h-3 w-3" />À RETENIR ({sortedElements.length})
                </h3>
                <ul className="flex flex-col gap-2">
                  {sortedElements.map((el) => (
                    <li key={el.id} className="flex items-start gap-2">
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: tone }}
                      />
                      <span
                        className="text-sm leading-relaxed"
                        style={{ color: colors.text }}
                      >
                        {el.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Détail */}
            {rappel.detail && (
              <div
                className="rounded-lg border p-4"
                style={{
                  backgroundColor: colors.primary + '11',
                  borderColor: colors.primary + '33',
                }}
              >
                <h3
                  className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold tracking-widest"
                  style={{ color: colors.primary }}
                >
                  <ScrollText className="h-3 w-3" />
                  DÉTAIL
                </h3>
                <p
                  className="whitespace-pre-line text-sm leading-relaxed"
                  style={{ color: colors.text }}
                >
                  {rappel.detail}
                </p>
              </div>
            )}

            {/* Vide */}
            {sortedElements.length === 0 && !rappel.detail && (
              <div
                className="rounded-lg border border-dashed p-6 text-center text-sm"
                style={{
                  borderColor: colors.border,
                  color: colors.textMuted,
                }}
              >
                Aucun élément ni détail à afficher.
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