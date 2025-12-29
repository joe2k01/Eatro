import { ScrollableView, ScrollableViewProps } from "./ScrollableView";

export type VStackProps = ScrollableViewProps;

export function VStack({ children, ...props }: ScrollableViewProps) {
  return (
    <ScrollableView {...props} flexDirection="column">
      {children}
    </ScrollableView>
  );
}
