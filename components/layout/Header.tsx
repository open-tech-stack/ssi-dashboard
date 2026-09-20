// components/layout/Header.tsx
'use client';

import { Bell, LogOut, Menu, Palette, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { useTheme } from '@/components/providers/ThemeProvider';
import { useAuth } from '@/contexts/AuthContext';
import { useUnreadCount } from '@/hooks/useUnreadCount';

import ThemePicker from './ThemePicker';

interface Props {
  onMobileMenuOpen: () => void;
}

export default function Header({ onMobileMenuOpen }: Props) {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const { count: unreadCount } = useUnreadCount();

  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <>
      <header
        className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6"
        style={{ backgroundColor: colors.headerBg, borderColor: colors.border }}
      >
        {/* Mobile menu */}
        <button
          type="button"
          onClick={onMobileMenuOpen}
          className="flex h-9 w-9 items-center justify-center rounded-lg border transition md:hidden"
          style={{ borderColor: colors.border }}
        >
          <Menu className="h-5 w-5" style={{ color: colors.text }} />
        </button>

        {/* Titre */}
        <div className="hidden flex-col md:flex">
          <h1
            className="text-lg font-bold tracking-wide"
            style={{ color: colors.text }}
          >
            Tableau de bord
          </h1>
          <p
            className="text-xs font-medium"
            style={{ color: colors.textSecondary }}
          >
            Bienvenue sur SSI Administration
          </p>
        </div>

        <div className="flex-1 md:hidden" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <IconBtn
            colors={colors}
            onClick={() => setThemePickerOpen(true)}
            aria-label="Thème"
          >
            <Palette className="h-5 w-5" />
          </IconBtn>

          {/* Cloche avec badge */}
          <IconBtn
            colors={colors}
            onClick={() => router.push('/notifications')}
            aria-label="Notifications"
            badge={unreadCount}
          >
            <Bell className="h-5 w-5" />
          </IconBtn>

          {/* User menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex h-9 items-center gap-2 rounded-lg border px-3 transition hover:opacity-90"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }}
            >
              <User className="h-4 w-4" style={{ color: colors.primary }} />
              <span
                className="hidden text-xs font-bold md:block"
                style={{ color: colors.text }}
              >
                {user?.code ?? 'Admin'}
              </span>
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div
                  className="absolute right-0 top-11 z-50 w-56 rounded-lg border p-2 shadow-2xl"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                >
                  <div
                    className="border-b px-3 py-2"
                    style={{ borderColor: colors.border }}
                  >
                    <p
                      className="text-xs font-bold"
                      style={{ color: colors.text }}
                    >
                      Connecté en tant qu'admin
                    </p>
                    <p
                      className="mt-0.5 font-mono text-[10px] tracking-widest"
                      style={{ color: colors.textMuted }}
                    >
                      {user?.code}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left transition hover:opacity-90"
                    style={{ color: colors.danger }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-bold">Se déconnecter</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <ThemePicker
        open={themePickerOpen}
        onClose={() => setThemePickerOpen(false)}
      />
    </>
  );
}

function IconBtn({
  children,
  onClick,
  colors,
  badge,
  ...rest
}: {
  children: React.ReactNode;
  onClick: () => void;
  colors: ReturnType<typeof useTheme>['colors'];
  badge?: number;
  [key: string]: unknown;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex h-9 w-9 items-center justify-center rounded-lg border transition hover:opacity-90"
      style={{
        borderColor: colors.border,
        color: colors.text,
        backgroundColor: colors.surface,
      }}
      {...rest}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span
          className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-black text-white"
          style={{ backgroundColor: colors.danger }}
        >
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );
}