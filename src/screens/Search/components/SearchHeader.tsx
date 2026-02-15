import { useCallback, useMemo, useRef } from "react";
import { StyleSheet, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { HStack } from "@components/layout/HStack";
import { Box } from "@components/layout/Box";
import { Icon } from "@components/media/Icon";
import { IconButton } from "@components/buttons/IconButton";
import { BackArrow } from "@components/navigation/BackArrow";
import { useTheme } from "@contexts/ThemeProvider";
import { BorderRadius, spacing } from "@constants/theme";

const DEBOUNCE_MS = 400;

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing(2),
    paddingBottom: spacing(1),
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: spacing(1.5),
    overflow: "hidden",
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: spacing(1),
    paddingHorizontal: spacing(2),
  },
});

/**
 * Custom header for the Search screen.
 *
 * Must be set as the `header` option on the screen definition (not via
 * `setOptions`) to avoid a hooks-count mismatch with the default Header.
 *
 * Owns the TextInput and debounce timer. The debounced query is pushed
 * to the screen via `navigation.setParams({ query })`.
 */
export function SearchHeader({
  back,
  navigation: headerNavigation,
}: NativeStackHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChangeText = useCallback(
    (value: string) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        // Use headerNavigation (bound to the current screen) for setParams
        // so the route params update correctly.
        headerNavigation.setParams({ query: value.trim() });
      }, DEBOUNCE_MS);
    },
    [headerNavigation],
  );

  const handleScanPress = useCallback(() => {
    // Use global navigation for cross-navigator routes like Scanner.
    navigation.navigate("Scanner");
  }, [navigation]);

  const containerStyle = useMemo(
    () => ({ paddingTop: insets.top }),
    [insets.top],
  );

  const inputContainerStyle = useMemo(
    () => [
      styles.inputContainer,
      {
        backgroundColor: theme.surface.secondary,
        borderRadius: BorderRadius.full,
      },
    ],
    [theme.surface.secondary],
  );

  return (
    <Box style={containerStyle}>
      <HStack style={styles.row} gap={1} alignItems="center">
        <BackArrow canGoBack={!!back} />
        <HStack style={inputContainerStyle}>
          <Icon name="search" size="xs" color={theme.text.muted} />
          <TextInput
            style={[styles.input, { color: theme.text.primary }]}
            placeholder="Search food..."
            placeholderTextColor={theme.text.muted}
            onChangeText={handleChangeText}
            autoFocus
            returnKeyType="search"
            autoCorrect={false}
          />
        </HStack>
        <IconButton
          name="qr-code-scanner"
          size="s"
          variant="ghost"
          onPress={handleScanPress}
        />
      </HStack>
    </Box>
  );
}
