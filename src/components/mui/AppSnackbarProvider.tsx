"use client";

import { Alert, Snackbar } from "@mui/material";
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";

type SnackbarSeverity = "success" | "info" | "warning" | "error";

type SnackbarState = {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
};

type AppSnackbarContextValue = {
  showSnackbar: (message: string, severity?: SnackbarSeverity) => void;
};

const AppSnackbarContext = createContext<AppSnackbarContextValue | undefined>(undefined);

export function AppSnackbarProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });

  const showSnackbar = useCallback((message: string, severity: SnackbarSeverity = "info") => {
    setState({ open: true, message, severity });
  }, []);

  const handleClose = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const value = useMemo(() => ({ showSnackbar }), [showSnackbar]);

  return (
    <AppSnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={3500}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={state.severity}
          onClose={handleClose}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {state.message}
        </Alert>
      </Snackbar>
    </AppSnackbarContext.Provider>
  );
}

export function useAppSnackbar() {
  const context = useContext(AppSnackbarContext);
  if (!context) {
    throw new Error("useAppSnackbar must be used within AppSnackbarProvider");
  }
  return context;
}