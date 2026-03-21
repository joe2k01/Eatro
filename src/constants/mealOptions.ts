import { MealType } from "@db/schemas";
import type { PopupButtonOption } from "../../modules/popup-button";

export const mealOptions: PopupButtonOption<MealType>[] = [
  { label: "Breakfast", value: MealType.Breakfast },
  { label: "Lunch", value: MealType.Lunch },
  { label: "Dinner", value: MealType.Dinner },
  { label: "Snack", value: MealType.Snack },
  { label: "Custom", value: MealType.Custom },
];
