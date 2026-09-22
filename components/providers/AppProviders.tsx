// components/providers/AppProviders.tsx
'use client';

import { AuthProvider } from '@/contexts/AuthContext';

import { ConfirmProvider } from '@/hooks/useConfirm';
import { ToastProvider } from '@/components/ui/Toast';
import { ThemeProvider } from './ThemeProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ConfirmProvider>
          <AuthProvider>{children}</AuthProvider>
        </ConfirmProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}