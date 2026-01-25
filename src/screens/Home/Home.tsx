import { SafeVStack } from "@components/SafeVStack";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { useStaticNavigationOptions } from "@hooks/useStaticNavigationOptions";
import { format } from "date-fns";
import { AvatarButton } from "./components/AvatarButton";
import { Display, Caption, Title } from "@components/typography/Text";
import { useStorage } from "@hooks/useStorage";
import { Goals } from "@constants/storage/validators";
import { useTheme } from "@contexts/ThemeProvider";
import { VStack } from "@components/layout/VStack";
import { HStack } from "@components/layout/HStack";
import { DonutChart, useDonut } from "@components/charts";
import { MacroProgress } from "./components/MacroProgress";
import { useMemo } from "react";
import { Button } from "@components/buttons/Button";
import { Icon } from "@components/media/Icon";
import { useNavigation } from "@react-navigation/native";
import { useGetToday } from "@db/hooks/useGetToday";

export const homeHeaderOptions = {
  headerTitle: () => <Title>Today, {format(new Date(), "MMMM do")}</Title>,
  headerLeft: () => <AvatarButton />,
} satisfies NativeStackNavigationOptions;

const defaultGoals: Goals = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 50,
};

const macroKeys: Exclude<keyof Goals, "calories">[] = [
  "protein",
  "carbs",
  "fat",
];

export function Home() {
  useStaticNavigationOptions(homeHeaderOptions);

  const navigation = useNavigation();
  const { macros, meals: _meals } = useGetToday();

  const day = {
    total_calories: macros?.energy ?? 0,
    total_protein: macros?.proteins ?? 0,
    total_carbs: macros?.carbohydrates ?? 0,
    total_fat: macros?.fat ?? 0,
  };

  const cals = useMemo(() => {
    return Math.round(day.total_calories);
  }, [day.total_calories]);

  const { data: goals } = useStorage("goals", defaultGoals);

  const theme = useTheme();

  const donutData = useDonut([
    { key: "calories", value: cals, color: theme.semantic.accent },
  ]);

  const overCalories = useMemo(() => {
    return cals > (goals?.calories ?? 0);
  }, [cals, goals?.calories]);

  const caloriesTextColor = overCalories
    ? theme.semantic.destructive
    : theme.text.primary;
  const captionTextColor = overCalories
    ? theme.semantic.destructive
    : theme.text.secondary;

  return (
    <SafeVStack
      guard="bottom"
      paddingHorizontal={2}
      paddingTop={1}
      gap={4}
      scrollable
    >
      {/* Header */}
      <VStack
        borderRadius={10}
        backgroundColor={theme.surface.secondary}
        padding={2}
        gap={2}
      >
        <HStack
          backgroundColor="transparent"
          alignItems="center"
          justifyContent="space-between"
        >
          <VStack backgroundColor={"transparent"}>
            <Display color={caloriesTextColor}>
              {cals} / {goals?.calories}
            </Display>
            <Caption color={captionTextColor}>kcal remaining</Caption>
          </VStack>
          <DonutChart
            donutData={donutData}
            width={"30%"}
            total={goals?.calories}
          />
        </HStack>
        <HStack
          justifyContent="space-between"
          alignItems="center"
          backgroundColor="transparent"
        >
          {/* TODO: Day totals are now derived from meals (days table removed). */}
          {macroKeys.map((macro) => (
            <MacroProgress
              key={macro}
              label={macro}
              consumedGrams={
                macro === "protein"
                  ? (day?.total_protein ?? 0)
                  : macro === "carbs"
                    ? (day?.total_carbs ?? 0)
                    : (day?.total_fat ?? 0)
              }
            />
          ))}
        </HStack>
      </VStack>
      {/* Actions */}
      <VStack gap={1.5}>
        <HStack gap={1.5}>
          <Button
            style={{ flex: 1 }}
            leftIcon={<Icon name="search" size="xs" variant="primary" />}
          >
            Search
          </Button>
          <Button
            style={{ flex: 1 }}
            leftIcon={
              <Icon community name="barcode" size="xs" variant="secondary" />
            }
            variant="secondary"
            inverted
            onPress={() => navigation.navigate("Scanner")}
          >
            Scan
          </Button>
        </HStack>
        <Button
          variant="primary"
          inverted
          leftIcon={
            <Icon community name="cart-outline" size="xs" variant="primary" />
          }
        >
          Mealr
        </Button>
      </VStack>

      {/* Log */}
      <VStack>
        <HStack justifyContent="space-between" alignItems="center">
          <Title>Recent meals</Title>
          <Button
            onPress={() => {
              console.log("add meal");
            }}
            variant="primary"
            inverted
            leftIcon={<Icon name="add" size="xs" variant="primary" />}
          >
            Add meal
          </Button>
        </HStack>
      </VStack>
    </SafeVStack>
  );
}

export type HomeParams = undefined;
