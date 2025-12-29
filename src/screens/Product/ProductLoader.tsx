import { Fallback } from "@components/feedback";
import { useQuery } from "@tanstack/react-query";
import { useLocales } from "expo-localization";
import { useEffect } from "react";
// import { useTheme } from "@coinbase/cds-mobile";
import { useNavigation } from "@react-navigation/native";
import { useParams } from "@hooks/useParams";
import { useApiClient } from "@api/ApiClient";
import { VStack } from "@components/layout/VStack";
import { Box } from "@components/layout/Box";
import { TextBody } from "@components/typography/Text";

function LoaderError() {
  return (
    <VStack>
      <TextBody>Error view</TextBody>
    </VStack>
  );
}

export function ProductLoader() {
  const { barcode } = useParams<ProductLoaderParams>();

  // const theme = useTheme();

  const [locale] = useLocales();
  const { client } = useApiClient();

  const { data, error } = useQuery({
    queryKey: ["product", barcode],
    queryFn: async ({ queryKey }) => {
      const [_, mBarcode] = queryKey;
      return client.getProductDetails(mBarcode ?? "", {
        lc: locale.languageCode ?? "en",
      });
    },
    enabled: !!barcode,
  });

  const navigation = useNavigation();
  useEffect(() => {
    if (data) {
      navigation.navigate("Product", data);
    }
  }, [data, navigation]);

  if (error) {
    return <LoaderError />;
  }

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

export type ProductLoaderParams = { barcode: string };
