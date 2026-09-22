// components/ui/Toast.tsx
'use client';

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  type LucideIcon,
} from 'lucide-react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useTheme } from '@/components/providers/ThemeProvider';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  title?: string;
  message: string;
  variant?: ToastVariant;
  position?: ToastPosition;
  duration?: number; // ms, 0 = pas d'auto-dismiss
  action?: ToastAction;
  dismissible?: boolean;
}

interface ToastItem extends Required<Omit<ToastOptions, 'action' | 'title'>> {
  id: string;
  title?: string;
  action?: ToastAction;
}

interface ToastContextValue {
  show: (options: ToastOptions) => string;
  success: (message: string, options?: Partial<ToastOptions>) => string;
  error: (message: string, options?: Partial<ToastOptions>) => string;
  warning: (message: string, options?: Partial<ToastOptions>) => string;
  info: (message: string, options?: Partial<ToastOptions>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

// ------------------------------------------------------------------
// Config par variante
// ------------------------------------------------------------------
const VARIANT_META: Record<
  ToastVariant,
  { icon: LucideIcon; defaultDuration: number }
> = {
  success: { icon: CheckCircle2, defaultDuration: 4000 },
  error: { icon: AlertCircle, defaultDuration: 6000 },
  warning: { icon: AlertTriangle, defaultDuration: 5000 },
  info: { icon: Info, defaultDuration: 4000 },
};

// ------------------------------------------------------------------
// Context
// ------------------------------------------------------------------
const ToastContext = createContext<ToastContextValue | null>(null);

let toastCounter = 0;
function nextId(): string {
  toastCounter += 1;
  return `toast-${Date.now()}-${toastCounter}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const show = useCallback(
    (options: ToastOptions): string => {
      const id = nextId();
      const variant = options.variant ?? 'info';
      const meta = VARIANT_META[variant];

      const toast: ToastItem = {
        id,
        variant,
        title: options.title,
        message: options.message,
        position: options.position ?? 'top-right',
        duration:
          options.duration !== undefined
            ? options.duration
            : meta.defaultDuration,
        action: options.action,
        dismissible: options.dismissible ?? true,
      };

      setToasts((prev) => [...prev, toast]);
      return id;
    },
    [],
  );

  const success = useCallback(
    (message: string, options?: Partial<ToastOptions>) =>
      show({ ...options, message, variant: 'success' }),
    [show],
  );
  const error = useCallback(
    (message: string, options?: Partial<ToastOptions>) =>
      show({ ...options, message, variant: 'error' }),
    [show],
  );
  const warning = useCallback(
    (message: string, options?: Partial<ToastOptions>) =>
      show({ ...options, message, variant: 'warning' }),
    [show],
  );
  const info = useCallback(
    (message: string, options?: Partial<ToastOptions>) =>
      show({ ...options, message, variant: 'info' }),
    [show],
  );

  const value = useMemo<ToastContextValue>(
    () => ({ show, success, error, warning, info, dismiss, dismissAll }),
    [show, success, error, warning, info, dismiss, dismissAll],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast doit être utilisé dans <ToastProvider>');
  return ctx;
}

// ------------------------------------------------------------------
// Container : regroupe les toasts par position
// ------------------------------------------------------------------
function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  const positions: ToastPosition[] = [
    'top-left',
    'top-center',
    'top-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
  ];

  return (
    <>
      {positions.map((position) => {
        const items = toasts.filter((t) => t.position === position);
        if (items.length === 0) return null;

        return (
          <div
            key={position}
            className={`pointer-events-none fixed z-[9999] flex flex-col gap-2 ${containerClass(
              position,
            )}`}
          >
            {items.map((t) => (
              <ToastCard
                key={t.id}
                toast={t}
                onDismiss={() => onDismiss(t.id)}
              />
            ))}
          </div>
        );
      })}
    </>
  );
}

function containerClass(position: ToastPosition): string {
  switch (position) {
    case 'top-left':
      return 'left-4 top-4 items-start';
    case 'top-center':
      return 'left-1/2 top-4 -translate-x-1/2 items-center';
    case 'top-right':
      return 'right-4 top-4 items-end';
    case 'bottom-left':
      return 'bottom-4 left-4 items-start';
    case 'bottom-center':
      return 'bottom-4 left-1/2 -translate-x-1/2 items-center';
    case 'bottom-right':
      return 'bottom-4 right-4 items-end';
  }
}

// ------------------------------------------------------------------
// Carte individuelle
// ------------------------------------------------------------------
function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: () => void;
}) {
  const { colors } = useTheme();
  const [exiting, setExiting] = React.useState(false);

  const isBottom = toast.position.startsWith('bottom');
  const meta = VARIANT_META[toast.variant];
  const Icon = meta.icon;

  const accent = (() => {
    switch (toast.variant) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.danger;
      case 'warning':
        return colors.warning;
      case 'info':
        return colors.info;
    }
  })();

  // Auto-dismiss
  useEffect(() => {
    if (toast.duration <= 0) return;
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onDismiss, 200);
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast.duration, onDismiss]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(onDismiss, 200);
  };

  return (
    <div
      className={`pointer-events-auto w-full max-w-sm rounded-xl border shadow-2xl transition-all duration-200 ${
        exiting
          ? 'translate-y-2 opacity-0'
          : 'translate-y-0 opacity-100'
      }`}
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        animation: exiting
          ? 'none'
          : isBottom
            ? 'toast-in-up 200ms ease-out'
            : 'toast-in-down 200ms ease-out',
      }}
    >
      {/* Barre latérale colorée */}
      <div className="flex overflow-hidden rounded-xl">
        <div className="w-1 shrink-0" style={{ backgroundColor: accent }} />

        <div className="flex flex-1 items-start gap-3 p-3.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: accent + '22' }}
          >
            <Icon className="h-4 w-4" style={{ color: accent }} />
          </div>

          <div className="flex-1 flex flex-col gap-0.5">
            {toast.title && (
              <p
                className="text-xs font-black tracking-wide"
                style={{ color: colors.text }}
              >
                {toast.title}
              </p>
            )}
            <p
              className="text-xs leading-relaxed"
              style={{ color: colors.textSecondary }}
            >
              {toast.message}
            </p>

            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick();
                  handleClose();
                }}
                className="mt-1 self-start rounded-md px-2 py-1 text-[11px] font-bold transition hover:opacity-90"
                style={{
                  backgroundColor: accent + '22',
                  color: accent,
                }}
              >
                {toast.action.label}
              </button>
            )}
          </div>

          {toast.dismissible && (
            <button
              type="button"
              onClick={handleClose}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition hover:opacity-80"
              style={{ color: colors.textMuted }}
              aria-label="Fermer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}