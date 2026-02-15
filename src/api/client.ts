import type { z } from "zod";
import { zGetProductDetails } from "./validators/getProductDetails";
import { zSearchProducts } from "./validators/searchProducts";
import { ApiError } from "./ApiError";

export class ApiClient {
  private static URL =
    process.env.NODE_ENV === "production"
      ? "https://world.openfoodfacts.org/api/v2"
      : "https://world.openfoodfacts.net/api/v2";

  private static HEADERS: HeadersInit = {
    "User-Agent": "Eatro/alpha (giuseppe@barillari.me)",
  };

  private async get<Z extends z.ZodType>(slug: `/${string}`, validator: Z) {
    const res = await fetch(`${ApiClient.URL}${slug}`, {
      headers: ApiClient.HEADERS,
    });

    if (!res.ok) {
      throw new ApiError(`Get request failed at: ${slug}`, res.status);
    }
    console.log(slug);

    const json = await res.json();

    return validator.parseAsync(json);
  }

  public getProductDetails(barcode: string, params: { lc?: string }) {
    const mParams = new URLSearchParams({
      ...params,
      fields:
        "lang,nutriments,product_name,brands,images,selected_images,serving_size",
    });

    return this.get(
      `/product/${encodeURIComponent(barcode)}?${mParams}`,
      zGetProductDetails,
    );
  }

  public searchProducts(query: string, params: { page?: number } = {}) {
    const mParams = new URLSearchParams({
      search_terms: query,
      fields: "code,lang,product_name,brands,selected_images",
      page_size: "24",
      ...(params.page !== undefined && { page: String(params.page) }),
    });

    return this.get(`/search?${mParams}`, zSearchProducts);
  }
}
