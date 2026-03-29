import { z } from "zod";

const offImageEntrySchema = z.object({
  sizes: z.object({
    full: z.object({
      h: z.number(),
      w: z.number(),
    }),
  }),
});

export type OffProductFrontImageFields = {
  lang: string;
  images: Record<string, z.infer<typeof offImageEntrySchema>>;
  selected_images: {
    front: { display: Record<string, string> };
  };
};

/**
 * Derives front-pack image URL and aspect ratio from Open Food Facts `product`
 * fields (shared by full product details and slim image-only responses).
 */
export function frontImageFromOffProductFields(
  product: OffProductFrontImageFields,
): { imageUrl?: string; imageRatio: number } {
  const {
    images,
    selected_images: {
      front: { display: imageUrls },
    },
    lang,
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
    imageUrl,
    imageRatio: dimensions.w / dimensions.h,
  };
}

export const zGetProductFrontImage = z
  .object({
    product: z.object({
      lang: z.string(),
      images: z.record(z.string(), offImageEntrySchema).optional(),
      selected_images: z.object({
        front: z.object({ display: z.record(z.string(), z.string()) }),
      }),
    }),
  })
  .transform(({ product }) =>
    frontImageFromOffProductFields({
      lang: product.lang,
      images: product.images ?? {},
      selected_images: product.selected_images,
    }),
  );

export type GetProductFrontImage = z.infer<typeof zGetProductFrontImage>;
