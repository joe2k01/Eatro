import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Suspense, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import { useParams } from "@hooks/useParams";
import { ErrorBoundary } from "@components/feedback";
import { VStack } from "@components/layout/VStack";
import { ProductLoader } from "./ProductLoader";
import { ProductError } from "./ProductError";
import { ApiProductLoader } from "./ApiProductLoader";
import { DbProductLoader } from "./DbProductLoader";

/** Pass `barcode` for Open Food Facts (images, full details). Pass `foodId` for DB-only foods. When both are set, barcode wins for loading (API path). */
export type ProductParams = {
  barcode?: string;
  foodId?: number;
};

export function Product() {
  const params = useParams<ProductParams>();
  const navigation = useNavigation();
  const trimmedBarcode = params.barcode?.trim() ?? "";
  const hasBarcode = trimmedBarcode.length > 0;
  const foodId = params.foodId;

  const content = useMemo(() => {
    if (hasBarcode) {
      return <ApiProductLoader barcode={trimmedBarcode} />;
    }
    if (foodId != null) {
      return <DbProductLoader foodId={foodId} />;
    }
    return null;
  }, [foodId, hasBarcode, trimmedBarcode]);

  if (!content) {
    return (
      <VStack flex={1} padding={2}>
        <ProductError
          error={new Error("Missing product parameters")}
          onRetry={() => navigation.goBack()}
        />
      </VStack>
    );
  }

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallback={({ error, reset: onRetry }) => (
            <ProductError error={error} onRetry={onRetry} />
          )}
        >
          <Suspense fallback={<ProductLoader />}>{content}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
