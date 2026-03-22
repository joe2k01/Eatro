import type { Route } from "react-native-tab-view";

export const MY_FOODS_ROUTE_FOODS: Route = { key: "foods", title: "Foods" };
export const MY_FOODS_ROUTE_MEALS: Route = { key: "meals", title: "Meals" };
export const MY_FOODS_ROUTES: Route[] = [
  MY_FOODS_ROUTE_FOODS,
  MY_FOODS_ROUTE_MEALS,
];
