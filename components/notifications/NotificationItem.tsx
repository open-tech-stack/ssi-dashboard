// components/notifications/NotificationItem.tsx
'use client';

import {
  Bell,
  CalendarDays,
  Check,
  Heart,
  Info as InfoIcon,
  Megaphone,
  PartyPopper,
  RotateCcw,
  Skull,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { useTheme } from '@/components/providers/ThemeProvider';
import type {
  Notification,
  NotificationType,
} from '@/types/notification.types';
import { cn } from '@/lib/utils';

interface Props {
  notification: Notification;
  onMarkRead?: (id: string) => void;
  onSoftDelete?: (n: Notification) => void;
  onRestore?: (n: Notification) => void;
  onHardDelete?: (n: Notification) => void;
  isAdmin?: boolean;

  // ⬇️ NOUVEAU — sélection multiple
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}

// ------------------------------------------------------------------
// Icône + couleur par type
// ------------------------------------------------------------------
function iconOf(type: NotificationType): LucideIcon {
  switch (type) {
    case 'PROGRAMME':
      return CalendarDays;
    case 'EVENEMENT':
      return PartyPopper;
    case 'INFO':
      return Megaphone;
    case 'PRIERE':
      return Heart;
    case 'RAPPEL':
      return Bell;
    case 'GENERIC':
    default:
      return InfoIcon;
  }
}

function toneOf(
  type: NotificationType,
  colors: ReturnType<typeof useTheme>['colors'],
): string {
  switch (type) {
    case 'PROGRAMME':
      return colors.primary;
    case 'EVENEMENT':
      return colors.info;
    case 'INFO':
      return colors.primary;
    case 'PRIERE':
      return '#A855F7';
    case 'RAPPEL':
      return colors.warning;
    case 'GENERIC':
    default:
      return colors.textSecondary;
  }
}

// ------------------------------------------------------------------
// Deep link mobile → dashboard web
// ------------------------------------------------------------------
function resolveDashboardRoute(linkTo: string): string | null {
  const segment = linkTo.split('/').filter(Boolean)[0];
  switch (segment) {
    case 'programmes':
      return '/programmes';
    case 'evenements':
      return '/evenements';
    case 'infos':
      return '/infos';
    case 'prieres':
      return '/prieres';
    case 'rappels':
      return '/rappels';
    default:
      return null;
  }
}

// ------------------------------------------------------------------
// Date relative
// ------------------------------------------------------------------
const MONTHS_SHORT = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
];

function relativeDate(iso: string): string {
  const diff = Date.now() - Date.parse(iso);
  const MIN = 60 * 1000;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;

  if (diff < MIN) return "à l'instant";
  if (diff < HOUR) return `il y a ${Math.floor(diff / MIN)} min`;
  if (diff < DAY) return `il y a ${Math.floor(diff / HOUR)} h`;
  if (diff < 2 * DAY) return 'hier';
  if (diff < 7 * DAY) return `il y a ${Math.floor(diff / DAY)} j`;

  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

// ------------------------------------------------------------------
// Composant
// ------------------------------------------------------------------
export default function NotificationItem({
  notification,
  onMarkRead,
  onSoftDelete,
  onRestore,
  onHardDelete,
  isAdmin = false,
  selectable = false,
  selected = false,
  onToggleSelect,
}: Props) {
  const { colors } = useTheme();
  const router = useRouter();

  const [hovered, setHovered] = useState(false);

  const Icon = iconOf(notification.type);
  const tone = toneOf(notification.type, colors);
  const isUnread = !notification.read;
  const isDeleted = notification.isDeleted;

  const handleClick = () => {
    if (isDeleted) return;

    if (isUnread && onMarkRead) {
      onMarkRead(notification.id);
    }
    if (notification.linkTo) {
      const route = resolveDashboardRoute(notification.linkTo);
      if (route) router.push(route);
    }
  };

  // Actions visibles : toujours pour non-lues/supprimées, au hover sinon
  const showActions = isAdmin && (isUnread || isDeleted || hovered);

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'group relative flex items-start gap-3 overflow-hidden rounded-xl border p-4 pl-5 transition',
        !isDeleted && 'cursor-pointer hover:translate-x-0.5',
        isDeleted && 'opacity-70',
      )}
      style={{
        backgroundColor: selected
          ? colors.primary + '11'
          : isDeleted
            ? colors.danger + '06'
            : isUnread
              ? colors.primary + '06'
              : colors.surface,
        borderColor: selected
          ? colors.primary
          : isDeleted
            ? colors.danger + '44'
            : isUnread
              ? colors.primary + '33'
              : colors.border,
      }}
    >
      {/* Barre latérale colorée */}
      <div
        className="absolute inset-y-0 left-0 transition-all"
        style={{
          width: hovered ? 6 : 4,
          backgroundColor: isDeleted
            ? colors.danger
            : isUnread
              ? tone
              : 'transparent',
        }}
      />

      {/* ═════ Checkbox de sélection ═════ */}
      {selectable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect?.(notification.id);
          }}
          className="mt-3 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition"
          style={{
            borderColor: selected ? colors.primary : colors.border,
            backgroundColor: selected ? colors.primary : 'transparent',
          }}
          aria-label={selected ? 'Désélectionner' : 'Sélectionner'}
        >
          {selected && (
            <Check
              className="h-3 w-3"
              style={{ color: colors.onPrimary }}
              strokeWidth={3}
            />
          )}
        </button>
      )}

      {/* Icône */}
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
        style={{
          backgroundColor: (isDeleted ? colors.danger : tone) + '18',
        }}
      >
        <Icon
          className="h-5 w-5"
          style={{ color: isDeleted ? colors.danger : tone }}
        />
      </div>

      {/* Contenu */}
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {isUnread && !isDeleted && (
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: tone }}
                aria-label="Non lue"
              />
            )}
            <span
              className={cn(
                'text-sm leading-tight',
                isUnread && !isDeleted ? 'font-extrabold' : 'font-bold',
              )}
              style={{
                color: isDeleted ? colors.textMuted : colors.text,
                textDecoration: isDeleted ? 'line-through' : 'none',
              }}
            >
              {notification.title}
            </span>

            {isDeleted && (
              <span
                className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-black tracking-widest"
                style={{
                  backgroundColor: colors.danger + '11',
                  borderColor: colors.danger + '44',
                  color: colors.danger,
                }}
              >
                <Skull className="h-2.5 w-2.5" />
                SUPPRIMÉE
              </span>
            )}
          </div>

          <span
            className="shrink-0 whitespace-nowrap text-[10px] font-semibold"
            style={{ color: colors.textMuted }}
          >
            {relativeDate(notification.createdAt)}
          </span>
        </div>

        <p
          className="line-clamp-2 text-xs leading-relaxed"
          style={{
            color: isDeleted ? colors.textMuted : colors.textSecondary,
          }}
        >
          {notification.message}
        </p>

        {/* Actions */}
        {showActions && (
          <div className="mt-1 flex flex-wrap items-center gap-1">
            {isUnread && !isDeleted && onMarkRead && (
              <ActionBtn
                icon={Check}
                label="Marquer lu"
                tone={colors.primary}
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkRead(notification.id);
                }}
              />
            )}

            {!isDeleted && onSoftDelete && (
              <ActionBtn
                icon={Trash2}
                label="Supprimer"
                tone={colors.warning}
                onClick={(e) => {
                  e.stopPropagation();
                  onSoftDelete(notification);
                }}
              />
            )}

            {isDeleted && onRestore && (
              <ActionBtn
                icon={RotateCcw}
                label="Restaurer"
                tone={colors.success}
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore(notification);
                }}
              />
            )}

            {isDeleted && onHardDelete && (
              <ActionBtn
                icon={Skull}
                label="Supprimer définitivement"
                tone={colors.danger}
                onClick={(e) => {
                  e.stopPropagation();
                  onHardDelete(notification);
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Bouton d'action compact
// ------------------------------------------------------------------
function ActionBtn({
  icon: Icon,
  label,
  tone,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  tone: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-bold transition"
      style={{
        backgroundColor: hover ? tone + '22' : tone + '11',
        borderColor: tone + '33',
        color: tone,
      }}
      title={label}
    >
      <Icon className="h-3 w-3" />
      {label}
    </button>
  );
}