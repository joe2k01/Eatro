import { z } from "zod";

const searchProductItemSchema = z
  .object({
    code: z.string(),
    lang: z.string().optional(),
    product_name: z.string().optional().default(""),
    brands: z.string().optional().default(""),
    selected_images: z
      .object({
        front: z
          .object({ display: z.record(z.string(), z.string()) })
          .optional(),
      })
      .optional(),
  })
  .transform(({ code, lang, product_name, brands, selected_images }) => {
    const imageUrls = selected_images?.front?.display;

    // Match the product details approach: use the product's own `lang`
    // field to pick the correct locale-specific image URL.
    const imageUrl =
      imageUrls && lang && lang in imageUrls
        ? imageUrls[lang]
        : undefined;

    return {
      code,
      name: product_name,
      brand: brands.split(",")[0] ?? "",
      imageUrl,
    };
  });

export type SearchProductItem = z.infer<typeof searchProductItemSchema>;

export const zSearchProducts = z
  .object({
    count: z.number(),
    page: z.coerce.number(),
    page_count: z.number(),
    page_size: z.number(),
    products: z.array(searchProductItemSchema),
  })
  .transform(({ count, page, page_count, page_size, products }) => ({
    count,
    page,
    pageCount: page_count,
    pageSize: page_size,
    products,
  }));

export type SearchProducts = z.infer<typeof zSearchProducts>;
