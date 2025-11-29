export class ApiClient {
  private static URL =
    process.env.NODE_ENV === "production"
      ? "https://world.openfoodfacts.org/api/v2"
      : "https://world.openfoodfacts.net/api/v2";

  private static HEADERS: HeadersInit = {
    "User-Agent": "Eatro/alpha (giuseppe@barillari.me)",
  };

  private get(slug: `/${string}`) {
    return fetch(`${ApiClient.URL}${slug}`, { headers: ApiClient.HEADERS });
  }

  public getProductDetails(barcode: string, params: { lc?: string }) {
    const mParams = new URLSearchParams({
      ...params,
      fields: "nutriments,product_name,brands",
    });

    return this.get(`/product/${encodeURIComponent(barcode)}?${mParams}`);
  }
}
