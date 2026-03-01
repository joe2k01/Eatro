import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Suspense, useMemo } from "react";
import { match, P } from "ts-pattern";
import { useParams } from "@hooks/useParams";
import { ErrorBoundary } from "@components/feedback";
import { ProductLoader } from "./ProductLoader";
import { ProductError } from "./ProductError";
import { ApiProductLoader } from "./ApiProductLoader";
import { DbProductLoader } from "./DbProductLoader";

export type ProductParams = { barcode: string } | { foodId: number };

export function Product() {
  const params = useParams<ProductParams>();

  const content = useMemo(
    () =>
      match(params)
        .with({ barcode: P.string }, ({ barcode }) => (
          <ApiProductLoader barcode={barcode} />
        ))
        .with({ foodId: P.number }, ({ foodId }) => (
          <DbProductLoader foodId={foodId} />
        ))
        .exhaustive(),
    [params],
  );

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
