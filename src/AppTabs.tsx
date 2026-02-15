import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { NavigatorScreenParams } from "@react-navigation/native";
import { Home, HomeParams } from "@screens/Home";
import { MyFoods, MyFoodsParams } from "@screens/MyFoods";
import { MealR, MealRParams } from "@screens/MealR";
import {
  SettingsNavigator,
  SettingsNavigatorParams,
} from "@screens/Settings";
import { nestedStackSharedOptions } from "@constants/navigation";
import { useAppStackNavigationOptions } from "@hooks/useAppStackNavigationOptions";
import { Header } from "@components/navigation/Header";
import { useTheme } from "@contexts/ThemeProvider";
import { useMemo } from "react";
import { Icon } from "@components/media/Icon";

// ── Home stack (tab bar stays visible) ──────────────────────────────

export type HomeStackParamsList = {
  Home: HomeParams;
  Settings: SettingsNavigatorParams;
};

const HomeStackNav = createNativeStackNavigator<HomeStackParamsList>();

function HomeStack() {
  const stackOptions = useAppStackNavigationOptions();

  return (
    <HomeStackNav.Navigator
      initialRouteName="Home"
      screenOptions={stackOptions}
    >
      <HomeStackNav.Screen name="Home" component={Home} />
      <HomeStackNav.Screen
        name="Settings"
        component={SettingsNavigator}
        options={nestedStackSharedOptions}
      />
    </HomeStackNav.Navigator>
  );
}

// ── Tab navigator ───────────────────────────────────────────────────

export type TabParamsList = {
  HomeTab: NavigatorScreenParams<HomeStackParamsList>;
  MyFoods: MyFoodsParams;
  MealR: MealRParams;
};

const Tab = createBottomTabNavigator<TabParamsList>();

export function AppTabs() {
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
    <Tab.Navigator initialRouteName="HomeTab" screenOptions={screenOptions}>
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          headerShown: false,
          tabBarLabel: "Home",
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
