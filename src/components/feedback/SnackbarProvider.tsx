import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Snackbar, SnackbarVariant } from "./Snackbar";

type SnackbarShowArgs = {
  message: string;
  variant?: SnackbarVariant;
};

type SnackbarApi = (args: SnackbarShowArgs) => void;

const SnackbarContext = createContext<SnackbarApi>(() => {});

const SNACKBAR_DURATION_MS = 2000;

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [snack, setSnack] = useState<{
    message: string;
    variant?: SnackbarVariant;
  } | null>(null);
  const [visible, setVisible] = useState(false);

  const show = useCallback((args: SnackbarShowArgs) => {
    setSnack({
      message: args.message,
      variant: args.variant,
    });
    setVisible(true);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (visible) {
      timer = setTimeout(() => setVisible(false), SNACKBAR_DURATION_MS);
    }

    return () => clearTimeout(timer);
  }, [snack, visible]);

  return (
    <SnackbarContext.Provider value={show}>
      {children}
      <Snackbar
        message={snack?.message ?? ""}
        variant={snack?.variant}
        visible={visible}
      />
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  return ctx;
}
