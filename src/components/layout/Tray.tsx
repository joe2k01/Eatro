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
import { intoThemeDimension } from "@hooks/useThemeDimension";

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

  const { card } = useTheme();
  const insets = useSafeAreaInsets();
  const viewStyle = useMemo(
    () => ({
      paddingBottom: insets.bottom,
      paddingHorizontal: intoThemeDimension(2),
    }),
    [insets.bottom],
  );

  if (!visible) {
    return null;
  }

  return (
    <BottomSheet
      backgroundStyle={{ backgroundColor: card }}
      ref={sheetRef}
      onClose={onTrayClose}
      enablePanDownToClose
    >
      <BottomSheetView style={viewStyle}>{children}</BottomSheetView>
    </BottomSheet>
  );
});
