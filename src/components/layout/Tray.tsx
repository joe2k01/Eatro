import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useTheme } from "@contexts/ThemeProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing } from "@constants/theme";

type TrayProps = {
  children: React.ReactNode;
};

export type TrayApi = {
  openTray: () => void;
  closeTray: () => Promise<void>;
};

export const Tray = forwardRef<TrayApi, TrayProps>(function Tray(
  { children },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const sheetRef = useRef<BottomSheet>(null);
  const closePromiseRef = useRef<{
    resolve: () => void;
    reject: (error: Error) => void;
  } | null>(null);

  const closeTray = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      const sheet = sheetRef.current;

      if (!sheet) {
        setVisible(false);
        resolve();
        return;
      }

      // Store the promise resolvers to call when onClose fires
      closePromiseRef.current = { resolve, reject };
      sheet.close();
    });
  }, []);

  const onTrayClose = useCallback(() => {
    setVisible(false);
    // Resolve the promise when the tray is actually closed
    if (closePromiseRef.current) {
      closePromiseRef.current.resolve();
      closePromiseRef.current = null;
    }
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      openTray: () => setVisible(true),
      closeTray: closeTray,
    }),
    [closeTray],
  );

  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const backgroundStyle = useMemo(
    () => ({ backgroundColor: theme.surface.secondary }),
    [theme.surface.secondary],
  );

  const viewStyle = useMemo(
    () => ({
      paddingBottom: insets.bottom,
      paddingHorizontal: spacing(2),
    }),
    [insets.bottom],
  );

  if (!visible) {
    return null;
  }

  return (
    <BottomSheet
      backgroundStyle={backgroundStyle}
      ref={sheetRef}
      onClose={onTrayClose}
      enablePanDownToClose
    >
      <BottomSheetView style={viewStyle}>{children}</BottomSheetView>
    </BottomSheet>
  );
});
