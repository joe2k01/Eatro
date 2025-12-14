import { VStack, VStackProps } from "@coinbase/cds-mobile/layout";
import { useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function SafeVStack({
  padding,
  paddingBottom,
  paddingEnd,
  paddingStart,
  paddingTop,
  paddingX,
  paddingY,
  ...props
}: VStackProps) {
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
    <VStack height={"100%"} background="bg" {...props} style={style}>
      <VStack
        padding={padding}
        paddingBottom={paddingBottom}
        paddingEnd={paddingEnd}
        paddingStart={paddingStart}
        paddingTop={paddingTop}
        paddingX={paddingX}
        paddingY={paddingY}
      >
        {props.children}
      </VStack>
    </VStack>
  );
}
