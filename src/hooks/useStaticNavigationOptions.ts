import { useLayoutEffect, useRef } from "react";
import { useNavigation, type ParamListBase } from "@react-navigation/native";
import type {
  NativeStackNavigationOptions,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

/**
 * Apply a statically-defined options object once on mount.
 *
 * Important: `options` should be a stable reference (define it at module scope),
 * because this intentionally does not re-run on re-render.
 */
export function useStaticNavigationOptions(
  options: NativeStackNavigationOptions,
) {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const optionsRef = useRef(options);

  useLayoutEffect(() => {
    navigation.setOptions(optionsRef.current);
  }, [navigation]);
}


