// components/notifications/NotificationItem.tsx
'use client';

import {
  Bell,
  CalendarDays,
  Heart,
  Info as InfoIcon,
  Megaphone,
  PartyPopper,
  type LucideIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

import { useTheme } from '@/components/providers/ThemeProvider';
import type { Notification, NotificationType } from '@/types/notification.types';

interface Props {
  notification: Notification;
  onMarkRead?: (id: string) => void;
}

// ------------------------------------------------------------------
// Icône + couleur par type
// ------------------------------------------------------------------
function iconOf(type: NotificationType): LucideIcon {
  switch (type) {
    case 'PROGRAMME':  return CalendarDays;
    case 'EVENEMENT':  return PartyPopper;
    case 'INFO':       return Megaphone;
    case 'PRIERE':     return Heart;
    case 'RAPPEL':     return Bell;
    case 'GENERIC':
    default:           return InfoIcon;
  }
}

function toneOf(
  type: NotificationType,
  colors: ReturnType<typeof useTheme>['colors'],
): string {
  switch (type) {
    case 'PROGRAMME': return colors.primary;
    case 'EVENEMENT': return colors.info;
    case 'INFO':      return colors.primary;
    case 'PRIERE':    return '#A855F7';
    case 'RAPPEL':    return colors.warning;
    case 'GENERIC':
    default:          return colors.textSecondary;
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
export default function NotificationItem({ notification, onMarkRead }: Props) {
  const { colors } = useTheme();
  const router = useRouter();           // ✅ HOOK DANS LE COMPOSANT

  const Icon = iconOf(notification.type);
  const tone = toneOf(notification.type, colors);

  const handleClick = () => {
    if (!notification.read && onMarkRead) {
      onMarkRead(notification.id);
    }
    if (notification.linkTo) {
      router.push(notification.linkTo);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition hover:opacity-95"
      style={{
        backgroundColor: notification.read
          ? colors.surface
          : colors.primary + '08',
        borderColor: notification.read
          ? colors.border
          : colors.primary + '44',
      }}
    >
      {/* Icône */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: tone + '22' }}
      >
        <Icon className="h-5 w-5" style={{ color: tone }} />
      </div>

      {/* Contenu */}
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <span
            className="text-sm font-bold leading-tight"
            style={{ color: colors.text }}
          >
            {notification.title}
          </span>

          <div className="flex items-center gap-2">
            {!notification.read && (
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: colors.primary }}
                aria-label="Non lue"
              />
            )}
            <span
              className="shrink-0 whitespace-nowrap text-[10px] font-semibold"
              style={{ color: colors.textMuted }}
            >
              {relativeDate(notification.createdAt)}
            </span>
          </div>
        </div>

        <p
          className="line-clamp-2 text-xs leading-relaxed"
          style={{ color: colors.textSecondary }}
        >
          {notification.message}
        </p>
      </div>
    </div>
  );
}