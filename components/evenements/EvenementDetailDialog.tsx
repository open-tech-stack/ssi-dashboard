// components/evenements/EvenementDetailDialog.tsx
'use client';

import {
  AlertTriangle,
  Bell,
  Calendar,
  Clock,
  MapPin,
  ScrollText,
  User,
  Users,
  X,
} from 'lucide-react';

import { useTheme } from '@/components/providers/ThemeProvider';
import type { Evenement, PublicCible } from '@/types/evenement.types';
import {
  EVENEMENT_KIND_LABEL,
  PUBLIC_CIBLE_LABEL,
} from '@/types/evenement.types';

interface Props {
  open: boolean;
  evenement: Evenement | null;
  onClose: () => void;
}

export default function EvenementDetailDialog({
  open,
  evenement,
  onClose,
}: Props) {
  const { colors } = useTheme();
  if (!open || !evenement) return null;

  const e = evenement;

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
        {/* ═══════════ HEADER ═══════════ */}
        <div
          className="flex shrink-0 items-start justify-between border-b p-5"
          style={{ borderColor: colors.border }}
        >
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-black tracking-widest"
                style={{
                  backgroundColor: colors.primary + '22',
                  borderColor: colors.primary + '55',
                  color: colors.primary,
                }}
              >
                {EVENEMENT_KIND_LABEL[e.kind].toUpperCase()}
              </span>

              {e.notification && (
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
              {e.title}
            </h2>
            <p className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
              {e.summary}
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

        {/* ═══════════ BODY ═══════════ */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex flex-col gap-4">
            {/* Banner supprimé */}
            {e.isDeleted && (
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
                  CET ÉVÉNEMENT A ÉTÉ SUPPRIMÉ
                </span>
                <span className="ml-auto text-[10px] font-semibold">
                  {e.deletedAt &&
                    new Date(e.deletedAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                </span>
              </div>
            )}

            {/* Infos principales */}
            <div
              className="flex flex-col gap-3 rounded-lg border p-4"
              style={{
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.border,
              }}
            >
              {/* MARIAGE */}
              {e.kind === 'MARIAGE' && (
                <>
                  <MetaRow
                    icon={<Users className="h-4 w-4" />}
                    label="MARIÉS"
                    text={`${e.groomName ?? '—'}  &  ${e.brideName ?? '—'}`}
                    colors={colors}
                  />
                  {e.townHallPlace && (
                    <MetaRow
                      icon={<MapPin className="h-4 w-4" />}
                      label="MAIRIE"
                      text={`${e.townHallTime ?? ''} · ${e.townHallPlace}`}
                      colors={colors}
                    />
                  )}
                  {e.ceremonyPlace && (
                    <MetaRow
                      icon={<MapPin className="h-4 w-4" />}
                      label="CÉRÉMONIE"
                      text={`${e.ceremonyTime ?? ''} · ${e.ceremonyPlace}`}
                      colors={colors}
                    />
                  )}
                  {e.receptionPlace && (
                    <MetaRow
                      icon={<MapPin className="h-4 w-4" />}
                      label="RÉCEPTION"
                      text={e.receptionPlace}
                      colors={colors}
                    />
                  )}
                </>
              )}

              {/* CAMP / SORTIE / JOURNEE */}
              {(e.kind === 'CAMP' ||
                e.kind === 'SORTIE' ||
                e.kind === 'JOURNEE') &&
                e.audience && (
                  <MetaRow
                    icon={<Users className="h-4 w-4" />}
                    label="POUR"
                    text={
                      e.audience === 'AUTRE' && e.audienceOther
                        ? e.audienceOther
                        : PUBLIC_CIBLE_LABEL[e.audience as PublicCible]
                    }
                    colors={colors}
                  />
                )}

              {/* CONFERENCE */}
              {e.kind === 'CONFERENCE' && e.speaker && (
                <MetaRow
                  icon={<User className="h-4 w-4" />}
                  label="CONFÉRENCIER"
                  text={e.speaker}
                  colors={colors}
                />
              )}

              {/* FORMATION */}
              {e.kind === 'FORMATION' && e.trainer && (
                <MetaRow
                  icon={<User className="h-4 w-4" />}
                  label="FORMATEUR"
                  text={e.trainer}
                  colors={colors}
                />
              )}

              {/* Thème */}
              {e.theme && (
                <MetaRow
                  icon={<ScrollText className="h-4 w-4" />}
                  label="THÈME"
                  text={e.theme}
                  colors={colors}
                />
              )}

              {/* Dates */}
              <MetaRow
                icon={<Calendar className="h-4 w-4" />}
                label="DATE"
                text={fmtDate(e.startsAt)}
                colors={colors}
              />

              {(e.startsAt || e.endsAt) && (
                <MetaRow
                  icon={<Clock className="h-4 w-4" />}
                  label="HEURE"
                  text={`${fmtTime(e.startsAt)} – ${fmtTime(e.endsAt)}`}
                  colors={colors}
                />
              )}

              {e.location && (
                <MetaRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="LIEU"
                  text={e.location}
                  colors={colors}
                />
              )}
            </div>

            {/* Détail long */}
            {e.detail && (
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
                  DÉTAILS
                </h3>
                <p
                  className="whitespace-pre-line text-sm leading-relaxed"
                  style={{ color: colors.text }}
                >
                  {e.detail}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════ FOOTER ═══════════ */}
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
// Helpers
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