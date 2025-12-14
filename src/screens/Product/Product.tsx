import { VStack } from "@coinbase/cds-mobile/layout/VStack";
import { useRoute } from "@react-navigation/native";
import { Text } from "@coinbase/cds-mobile/typography/Text";
import { useMemo } from "react";
import { RemoteImage } from "@coinbase/cds-mobile/media/RemoteImage";
import { Box } from "@coinbase/cds-mobile/layout/Box";
import { GetProductDetails } from "@api/validators/getProductDetails";

export function Product() {
  const { params } = useRoute();
  const { brands, product_name, imageUrl, imageRatio } =
    params as ProductParams;

  const brand = useMemo(() => brands.split(",")[0], [brands]);

  return (
    <VStack padding={2} gap={2} width="100%">
      <VStack gap={1}>
        <Text font="title1">{product_name}</Text>
        <Text font="caption" color="fgMuted">
          {brand}
        </Text>
      </VStack>
      <Box width={"100%"} aspectRatio={1} alignItems="center">
        <Box height={"100%"} aspectRatio={imageRatio}>
          <RemoteImage
            source={imageUrl}
            width={"100%"}
            height={"100%"}
            shape="squircle"
            darkModeEnhancementsApplied
          />
        </Box>
      </Box>
    </VStack>
  );
}

export type ProductParams = GetProductDetails;
