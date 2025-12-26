import { VStack, VStackProps } from "@components/layout/VStack";
import { useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";

export type SafeVStackProps = VStackProps & {
  guard?: "top" | "bottom" | "both";
};

export function SafeVStack({
  guard = "bottom",
  scrollable = true,
  ...props
}: SafeVStackProps) {
  const insets = useSafeAreaInsets();

  const { paddingStyle } = useMemo(() => {
    const padding = {
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingTop: guard === "top" || guard === "both" ? insets.top : 0,
      paddingBottom: guard === "bottom" || guard === "both" ? insets.bottom : 0,
    };

    return StyleSheet.create({
      paddingStyle: {
        ...padding,
      },
    });
  }, [guard, insets.bottom, insets.left, insets.right, insets.top]);

  return (
    <VStack height={"100%"} style={paddingStyle}>
      <VStack {...props} scrollable={scrollable}>
        {props.children}
      </VStack>
    </VStack>
  );
}
