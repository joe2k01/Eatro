import { z } from "zod";

export const zGetProductDetails = z
  .object({
    product: z.object({
      lang: z.string(),
      product_name: z.string(),
      brands: z.string(),
      nutriments: z.record(
        z.string(),
        z.number().or(z.string()).or(z.array(z.string())),
      ),
      images: z.record(
        z.string(),
        z.object({
          sizes: z.object({
            full: z.object({
              h: z.number(),
              w: z.number(),
            }),
          }),
        }),
      ),
      selected_images: z.object({
        front: z.object({ display: z.record(z.string(), z.string()) }),
      }),
    }),
  })
  .transform(({ product }) => {
    const {
      images,
      selected_images: {
        front: { display: imageUrls },
      },
      lang,
      ...rest
    } = product;

    const imageUrl = lang in imageUrls ? imageUrls[lang] : undefined;

    let dimensions: { w: number; h: number } = { w: 1, h: 1 };

    if ("front" in images) {
      dimensions = images["front"].sizes.full;
    }

    const computedFront = `front_${lang}`;
    if (computedFront in images) {
      dimensions = images[computedFront].sizes.full;
    }

    return {
      ...rest,
      imageUrl,
      imageRatio: dimensions.w / dimensions.h,
    };
  });

export type GetProductDetails = z.infer<typeof zGetProductDetails>;
