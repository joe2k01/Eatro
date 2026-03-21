import type { GetProductDetails } from "@api/validators/getProductDetails";

export type MealRSessionItem = {
  id: string;
  foodId: number;
  name: string;
  brand: string;
  nutriments: GetProductDetails["nutriments"];
  selectedUnit?: keyof GetProductDetails["nutriments"];
  servingSize: number;
  servingsUnit?: string;
  quantity: number;
  energy: number;
  proteins: number;
  carbohydrates: number;
  fat: number;
};

export type MealRSessionTotals = {
  energy: number;
  proteins: number;
  carbohydrates: number;
  fat: number;
};
