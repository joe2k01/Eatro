import { useRoute } from "@react-navigation/native";
import { useMemo } from "react";
import { GetProductDetails } from "@api/validators/getProductDetails";
import { VStack } from "@components/layout/VStack";
import { Box } from "@components/layout/Box";
import { RemoteImage } from "@components/media/RemoteImage";
import { Text } from "@components/typography/Text";

export function Product() {
  const { params } = useRoute();
  const { brands, product_name, imageUrl, imageRatio } =
    params as ProductParams;

  const brand = useMemo(() => brands.split(",")[0], [brands]);

  return (
    <VStack padding={2} gap={2} width="100%">
      <VStack gap={1}>
        <Text>{product_name}</Text>
        <Text>{brand}</Text>
      </VStack>
      <Box width={"100%"} aspectRatio={1} alignItems="center">
        <Box height={"100%"} aspectRatio={imageRatio}>
          <RemoteImage
            source={imageUrl}
            width={"100%"}
            height={"100%"}
            // shape="squircle"
          />
        </Box>
      </Box>
    </VStack>
  );
}

export type ProductParams = GetProductDetails;
