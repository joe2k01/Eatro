import { SafeVStack, type SafeVStackProps } from "@components/SafeVStack";
import {
  ScreenHeader,
  type ScreenHeaderProps,
} from "@components/navigation/ScreenHeader";

export type ScreenProps = Omit<SafeVStackProps, "guard"> & {
  noGuard?: boolean;
  title?: ScreenHeaderProps["title"];
  headerLeft?: ScreenHeaderProps["left"];
  headerCenter?: ScreenHeaderProps["center"];
  headerRight?: ScreenHeaderProps["right"];
  headerStyle?: ScreenHeaderProps["style"];
};

export function Screen({
  title,
  headerLeft,
  headerCenter,
  headerRight,
  headerStyle,
  noGuard = false,
  paddingHorizontal = 2,
  /** Fills the navigator slot so header + body column gets height (scroll/tab/flex children). */
  flex = 1,
  children,
  ...safeVStackProps
}: ScreenProps) {
  return (
    <SafeVStack
      guard={noGuard ? "none" : "bottom"}
      paddingHorizontal={paddingHorizontal}
      {...safeVStackProps}
      flex={flex}
    >
      <ScreenHeader
        title={title}
        left={headerLeft}
        center={headerCenter}
        right={headerRight}
        style={headerStyle}
      />
      {children}
    </SafeVStack>
  );
}
