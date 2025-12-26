import { useCallback, useMemo } from "react";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { Box } from "@components/layout/Box";
import { intoThemeDimension } from "@hooks/useThemeDimension";
import type { ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CenteredHeader } from "./CenteredHeader";
import { IconButton } from "@components/buttons/IconButton";
import { Title1 } from "@components/typography/Text";

function getHeaderTitle({
  options,
  route,
}: Pick<NativeStackHeaderProps, "options" | "route">): string {
  if (typeof options.headerTitle === "string") return options.headerTitle;
  if (typeof options.title === "string") return options.title;
  return route.name;
}

function HeaderContent({
  options,
  navigation,
  back,
  route,
}: NativeStackHeaderProps) {
  const title = useMemo(() => {
    if (typeof options.headerTitle === "function") {
      const node = options.headerTitle({ children: route.name });
      return typeof node === "string" || typeof node === "number" ? (
        <Title1>{node}</Title1>
      ) : (
        node
      );
    }

    const titleString = getHeaderTitle({ options, route });
    return <Title1>{titleString}</Title1>;
  }, [options, route]);

  const onGoBack = useCallback(() => {
    if (back) navigation.goBack();
  }, [back, navigation]);

  const left = useMemo(() => {
    if (options.headerLeft) {
      return options.headerLeft({ canGoBack: !!back });
    }

    return (
      <IconButton name="chevron-left" onPress={onGoBack} disabled={!back} />
    );
  }, [onGoBack, back, options]);

  const right = useMemo(() => {
    if (!options.headerRight) return null;
    return options.headerRight({ canGoBack: !!back });
  }, [back, options]);

  return <CenteredHeader left={left} center={title} right={right} />;
}

export function Header(props: NativeStackHeaderProps) {
  const insets = useSafeAreaInsets();
  const wrapperStyle = useMemo<ViewStyle>(() => {
    return {
      paddingTop: insets.top,
      paddingInline: intoThemeDimension(2),
      paddingBottom: intoThemeDimension(1),
    };
  }, [insets.top]);

  return (
    <Box style={wrapperStyle}>
      <HeaderContent {...props} />
    </Box>
  );
}
