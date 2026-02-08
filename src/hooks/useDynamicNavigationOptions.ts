import { useLayoutEffect } from "react";
import { useNavigation, type ParamListBase } from "@react-navigation/native";
import type {
  NativeStackNavigationOptions,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

/**
 * Apply navigation options and re-apply whenever `options` changes.
 * Use this when options depend on props, state, or other reactive values.
 *
 * For options that never change, prefer `useStaticNavigationOptions` to avoid
 * re-running setOptions on every relevant re-render.
 */
export function useDynamicNavigationOptions(
  options: NativeStackNavigationOptions,
) {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  useLayoutEffect(() => {
    navigation.setOptions(options);
  }, [navigation, options]);
}
