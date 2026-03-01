import { useSuspenseQuery } from "@tanstack/react-query";
import { useLocales } from "expo-localization";
import { useApiClient } from "@api/ApiClient";
import { useUpsertFood } from "@db/hooks/useUpsertFood";
import { ProductContent } from "./ProductContent";

export function ApiProductLoader({ barcode }: { barcode: string }) {
  const [locale] = useLocales();
  const { client } = useApiClient();

  const { data } = useSuspenseQuery({
    queryKey: ["product", barcode, locale.languageCode ?? "en"],
    queryFn: () =>
      client.getProductDetails(barcode, {
        lc: locale.languageCode ?? "en",
      }),
  });

  const foodId = useUpsertFood(data, barcode);

  return (
    <ProductContent
      foodId={foodId}
      name={data.name}
      brand={data.brand}
      imageUrl={data.imageUrl}
      imageRatio={data.imageRatio}
      nutriments={data.nutriments}
      servingSize={data.servingSize}
      servingsUnit={data.servingsUnit}
    />
  );
}
