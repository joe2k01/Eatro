import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
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
  const sheetRef = useRef<BottomSheetModal>(null);
  const closePromiseRef = useRef<{
    resolve: () => void;
    reject: (error: Error) => void;
  } | null>(null);

  const closeTray = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      const sheet = sheetRef.current;

      if (!sheet) {
        resolve();
        return;
      }

      closePromiseRef.current = { resolve, reject };
      sheet.dismiss();
    });
  }, []);

  const onDismiss = useCallback(() => {
    if (closePromiseRef.current) {
      closePromiseRef.current.resolve();
      closePromiseRef.current = null;
    }
    sheetRef.current?.dismiss();
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      openTray: () => sheetRef.current?.present(),
      closeTray,
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

  return (
    <BottomSheetModal
      ref={sheetRef}
      onDismiss={onDismiss}
      backgroundStyle={backgroundStyle}
      enablePanDownToClose
      enableDynamicSizing
    >
      <BottomSheetView style={viewStyle}>{children}</BottomSheetView>
    </BottomSheetModal>
  );
});
