import { z } from "zod";

const productFrontImageEntrySchema = z.object({
  sizes: z.object({
    full: z.object({
      h: z.number(),
      w: z.number(),
    }),
  }),
});

export type ProductFrontImageFields = {
  lang: string;
  images: Record<string, z.infer<typeof productFrontImageEntrySchema>>;
  selected_images: {
    front: { display: Record<string, string> };
  };
};

/**
 * Derives front-pack image URL and aspect ratio from Open Food Facts `product`
 * fields (shared by full product details and slim image-only responses).
 */
export function frontImageFromProductFields(product: ProductFrontImageFields): {
  imageUrl?: string;
  imageRatio: number;
} {
  const {
    images,
    selected_images: {
      front: { display: imageUrls },
    },
    lang,
  } = product;

  const fallbackLang = Object.entries(imageUrls)[0]?.[0];
  const fallbackDisplay = fallbackLang
    ? { lang: fallbackLang, url: imageUrls[fallbackLang] }
    : undefined;
  const chosenDisplay =
    lang in imageUrls ? { lang, url: imageUrls[lang] } : fallbackDisplay;
  const imageUrl = chosenDisplay?.url;

  let dimensions: { w: number; h: number } = { w: 1, h: 1 };

  if (chosenDisplay) {
    const localizedFrontKey = `front_${chosenDisplay.lang}`;
    if (localizedFrontKey in images) {
      dimensions = images[localizedFrontKey].sizes.full;
    }
  } else if ("front" in images) {
    dimensions = images["front"].sizes.full;
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
      images: z.record(z.string(), productFrontImageEntrySchema).optional(),
      selected_images: z.object({
        front: z.object({ display: z.record(z.string(), z.string()) }),
      }),
    }),
  })
  .transform(({ product }) =>
    frontImageFromProductFields({
      lang: product.lang,
      images: product.images ?? {},
      selected_images: product.selected_images,
    }),
  );

export type GetProductFrontImage = z.infer<typeof zGetProductFrontImage>;
