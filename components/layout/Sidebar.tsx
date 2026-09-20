// components/layout/Sidebar.tsx
'use client';

import {
  Bell,
  CalendarDays,
  ChevronLeft,
  Heart,
  LayoutDashboard,
  Megaphone,
  PartyPopper,
  Pin,
  UserCog,
  Users,
  UsersRound,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Tableau de bord', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Programmes',      icon: CalendarDays,    href: '/programmes' },
  { label: 'Événements',      icon: PartyPopper,     href: '/evenements' },
  { label: 'Infos',           icon: Megaphone,       href: '/infos' },
  { label: 'Prières',         icon: Heart,           href: '/prieres' },
  { label: 'Rappels',         icon: Pin,            href: '/rappels' },
  { label: 'Notifications',   icon: Bell,             href: '/notifications' },
];

const ADMIN_ITEMS: NavItem[] = [
  { label: 'Utilisateurs', icon: UserCog,    href: '/users' },
  { label: 'Personnes',    icon: Users,      href: '/people' },
  { label: 'Groupes',      icon: UsersRound, href: '/groups' },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: Props) {
  const { colors } = useTheme();
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Header du sidebar (cliquable pour réduire/étendre) */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex h-16 w-full items-center gap-3 border-b px-4 transition',
          'hover:opacity-90',
        )}
        style={{
          borderColor: colors.sidebarBorder,
          backgroundColor: colors.sidebarBg,
        }}
      >
        {/* Logo carré */}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-black"
          style={{
            backgroundColor: colors.primary,
            color: colors.onPrimary,
          }}
        >
          SSI
        </div>

        {!collapsed && (
          <div className="flex flex-1 flex-col items-start overflow-hidden">
            <span
              className="truncate text-sm font-bold tracking-wide"
              style={{ color: colors.text }}
            >
              SSI Admin
            </span>
            <span
              className="truncate text-[10px] font-semibold tracking-widest"
              style={{ color: colors.textMuted }}
            >
              SIM SOMGANDE
            </span>
          </div>
        )}

        {/* Chevron (desktop) */}
        <ChevronLeft
          className={cn(
            'hidden h-4 w-4 shrink-0 transition-transform md:block',
            collapsed && 'rotate-180',
          )}
          style={{ color: colors.textMuted }}
        />

        {/* X (mobile) */}
        <X
          className="h-5 w-5 shrink-0 md:hidden"
          style={{ color: colors.textMuted }}
          onClick={(e) => {
            e.stopPropagation();
            onMobileClose();
          }}
        />
      </button>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <SectionLabel colors={colors} label="GESTION" collapsed={collapsed} />
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              active={isActive(item.href)}
              colors={colors}
              onClick={onMobileClose}
            />
          ))}
        </div>

        <SectionLabel
          colors={colors}
          label="ADMINISTRATION"
          collapsed={collapsed}
        />
        <div className="space-y-1">
          {ADMIN_ITEMS.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              active={isActive(item.href)}
              colors={colors}
              onClick={onMobileClose}
            />
          ))}
        </div>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div
          className="border-t px-4 py-3 text-center text-[10px] font-semibold tracking-widest"
          style={{
            borderColor: colors.sidebarBorder,
            color: colors.textMuted,
          }}
        >
          VERSION 1.0.0
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          'hidden shrink-0 border-r transition-[width] duration-300 md:flex md:flex-col',
          collapsed ? 'w-[72px]' : 'w-64',
        )}
        style={{
          backgroundColor: colors.sidebarBg,
          borderColor: colors.sidebarBorder,
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={onMobileClose}
          />
          <aside
            className="absolute inset-y-0 left-0 z-50 w-64"
            style={{
              backgroundColor: colors.sidebarBg,
              borderRight: `1px solid ${colors.sidebarBorder}`,
            }}
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

// ------------------------------------------------------------------
// Section label
// ------------------------------------------------------------------
function SectionLabel({
  label,
  collapsed,
  colors,
}: {
  label: string;
  collapsed: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  if (collapsed) {
    return (
      <div
        className="mx-2 my-3 h-px"
        style={{ backgroundColor: colors.border }}
      />
    );
  }
  return (
    <div
      className="px-2 pb-2 pt-4 text-[10px] font-bold tracking-widest"
      style={{ color: colors.textMuted }}
    >
      {label}
    </div>
  );
}

// ------------------------------------------------------------------
// Lien sidebar
// ------------------------------------------------------------------
function SidebarLink({
  item,
  collapsed,
  active,
  colors,
  onClick,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 transition',
        collapsed && 'justify-center px-2',
      )}
      style={{
        backgroundColor: active ? colors.surfaceAlt : 'transparent',
        color: active ? colors.primary : colors.textSecondary,
      }}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && (
        <span className="truncate text-sm font-semibold">{item.label}</span>
      )}
    </Link>
  );
}