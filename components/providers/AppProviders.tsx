// components/providers/AppProviders.tsx
'use client';

import { AuthProvider } from '@/contexts/AuthContext';

import { ThemeProvider } from './ThemeProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}