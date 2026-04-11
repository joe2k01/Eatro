import { useQuery } from "@tanstack/react-query";
import { useLocales } from "expo-localization";
import { useApiClient } from "@api/ApiClient";

const STALE_MS = 1000 * 60 * 60 * 24;

export function useOpenFoodFactsFrontImage(barcode: string | null | undefined) {
  const [locale] = useLocales();
  const { client } = useApiClient();
  const lc = locale.languageCode ?? "en";
  const trimmed = barcode?.trim() ?? "";

  return useQuery({
    queryKey: ["product-front-image", trimmed, lc],
    queryFn: () => client.getProductFrontImage(trimmed, { lc }),
    enabled: trimmed.length > 0,
    staleTime: STALE_MS,
    retry: 1,
  });
}
