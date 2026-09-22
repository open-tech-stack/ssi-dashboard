// hooks/useConfirm.tsx
'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

import ConfirmDialog, {
  type ConfirmDialogProps,
  type ConfirmVariant,
} from '@/components/ui/ConfirmDialog';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
interface ConfirmOptions {
  title: string;
  message: string;
  variant?: ConfirmVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmWord?: string;
  requireInput?: boolean;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

// ------------------------------------------------------------------
// Provider
// ------------------------------------------------------------------
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    resolverRef.current?.(true);
    resolverRef.current = null;
    setOpen(false);
  }, []);

  const handleCancel = useCallback(() => {
    resolverRef.current?.(false);
    resolverRef.current = null;
    setOpen(false);
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}

      {options && (
        <ConfirmDialog
          open={open}
          title={options.title}
          message={options.message}
          variant={options.variant}
          confirmLabel={options.confirmLabel}
          cancelLabel={options.cancelLabel}
          confirmWord={options.confirmWord}
          requireInput={options.requireInput}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm doit être utilisé dans <ConfirmProvider>');
  return ctx.confirm;
}