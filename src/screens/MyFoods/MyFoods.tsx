import { useCallback, useMemo, useState } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  TabBar,
  TabView,
  type Route,
  type TabBarProps,
} from "react-native-tab-view";
import { SafeVStack } from "@components/SafeVStack";
import { ScreenHeader } from "@components/navigation/ScreenHeader";
import { spacing } from "@constants/theme";
import { Title } from "@components/typography/Text";
import { IconButton } from "@components/buttons/IconButton";
import type { MyFoodsStackParamsList } from "../../AppTabs";
import { MY_FOODS_ROUTES } from "./constants/routes";
import { myFoodsStyles, TAB_VIEW_COMMON_OPTIONS } from "./constants/styles";
import { useMyFoodsTabBarTheme } from "./hooks/useMyFoodsTabBarTheme";
import { FoodsScene } from "./scenes/FoodsScene";
import { MealsScene } from "./scenes/MealsScene";

const myFoodsHeaderAddNoop = () => undefined;

const styles = StyleSheet.create({
  screenHeader: {
    paddingHorizontal: spacing(2),
  },
});

export function MyFoods() {
  const layout = useWindowDimensions();
  const navigation =
    useNavigation<NativeStackNavigationProp<MyFoodsStackParamsList>>();

  const [index, setIndex] = useState(0);
  const [filterQuery, setFilterQuery] = useState("");

  const navigateToCreateFood = useCallback(() => {
    navigation.navigate("CreateFood");
  }, [navigation]);

  const tabBarTheme = useMyFoodsTabBarTheme();

  const navigationState = useMemo(
    () => ({ index, routes: MY_FOODS_ROUTES }),
    [index],
  );

  const initialLayout = useMemo(
    () => ({ width: layout.width }),
    [layout.width],
  );

  const renderScene = useCallback(
    ({ route }: { route: Route }) => {
      switch (route.key) {
        case "foods":
          return (
            <FoodsScene
              filterQuery={filterQuery}
              onFilterQueryChange={setFilterQuery}
              onAddFirstFood={navigateToCreateFood}
            />
          );
        case "meals":
          return (
            <MealsScene
              filterQuery={filterQuery}
              onFilterQueryChange={setFilterQuery}
            />
          );
        default:
          return null;
      }
    },
    [filterQuery, navigateToCreateFood],
  );

  const renderTabBar = useCallback(
    (props: TabBarProps<Route>) => (
      <TabBar
        {...props}
        style={tabBarTheme.styles.bar}
        indicatorStyle={tabBarTheme.styles.indicator}
        activeColor={tabBarTheme.activeColor}
        inactiveColor={tabBarTheme.inactiveColor}
        pressColor={tabBarTheme.pressColor}
        contentContainerStyle={myFoodsStyles.tabBarContent}
        android_ripple={tabBarTheme.androidRipple}
      />
    ),
    [tabBarTheme],
  );

  return (
    <SafeVStack guard="bottom" flex={1} paddingTop={1}>
      <ScreenHeader
        left={null}
        center={<Title>My Foods</Title>}
        right={
          <IconButton
            name="add"
            variant="tertiary"
            onPress={index === 0 ? navigateToCreateFood : myFoodsHeaderAddNoop}
          />
        }
        style={styles.screenHeader}
      />
      <TabView
        navigationState={navigationState}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        renderTabBar={renderTabBar}
        style={myFoodsStyles.tabView}
        keyboardDismissMode="on-drag"
        commonOptions={TAB_VIEW_COMMON_OPTIONS}
      />
    </SafeVStack>
  );
}

export type MyFoodsParams = undefined;
