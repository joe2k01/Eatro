import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { Home, HomeParams } from "@screens/Home";
import { MyFoods, MyFoodsParams } from "@screens/MyFoods";
import { MealR, MealRParams } from "@screens/MealR";
import { Header } from "@components/navigation/Header";
import { useTheme } from "@contexts/ThemeProvider";
import { useMemo } from "react";
import { Icon } from "@components/media/Icon";

export type TabParamsList = {
  Home: HomeParams;
  MyFoods: MyFoodsParams;
  MealR: MealRParams;
};

const Tab = createBottomTabNavigator<TabParamsList>();

export function MainTabs() {
  const theme = useTheme();

  const screenOptions = useMemo<BottomTabNavigationOptions>(
    () => ({
      headerShown: true,
      header: Header,
      tabBarActiveTintColor: theme.semantic.primary,
      tabBarInactiveTintColor: theme.text.muted,
      tabBarStyle: {
        backgroundColor: theme.surface.secondary,
        borderTopColor: theme.surface.tertiary,
      },
      sceneStyle: {
        backgroundColor: theme.surface.primary,
      },
    }),
    [theme],
  );

  return (
    <Tab.Navigator initialRouteName="Home" screenOptions={screenOptions}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="home" size="s" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyFoods"
        component={MyFoods}
        options={{
          tabBarLabel: "My Foods",
          tabBarIcon: ({ color }) => (
            <Icon community name="food-apple" size="s" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MealR"
        component={MealR}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon community name="cart-outline" size="s" color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
