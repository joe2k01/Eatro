import { Fallback } from "@components/feedback";
import { VStack } from "@components/layout/VStack";
import { Box } from "@components/layout/Box";

export function ProductLoader() {
  return (
    <VStack padding={2} gap={2} width="100%">
      <VStack gap={1}>
        <Fallback height={28} width="100%" />
        <Box height={20} width={"50%"}>
          <Fallback height="100%" width="100%" />
        </Box>
      </VStack>
      <Box width={"100%"} aspectRatio={1}>
        <Fallback shape="squircle" width={"100%"} height={"100%"} />
      </Box>
    </VStack>
  );
}
