import { z } from "zod";

export enum FoodSource {
  Api = 0,
  Manual = 1,
}

export enum MealType {
  Breakfast = 0,
  Lunch = 1,
  Dinner = 2,
  Snack = 3,
  Custom = 4,
}

export const FoodSourceSchema = z.enum(FoodSource);
export const MealTypeSchema = z.enum(MealType);
