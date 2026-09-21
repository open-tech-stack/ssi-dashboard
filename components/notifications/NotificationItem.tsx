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
// Résolution deep link mobile → dashboard web
// ------------------------------------------------------------------
function resolveDashboardRoute(linkTo: string): string | null {
  const segment = linkTo.split('/').filter(Boolean)[0];
  switch (segment) {
    case 'programmes':  return '/programmes';
    case 'evenements':  return '/evenements';
    case 'infos':       return '/infos';
    case 'prieres':     return '/prieres';
    case 'rappels':     return '/rappels';
    default:            return null;
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
  const router = useRouter();

  const Icon = iconOf(notification.type);
  const tone = toneOf(notification.type, colors);
  const isUnread = !notification.read;

  const handleClick = () => {
    if (isUnread && onMarkRead) {
      onMarkRead(notification.id);
    }
    if (notification.linkTo) {
      const route = resolveDashboardRoute(notification.linkTo);
      if (route) router.push(route);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group relative flex cursor-pointer items-start gap-3 overflow-hidden rounded-xl border p-4 pl-5 transition hover:translate-x-0.5 hover:opacity-95"
      style={{
        backgroundColor: isUnread ? colors.primary + '06' : colors.surface,
        borderColor: isUnread ? colors.primary + '33' : colors.border,
      }}
    >
      {/* Barre latérale colorée */}
      <div
        className="absolute inset-y-0 left-0 w-1 transition-all group-hover:w-1.5"
        style={{
          backgroundColor: isUnread ? tone : 'transparent',
        }}
      />

      {/* Icône */}
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
        style={{ backgroundColor: tone + '18' }}
      >
        <Icon className="h-5 w-5" style={{ color: tone }} />
      </div>

      {/* Contenu */}
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {isUnread && (
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: tone }}
                aria-label="Non lue"
              />
            )}
            <span
              className={`text-sm leading-tight ${
                isUnread ? 'font-extrabold' : 'font-bold'
              }`}
              style={{ color: colors.text }}
            >
              {notification.title}
            </span>
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
          style={{ color: colors.textSecondary }}
        >
          {notification.message}
        </p>
      </div>
    </div>
  );
}