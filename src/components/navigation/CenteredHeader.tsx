import { ReactNode } from "react";
import { Box } from "../layout/Box";
import { HStack } from "../layout/HStack";
import { useCenteredHeader } from "../../hooks/useCenteredHeader";

export type CenteredHeaderProps = {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
};

/**
 * A 3-slot header layout that keeps the center visually centered by
 * mirroring the left slot width into the right slot.
 */
export function CenteredHeader({ left, center, right }: CenteredHeaderProps) {
  const { leftRef, rightRef } = useCenteredHeader();

  return (
    <HStack alignItems="center" justifyContent="space-between">
      <Box ref={leftRef}>{left}</Box>
      <Box>{center}</Box>
      <Box ref={rightRef}>{right}</Box>
    </HStack>
  );
}
