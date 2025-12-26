import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { Header } from "@components/navigation/Header";

/**
 * Shared options for root-level routes that render a nested navigator.
 * The nested navigator should own its own header/back/title behavior.
 */
export const nestedStackSharedOptions: NativeStackNavigationOptions = {
  headerShown: false,
};

/**
 * Factory for the app-wide native-stack `screenOptions`.
 *
 * Why a function?
 * - Keeps stack setup consistent across root + nested navigators.
 * - Allows "static generation" of a single options object at module scope
 *   (e.g. `const StackOptions = createAppStackNavigationOptions()`).
 *
 * How it works with the header pattern:
 * - Always uses the shared `Header` renderer, which reads `options.title`,
 *   `options.headerTitle`, `options.headerLeft`, and `options.headerRight`.
 * - Individual screens can then set their static header config on mount via
 *   `useStaticNavigationOptions(...)`.
 */
export function createAppStackNavigationOptions(): NativeStackNavigationOptions {
  return {
    headerShown: true,
    header: Header,
  };
}
