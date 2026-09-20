// components/programmes/ProgrammeDetailDialog.tsx
'use client';

import { BookOpen, Calendar, Clock, MapPin, X } from 'lucide-react';

import { useTheme } from '@/components/providers/ThemeProvider';
import type { Programme } from '@/types/programme.types';
import { PROGRAMME_KIND_LABEL } from '@/types/programme.types';

interface Props {
  open: boolean;
  programme: Programme | null;
  onClose: () => void;
}

export default function ProgrammeDetailDialog({
  open,
  programme,
  onClose,
}: Props) {
  const { colors } = useTheme();
  if (!open || !programme) return null;

  const isDimanche = programme.kind === 'CULTE_DIMANCHE';
  const sortedSections = [...programme.sections].sort(
    (a, b) => a.order - b.order,
  );

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
            <span
              className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-black tracking-widest"
              style={{
                backgroundColor: colors.primary + '22',
                borderColor: colors.primary + '55',
                color: colors.primary,
              }}
            >
              {PROGRAMME_KIND_LABEL[programme.kind].toUpperCase()}
            </span>
            <h2
              className="mt-2 text-xl font-black"
              style={{ color: colors.text }}
            >
              {programme.title}
            </h2>
            <p
              className="mt-1 text-sm"
              style={{ color: colors.textSecondary }}
            >
              {programme.summary}
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
            {/* Meta */}
            <div
              className="flex flex-col gap-2 rounded-lg border p-3"
              style={{
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.border,
              }}
            >
              <MetaRow
                icon={<Calendar className="h-3.5 w-3.5" />}
                text={fmtDate(programme.startsAt)}
                colors={colors}
              />
              {(programme.startsAt || programme.endsAt) && (
                <MetaRow
                  icon={<Clock className="h-3.5 w-3.5" />}
                  text={`${fmtTime(programme.startsAt)} – ${fmtTime(programme.endsAt)}`}
                  colors={colors}
                />
              )}
              {programme.location && (
                <MetaRow
                  icon={<MapPin className="h-3.5 w-3.5" />}
                  text={programme.location}
                  colors={colors}
                />
              )}
            </div>

            {/* Sainte-Cène */}
            {isDimanche && programme.hasHolyCommunion !== null && (
              <div
                className="flex gap-3 rounded-lg border p-3"
                style={{
                  backgroundColor:
                    (programme.hasHolyCommunion
                      ? colors.success
                      : colors.textMuted) + '11',
                  borderColor:
                    (programme.hasHolyCommunion
                      ? colors.success
                      : colors.textMuted) + '44',
                }}
              >
                <BookOpen
                  className="h-5 w-5 shrink-0"
                  style={{
                    color: programme.hasHolyCommunion
                      ? colors.success
                      : colors.textMuted,
                  }}
                />
                <div>
                  <p
                    className="text-xs font-black tracking-widest"
                    style={{
                      color: programme.hasHolyCommunion
                        ? colors.success
                        : colors.textMuted,
                    }}
                  >
                    SAINTE-CÈNE · {programme.hasHolyCommunion ? 'OUI' : 'NON'}
                  </p>
                  {programme.holyCommunionMessage && (
                    <p
                      className="mt-1 text-sm"
                      style={{ color: colors.text }}
                    >
                      {programme.holyCommunionMessage}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Déroulement */}
            <div>
              <h3
                className="mb-2 text-[10px] font-extrabold tracking-widest"
                style={{ color: colors.textMuted }}
              >
                DÉROULEMENT
              </h3>
              <div className="flex flex-col gap-2">
                {sortedSections.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-col gap-1 rounded-lg border p-3"
                    style={{
                      backgroundColor: colors.surfaceAlt,
                      borderColor: colors.border,
                    }}
                  >
                    <span
                      className="text-xs font-extrabold tracking-wide"
                      style={{ color: colors.text }}
                    >
                      {s.label}
                    </span>

                    {s.persons.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {s.persons.map((p) => (
                          <span
                            key={p.id}
                            className="rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                            style={{
                              backgroundColor: colors.primary + '11',
                              borderColor: colors.primary + '33',
                              color: colors.primary,
                            }}
                          >
                            {p.fullName}
                          </span>
                        ))}
                      </div>
                    )}

                    {s.persons.length === 0 && s.group && (
                      <span
                        className="inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-bold"
                        style={{
                          backgroundColor: colors.primary + '22',
                          borderColor: colors.primary + '55',
                          color: colors.primary,
                        }}
                      >
                        🎵 {s.group.name}
                      </span>
                    )}

                    {s.persons.length === 0 && !s.group && s.value && (
                      <span
                        className="text-sm"
                        style={{ color: colors.textSecondary }}
                      >
                        {s.value}
                      </span>
                    )}

                    {s.persons.length === 0 && !s.group && !s.value && (
                      <span
                        className="text-xs italic"
                        style={{ color: colors.textMuted }}
                      >
                        —
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {programme.notes && (
              <div
                className="rounded-lg border p-3"
                style={{
                  backgroundColor: colors.primary + '11',
                  borderColor: colors.primary + '33',
                }}
              >
                <p className="text-sm" style={{ color: colors.text }}>
                  {programme.notes}
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

// ------------------------------------------------------------------
// Helpers UI
// ------------------------------------------------------------------
function MetaRow({
  icon,
  text,
  colors,
}: {
  icon: React.ReactNode;
  text: string;
  colors: any;
}) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ color: colors.textMuted }}>{icon}</span>
      <span className="text-sm" style={{ color: colors.textSecondary }}>
        {text}
      </span>
    </div>
  );
}

const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTHS = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
];

function fmtDate(iso: string | null): string {
  if (!iso) return 'Date à préciser';
  const d = new Date(iso);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
function fmtTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}h${d
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
}