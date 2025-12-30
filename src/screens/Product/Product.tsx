import {
  QueryErrorResetBoundary,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useLocales } from "expo-localization";
import { Suspense, useMemo } from "react";
import { useApiClient } from "@api/ApiClient";
import { useParams } from "@hooks/useParams";
import { GetProductDetails } from "@api/validators/getProductDetails";
import { VStack } from "@components/layout/VStack";
import { Box } from "@components/layout/Box";
import { RemoteImage } from "@components/media/RemoteImage";
import { Headline, TextCaption } from "@components/typography/Text";
import { ErrorBoundary } from "@components/feedback";
import { ProductLoader } from "./ProductLoader";
import { ProductError } from "./ProductError";

function ProductContent({ barcode }: { barcode: string }) {
  const [locale] = useLocales();
  const { client } = useApiClient();

  const { data } = useSuspenseQuery({
    queryKey: ["product", barcode, locale.languageCode ?? "en"],
    queryFn: () =>
      client.getProductDetails(barcode, {
        lc: locale.languageCode ?? "en",
      }),
  });

  const { brands, product_name, imageUrl, imageRatio } = data;

  const brand = useMemo(() => brands.split(",")[0], [brands]);

  return (
    <VStack padding={2} gap={2} width="100%">
      <VStack gap={1}>
        <Headline>{product_name}</Headline>
        <TextCaption>{brand}</TextCaption>
      </VStack>
      <Box width={"100%"} aspectRatio={1} alignItems="center">
        <Box height={"100%"} aspectRatio={imageRatio}>
          <RemoteImage
            source={imageUrl}
            width={"100%"}
            height={"100%"}
            shape="squircle"
          />
        </Box>
      </Box>
    </VStack>
  );
}

export function Product() {
  const { barcode } = useParams<ProductParams>();

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallback={({ error, reset: onRetry }) => (
            <ProductError error={error} onRetry={onRetry} />
          )}
        >
          <Suspense fallback={<ProductLoader />}>
            <ProductContent barcode={barcode} />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

export type ProductParams = { barcode: string };
export type ProductDetails = GetProductDetails;
