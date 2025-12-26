import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { Header } from "@components/navigation/Header";

/**
 * Shared options for root-level routes that render a nested navigator.
 * The nested navigator should own its own header/back/title behavior.
 */
export const nestedStackSharedOptions: NativeStackNavigationOptions = {
  headerShown: false,
};

export function createAppStackNavigationOptions(): NativeStackNavigationOptions {
  return {
    headerShown: true,
    header: Header,
  };
}


