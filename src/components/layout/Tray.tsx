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
  closeTray: () => void;
};

export const Tray = forwardRef<TrayApi, TrayProps>(function Tray(
  { children },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const sheetRef = useRef<BottomSheet>(null);

  const closeTray = useCallback(() => {
    const sheet = sheetRef.current;

    if (!sheet) {
      setVisible(false);
      return;
    }

    sheet.close();
  }, []);

  const onTrayClose = useCallback(() => {
    setVisible(false);
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
