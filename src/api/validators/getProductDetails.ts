import z from "zod";

export const zGetProductDetails = z
  .object({
    product: z.object({
      product_name: z.string(),
      brands: z.string(),
      nutriments: z.record(
        z.string(),
        z.number().or(z.string()).or(z.array(z.string())),
      ),
    }),
  })
  .transform(({ product }) => ({ ...product }));

export type GetProductDetails = z.infer<typeof zGetProductDetails>;
