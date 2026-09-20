// components/layout/ThemePicker.tsx
'use client';

import { Check, X } from 'lucide-react';
import React from 'react';

import { useTheme } from '@/components/providers/ThemeProvider';
import { ThemeMeta, ThemeName } from '@/config/themes';

const ORDER: ThemeName[] = ['darkBlue', 'orangeRed', 'light', 'blueDark'];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ThemePicker({ open, onClose }: Props) {
  const { colors, name, setTheme } = useTheme();

  if (!open) return null;

  const handlePick = (next: ThemeName) => {
    setTheme(next);
    setTimeout(onClose, 120);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
        onClick={onClose}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-md rounded-2xl border p-6 shadow-2xl"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2
              className="text-lg font-extrabold tracking-wide"
              style={{ color: colors.text }}
            >
              Choisir un thème
            </h2>
            <p
              className="mt-1 text-xs font-medium"
              style={{ color: colors.textSecondary }}
            >
              Le thème s'applique immédiatement.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border"
            style={{ borderColor: colors.border, color: colors.text }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {ORDER.map((key) => {
            const meta = ThemeMeta[key];
            const active = key === name;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handlePick(key)}
                className="relative flex flex-col gap-2 rounded-xl border-2 p-3 text-left transition hover:opacity-90"
                style={{
                  backgroundColor: colors.surfaceAlt,
                  borderColor: active ? colors.primary : colors.border,
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-6 w-6 rounded-full border"
                    style={{
                      backgroundColor: meta.preview,
                      borderColor: colors.border,
                    }}
                  />
                  <span
                    className="h-6 w-6 rounded-full"
                    style={{ backgroundColor: meta.accent }}
                  />
                </div>
                <span
                  className="text-sm font-bold"
                  style={{ color: colors.text }}
                >
                  {meta.label}
                </span>
                {active && (
                  <span
                    className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Check
                      className="h-3 w-3"
                      style={{ color: colors.onPrimary }}
                    />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}