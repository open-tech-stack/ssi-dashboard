// components/providers/ThemeProvider.tsx
'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  ThemeColors,
  ThemeName,
  Themes,
} from '@/config/themes';

interface ThemeContextValue {
  name: ThemeName;
  colors: ThemeColors;
  setTheme: (name: ThemeName) => void;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [name, setName] = useState<ThemeName>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  // Chargement initial depuis localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeName | null;
      if (stored && stored in Themes) setName(stored);
    } catch {
      // silencieux
    }
    setMounted(true);
  }, []);

  const setTheme = useCallback((next: ThemeName) => {
    setName(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // silencieux
    }
  }, []);

  // Applique la classe "light" ou "dark" sur <html> pour Tailwind
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    const isLight = Themes[name].text === '#0F172A'; // theme light
    root.classList.remove('light', 'dark');
    root.classList.add(isLight ? 'light' : 'dark');
  }, [name, mounted]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      name,
      colors: Themes[name],
      setTheme,
      isLight: Themes[name].text === '#0F172A',
    }),
    [name, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme doit être utilisé dans <ThemeProvider>');
  return ctx;
}