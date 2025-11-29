import z from "zod";
import { zGetProductDetails } from "./validators/getProductDetails";

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
    const json = await res.json();

    return validator.parseAsync(json);
  }

  public getProductDetails(barcode: string, params: { lc?: string }) {
    const mParams = new URLSearchParams({
      ...params,
      fields: "nutriments,product_name,brands",
    });

    return this.get(
      `/product/${encodeURIComponent(barcode)}?${mParams}`,
      zGetProductDetails,
    );
  }
}
