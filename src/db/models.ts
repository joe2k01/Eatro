import type { FoodSource, MealType, SyncStatus } from "./enums";

export type FoodRow = {
  id: number;
  name: string;
  brand: string | null;
  barcode: string | null;
  calories_per_gram: number;
  protein_per_gram: number;
  carbs_per_gram: number;
  fat_per_gram: number;
  source: FoodSource;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
};

export type FoodEntryRow = {
  id: number;
  food_id: number;
  quantity_grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  eaten_at: number;
  day_start_ts: number;
  meal_type: MealType;
  sync_status: SyncStatus;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
};

export type MealRow = {
  id: number;
  name: string;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
};

export type MealItemRow = {
  id: number;
  meal_id: number;
  food_id: number;
  quantity_grams: number;
};

export type DayRow = {
  day_start_ts: number;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  updated_at: number;
};
