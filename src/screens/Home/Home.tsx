import { SafeVStack } from "@components/SafeVStack";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { useStaticNavigationOptions } from "@hooks/useStaticNavigationOptions";
import { format } from "date-fns";
import { AvatarButton } from "./components/AvatarButton";
import { Massive, TextCaption, Title1 } from "@components/typography/Text";
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

export const homeHeaderOptions = {
  headerTitle: () => <Title1>Today, {format(new Date(), "MMMM do")}</Title1>,
  headerLeft: () => <AvatarButton />,
} satisfies NativeStackNavigationOptions;

const defaultGoals: Goals = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 50,
};

const macros: Exclude<keyof Goals, "calories">[] = ["protein", "carbs", "fat"];

export function Home() {
  useStaticNavigationOptions(homeHeaderOptions);

  const navigation = useNavigation();

  // const dayStartTs = useMemo(() => {
  //   return UnixSeconds.now().dayStartUtc();
  // }, []);

  // const { data: day } = useDailySummary(dayStartTs.seconds);
  const day = {
    total_calories: 1000,
    total_protein: 50,
    total_carbs: 100,
    total_fat: 20,
  };

  const cals = useMemo(() => {
    return Math.round(day?.total_calories ?? 0);
  }, [day?.total_calories]);

  const { data: goals } = useStorage("goals", defaultGoals);

  const { card, accent } = useTheme();

  const donutData = useDonut([{ key: "calories", value: cals, color: accent }]);

  const overCalories = useMemo(() => {
    return cals > (goals?.calories ?? 0);
  }, [cals, goals?.calories]);

  return (
    <SafeVStack
      guard="bottom"
      paddingHorizontal={2}
      paddingTop={1}
      gap={4}
      scrollable
    >
      {/* Header */}
      <VStack borderRadius={10} backgroundColor={card} padding={2} gap={2}>
        <HStack
          backgroundColor="transparent"
          alignItems="center"
          justifyContent="space-between"
        >
          <VStack backgroundColor={"transparent"}>
            <Massive color={overCalories ? "destructive" : "fg"}>
              {cals} / {goals?.calories}
            </Massive>
            <TextCaption color={overCalories ? "destructive" : "fgCard"}>
              kcal remaining
            </TextCaption>
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
          {/*
            Use the `days` table for fast daily access; values are updated incrementally by entry mutations.
          */}
          {macros.map((macro) => (
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
            flex={1}
            leftIcon={<Icon name="search" size="xs" variant="primary" />}
          >
            Search
          </Button>
          <Button
            flex={1}
            leftIcon={
              <Icon
                community
                name="barcode"
                size="xs"
                variant="secondaryTranslucent"
              />
            }
            variant="secondaryTranslucent"
            onPress={() => navigation.navigate("Scanner")}
          >
            Scan
          </Button>
        </HStack>
        <Button
          variant="primaryTranslucent"
          leftIcon={
            <Icon
              community
              name="cart-outline"
              size="xs"
              variant="primaryTranslucent"
            />
          }
        >
          Mealr
        </Button>
      </VStack>

      {/* Log */}
      <VStack>
        <HStack justifyContent="space-between" alignItems="center">
          <Title1>Recent meals</Title1>
          <Button
            onPress={() => {
              console.log("add meal");
            }}
            variant="primaryTranslucent"
            leftIcon={
              <Icon name="add" size="xs" variant="primaryTranslucent" />
            }
          >
            Add meal
          </Button>
        </HStack>
      </VStack>
    </SafeVStack>
  );
}

export type HomeParams = undefined;
