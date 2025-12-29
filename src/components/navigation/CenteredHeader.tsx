import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

export type CenteredHeaderProps = {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
};

/**
 * A 3-slot header layout that keeps the center visually centered using only
 * flexbox (no measuring, no absolute positioning).
 *
 * Left and right take equal flex space, while the center shrinks if needed.
 */
export function CenteredHeader({ left, center, right }: CenteredHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.sideLeft}>{left}</View>
      <View style={styles.center} pointerEvents="none">
        {center}
      </View>
      <View style={styles.sideRight}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  sideLeft: {
    flexGrow: 1,
    flexBasis: 0,
    alignItems: "flex-start",
  },
  sideRight: {
    flexGrow: 1,
    flexBasis: 0,
    alignItems: "flex-end",
  },
  center: {
    flexGrow: 0,
    flexShrink: 1,
    alignItems: "center",
    justifyContent: "center",
    // Prevent long titles from pushing sides off-screen.
    maxWidth: "70%",
  },
});
