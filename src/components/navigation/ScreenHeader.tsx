import { useMemo, type ReactNode } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Box } from "@components/layout/Box";
import { spacing } from "@constants/theme";
import { Title } from "@components/typography/Text";
import { BackArrow } from "./BackArrow";
import { CenteredHeader } from "./CenteredHeader";

export type ScreenHeaderProps = {
  title?: string;
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function ScreenHeader({
  title,
  left,
  center,
  right,
  style,
}: ScreenHeaderProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const canGoBack = navigation.canGoBack();

  const resolvedLeft = useMemo(() => {
    if (left !== undefined) return left;
    if (!canGoBack) return null;
    return <BackArrow canGoBack />;
  }, [canGoBack, left]);

  const resolvedCenter = useMemo(() => {
    if (center !== undefined) return center;
    if (!title) return null;
    return <Title>{title}</Title>;
  }, [center, title]);

  const containerStyle = useMemo(
    () =>
      StyleSheet.flatten([
        styles.container,
        {
          paddingTop: insets.top,
        },
        style,
      ]),
    [insets.top, style],
  );

  return (
    <Box style={containerStyle}>
      <CenteredHeader
        left={resolvedLeft}
        center={resolvedCenter}
        right={right}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing(2),
    paddingBottom: spacing(1),
  },
});
