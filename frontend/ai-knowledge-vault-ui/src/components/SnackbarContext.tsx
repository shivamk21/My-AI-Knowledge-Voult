import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import type { AlertColor } from '@mui/material';

type SnackbarState = { open: boolean; message: string; severity: AlertColor };
type SnackbarApi = {
  snackbar: SnackbarState;
  showSnackbar: (message: string, severity?: AlertColor) => void;
  closeSnackbar: () => void;
};

const SnackbarContext = createContext<SnackbarApi | null>(null);

export function SnackbarProvider({ children }: PropsWithChildren) {
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'info' });

  const value = useMemo<SnackbarApi>(
    () => ({
      snackbar,
      showSnackbar: (message, severity = 'info') => setSnackbar({ open: true, message, severity }),
      closeSnackbar: () => setSnackbar((current) => ({ ...current, open: false }))
    }),
    [snackbar]
  );

  return <SnackbarContext.Provider value={value}>{children}</SnackbarContext.Provider>;
}

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) throw new Error('useSnackbar must be used inside SnackbarProvider');
  return context;
}
