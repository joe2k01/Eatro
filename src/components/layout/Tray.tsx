import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  type ComponentProps,
} from "react";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@contexts/ThemeProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing } from "@constants/theme";

type TrayProps = {
  children: React.ReactNode;
  onDismiss?: () => void;
  /**
   * When true, pan-down and backdrop tap do not dismiss; use explicit actions + closeTray().
   */
  lockDismiss?: boolean;
};

export type TrayApi = {
  openTray: () => void;
  closeTray: () => Promise<void>;
};

export const Tray = forwardRef<TrayApi, TrayProps>(function Tray(
  { children, onDismiss: onDismissProp, lockDismiss = false },
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
    onDismissProp?.();
  }, [onDismissProp]);

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

  const renderBackdrop = useCallback(
    (props: ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior={lockDismiss ? "none" : "close"}
      />
    ),
    [lockDismiss],
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      onDismiss={onDismiss}
      backgroundStyle={backgroundStyle}
      backdropComponent={lockDismiss ? renderBackdrop : undefined}
      enablePanDownToClose={!lockDismiss}
      enableDynamicSizing
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetView style={viewStyle}>{children}</BottomSheetView>
    </BottomSheetModal>
  );
});
