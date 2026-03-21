import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { NavigatorScreenParams } from "@react-navigation/native";
import { Home, HomeParams } from "@screens/Home";
import { MyFoods, MyFoodsParams, CreateFood } from "@screens/MyFoods";
import { MealR, MealRParams } from "@screens/MealR";
import { Search, SearchHeader, SearchParams } from "@screens/Search";
import { SettingsNavigator, SettingsNavigatorParams } from "@screens/Settings";
import { nestedStackSharedOptions } from "@constants/navigation";
import { useAppStackNavigationOptions } from "@hooks/useAppStackNavigationOptions";
import { useTheme } from "@contexts/ThemeProvider";
import { useMemo } from "react";
import { Icon } from "@components/media/Icon";

// ── Home stack (tab bar stays visible) ──────────────────────────────

export type HomeStackParamsList = {
  Home: HomeParams;
  Search: SearchParams;
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
        name="Search"
        component={Search}
        options={{ header: SearchHeader }}
      />
      <HomeStackNav.Screen
        name="Settings"
        component={SettingsNavigator}
        options={nestedStackSharedOptions}
      />
    </HomeStackNav.Navigator>
  );
}

// ── My Foods stack ──────────────────────────────────────────────────

export type MyFoodsStackParamsList = {
  MyFoods: MyFoodsParams;
  CreateFood: undefined;
  Search: SearchParams;
};

const MyFoodsStackNav = createNativeStackNavigator<MyFoodsStackParamsList>();

function MyFoodsStack() {
  const stackOptions = useAppStackNavigationOptions();

  return (
    <MyFoodsStackNav.Navigator
      initialRouteName="MyFoods"
      screenOptions={stackOptions}
    >
      <MyFoodsStackNav.Screen name="MyFoods" component={MyFoods} />
      <MyFoodsStackNav.Screen name="CreateFood" component={CreateFood} />
      <MyFoodsStackNav.Screen
        name="Search"
        component={Search}
        options={{ header: SearchHeader }}
      />
    </MyFoodsStackNav.Navigator>
  );
}

// ── MealR stack ─────────────────────────────────────────────────────

export type MealRStackParamsList = {
  MealR: MealRParams;
};

const MealRStackNav = createNativeStackNavigator<MealRStackParamsList>();

function MealRStack() {
  const stackOptions = useAppStackNavigationOptions();

  return (
    <MealRStackNav.Navigator
      initialRouteName="MealR"
      screenOptions={stackOptions}
    >
      <MealRStackNav.Screen
        name="MealR"
        component={MealR}
        options={{ headerShown: false }}
      />
    </MealRStackNav.Navigator>
  );
}

// ── Tab navigator ───────────────────────────────────────────────────

export type TabParamsList = {
  HomeTab: NavigatorScreenParams<HomeStackParamsList>;
  MyFoodsTab: NavigatorScreenParams<MyFoodsStackParamsList>;
  MealRTab: NavigatorScreenParams<MealRStackParamsList>;
};

const Tab = createBottomTabNavigator<TabParamsList>();

export function AppTabs() {
  const theme = useTheme();

  const screenOptions = useMemo<BottomTabNavigationOptions>(
    () => ({
      headerShown: false,
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
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <Icon name="home" size="s" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyFoodsTab"
        component={MyFoodsStack}
        options={{
          tabBarLabel: "My Foods",
          tabBarIcon: ({ color }) => (
            <Icon community name="food-apple" size="s" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MealRTab"
        component={MealRStack}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon community name="cart-outline" size="s" color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
