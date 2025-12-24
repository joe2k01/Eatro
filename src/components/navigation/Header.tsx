import { useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ViewStyle } from "react-native";
import { intoThemeDimension } from "@hooks/useThemeDimension";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import type { Route } from "@react-navigation/native";
import { RouteNames } from "../../AppRoutes";
import { SettingsHeader } from "@screens/Settings";
import { Box } from "@components/layout/Box";
import { HomeHeader } from "@screens/Home";

const headers: Partial<
  Record<RouteNames, (props: NativeStackHeaderProps) => React.ReactNode>
> = {
  Settings: SettingsHeader,
  Home: HomeHeader,
};

export function Header(props: NativeStackHeaderProps) {
  const route = (props.route as Route<RouteNames>).name;
  const HeaderComponent = route in headers ? headers[route] : null;

  const insets = useSafeAreaInsets();

  const wrapperStyle = useMemo<ViewStyle>(() => {
    return {
      paddingTop: insets.top,
      paddingInline: intoThemeDimension(2),
      paddingBottom: intoThemeDimension(1),
    };
  }, [insets.top]);

  if (!HeaderComponent) {
    return null;
  }

  return (
    <Box style={wrapperStyle}>
      <HeaderComponent {...props} />
    </Box>
  );
}
