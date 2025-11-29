import { VStack } from "@coinbase/cds-mobile/layout/VStack";
import { GetProductDetails } from "../../api/validators/getProductDetails";
import { useRoute } from "@react-navigation/native";
import { Text } from "@coinbase/cds-mobile/typography/Text";

export function Product() {
  const { params } = useRoute();
  const { brands, product_name, nutriments } = params as ProductParams;

  return (
    <VStack>
      <Text>{product_name}</Text>
    </VStack>
  );
}

export type ProductParams = GetProductDetails;
