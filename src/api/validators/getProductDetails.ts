import { z } from "zod";

type NutrimentsVariant = {
  energy?: number;
  carbohydrates?: number;
  fat?: number;
  protein?: number;
};

const servingsRegex = /^(\d+[\.,]?\d+?)([ a-zA-Z]+)?/g;

const nutrimentsSchema = z
  .object({
    "energy-kcal_100g": z.number(),
    "energy-kcal_serving": z.number(),
    carbohydrates_100g: z.number(),
    carbohydrates_serving: z.number(),
    fat_100g: z.number(),
    fat_serving: z.number(),
    protein_100g: z.number(),
    protein_serving: z.number(),
  })
  .partial()
  .transform((nutriments) => {
    const per100g: NutrimentsVariant = {};
    const perServing: NutrimentsVariant = {};

    for (const [key, value] of Object.entries(nutriments)) {
      if (value === undefined || value === null) continue;

      const [baseRaw, unit] = key.split("_") as [string, string];

      const base: keyof NutrimentsVariant =
        baseRaw === "energy-kcal"
          ? "energy"
          : (baseRaw as keyof NutrimentsVariant);

      switch (unit) {
        case "100g":
          per100g[base] = value;
          break;
        case "serving":
          perServing[base] = value;
          break;
        default:
          break;
      }
    }

    return {
      per100g: Object.keys(per100g).length ? per100g : undefined,
      perServing: Object.keys(perServing).length ? perServing : undefined,
    };
  });

export const zGetProductDetails = z
  .object({
    product: z.object({
      lang: z.string(),
      product_name: z.string(),
      brands: z.string(),
      serving_size: z.string().optional(),
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
      product_name,
      serving_size,
      nutriments,
      brands,
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

    const servingsMatch = servingsRegex.exec(serving_size ?? "");

    let servingSize: number | undefined;
    let servingsUnit: string | undefined;

    if (Array.isArray(servingsMatch)) {
      const [, servings, unit] = servingsMatch;
      const servingsNum = parseFloat(servings);

      servingSize = servingsNum;
      servingsUnit = unit;
    }

    return {
      imageUrl,
      imageRatio: dimensions.w / dimensions.h,
      name: product_name,
      servingSize,
      servingsUnit,
      nutriments: nutrimentsSchema.parse(nutriments),
      brand: brands.split(",")[0],
    };
  });

export type GetProductDetails = z.infer<typeof zGetProductDetails>;
