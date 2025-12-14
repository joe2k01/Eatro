import { VStack, VStackProps } from "@components/layout/VStack";
import { useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function SafeVStack({ ...props }: VStackProps) {
  const insets = useSafeAreaInsets();

  const style = useMemo<VStackProps["style"]>(
    () => ({
      ...(typeof props.style === "object" ? props.style : {}),
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    }),
    [insets.bottom, insets.left, insets.right, insets.top, props.style],
  );

  // By spreading props this way, we make height overridable, but style always has the insets
  return (
    <VStack height={"100%"} style={style}>
      <VStack {...props}>{props.children}</VStack>
    </VStack>
  );
}
