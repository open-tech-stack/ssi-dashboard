// components/prieres/PriereDetailDialog.tsx
'use client';

import {
  AlertTriangle,
  Bell,
  Calendar,
  MapPin,
  ScrollText,
  X,
} from 'lucide-react';

import { useTheme } from '@/components/providers/ThemeProvider';
import { Priere, PrierePriority, PRIERE_PRIORITY_LABEL } from '@/types';


interface Props {
  open: boolean;
  priere: Priere | null;
  onClose: () => void;
}

function toneOf(priority: PrierePriority, colors: any): string {
  switch (priority) {
    case 'URGENT':
      return colors.danger;
    case 'IMPORTANT':
      return colors.warning;
    default:
      return colors.primary;
  }
}

export default function PriereDetailDialog({ open, priere, onClose }: Props) {
  const { colors } = useTheme();
  if (!open || !priere) return null;

  const tone = toneOf(priere.priority, colors);

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
              {priere.priority !== 'NORMAL' && (
                <span
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-black tracking-widest"
                  style={{
                    backgroundColor: tone + '22',
                    borderColor: tone + '55',
                    color: tone,
                  }}
                >
                  <AlertTriangle className="h-2.5 w-2.5" />
                  {PRIERE_PRIORITY_LABEL[priere.priority].toUpperCase()}
                </span>
              )}

              {priere.notification && (
                <span
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-black tracking-widest"
                  style={{
                    backgroundColor: colors.success + '22',
                    borderColor: colors.success + '55',
                    color: colors.success,
                  }}
                >
                  <Bell className="h-2.5 w-2.5" />
                  NOTIFIÉE
                </span>
              )}
            </div>

            <h2
              className="mt-2 text-xl font-black"
              style={{ color: colors.text }}
            >
              {priere.title}
            </h2>
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
            {priere.isDeleted && (
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
                  CETTE PRIÈRE A ÉTÉ SUPPRIMÉE
                </span>
                <span className="ml-auto text-[10px] font-semibold">
                  {priere.deletedAt &&
                    new Date(priere.deletedAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                </span>
              </div>
            )}

            {/* Meta */}
            {(priere.date || priere.location) && (
              <div
                className="flex flex-col gap-3 rounded-lg border p-4"
                style={{
                  backgroundColor: colors.surfaceAlt,
                  borderColor: colors.border,
                }}
              >
                {priere.date && (
                  <MetaRow
                    icon={<Calendar className="h-4 w-4" />}
                    label="DATE"
                    text={fmtDate(priere.date)}
                    colors={colors}
                  />
                )}
                {priere.location && (
                  <MetaRow
                    icon={<MapPin className="h-4 w-4" />}
                    label="LIEU"
                    text={priere.location}
                    colors={colors}
                  />
                )}
              </div>
            )}

            {/* Détail */}
            {priere.detail && (
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
                  {priere.detail}
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

// ------------------------------------------------------------------
function MetaRow({
  icon,
  label,
  text,
  colors,
}: {
  icon: React.ReactNode;
  label?: string;
  text: string;
  colors: any;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
        style={{
          backgroundColor: colors.surface,
          color: colors.textMuted,
        }}
      >
        {icon}
      </span>
      <div className="flex flex-1 flex-col">
        {label && (
          <span
            className="text-[10px] font-extrabold tracking-widest"
            style={{ color: colors.textMuted }}
          >
            {label}
          </span>
        )}
        <span className="text-sm" style={{ color: colors.text }}>
          {text}
        </span>
      </div>
    </div>
  );
}

const DAYS = [
  'Dimanche',
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
];
const MONTHS = [
  'janv.',
  'févr.',
  'mars',
  'avr.',
  'mai',
  'juin',
  'juil.',
  'août',
  'sept.',
  'oct.',
  'nov.',
  'déc.',
];

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} · ${d
    .getHours()
    .toString()
    .padStart(2, '0')}h${d.getMinutes().toString().padStart(2, '0')}`;
}