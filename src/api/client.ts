import type { z } from "zod";
import { zGetProductDetails } from "./validators/getProductDetails";
import { zGetProductFrontImage } from "./validators/productFrontImage";
import { zSearchProducts } from "./validators/searchProducts";
import { ApiError } from "./ApiError";

export class ApiClient {
  private static BASE =
    process.env.NODE_ENV === "production"
      ? "https://world.openfoodfacts.org"
      : "https://world.openfoodfacts.net";

  private static V2 = `${ApiClient.BASE}/api/v2`;

  private static HEADERS: HeadersInit = {
    "User-Agent": "Eatro/alpha (giuseppe@barillari.me)",
  };

  private async get<Z extends z.ZodType>(
    slug: `/${string}`,
    validator: Z,
    v1 = false,
  ) {
    const base = v1 ? ApiClient.BASE : ApiClient.V2;
    const res = await fetch(`${base}${slug}`, {
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

  public getProductFrontImage(barcode: string, params: { lc?: string }) {
    const mParams = new URLSearchParams({
      ...params,
      fields: "lang,images,selected_images",
    });

    return this.get(
      `/product/${encodeURIComponent(barcode)}?${mParams}`,
      zGetProductFrontImage,
    );
  }

  /**
   * Full-text search uses the v1 API (`/cgi/search.pl`) because the v2
   * `/search` endpoint does not support the `search_terms` parameter.
   */
  public searchProducts(query: string, params: { page?: number } = {}) {
    const mParams = new URLSearchParams({
      search_terms: query,
      search_simple: "1",
      action: "process",
      json: "1",
      fields: "code,lang,product_name,brands,selected_images",
      page_size: "24",
      ...(params.page !== undefined && { page: String(params.page) }),
    });

    return this.get(`/cgi/search.pl?${mParams}`, zSearchProducts, true);
  }
}
