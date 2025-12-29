import { ScrollableView, ScrollableViewProps } from "./ScrollableView";

export type HStackProps = ScrollableViewProps;

export function HStack({ children, ...props }: HStackProps) {
  return (
    <ScrollableView {...props} flexDirection="row">
      {children}
    </ScrollableView>
  );
}
