import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { useParams } from "@hooks/useParams";
import { ErrorBoundary } from "@components/feedback";
import { ProductLoader } from "./ProductLoader";
import { ProductError } from "./ProductError";
import { ApiProductLoader } from "./ApiProductLoader";
import { DbProductLoader } from "./DbProductLoader";

export type ProductParams = { barcode: string } | { foodId: number };

export function Product() {
  const params = useParams<ProductParams>();

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
            {"barcode" in params ? (
              <ApiProductLoader barcode={params.barcode} />
            ) : (
              <DbProductLoader foodId={params.foodId} />
            )}
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
