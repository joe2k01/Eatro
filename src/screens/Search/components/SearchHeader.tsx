import { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { HStack } from "@components/layout/HStack";
import { Box } from "@components/layout/Box";
import { Icon } from "@components/media/Icon";
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
    paddingHorizontal: spacing(1.5),
    overflow: "hidden",
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: spacing(1.5),
    paddingHorizontal: spacing(1.5),
  },
  scanButton: {
    borderRadius: BorderRadius.full,
    padding: spacing(1),
    alignItems: "center",
    justifyContent: "center",
  },
  scanButtonPressed: {
    opacity: 0.8,
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
  const inputRef = useRef<TextInput>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hasText, setHasText] = useState(false);

  const handleChangeText = useCallback(
    (value: string) => {
      setHasText(value.length > 0);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        headerNavigation.setParams({ query: value.trim() });
      }, DEBOUNCE_MS);
    },
    [headerNavigation],
  );

  const handleClear = useCallback(() => {
    inputRef.current?.clear();
    setHasText(false);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    headerNavigation.setParams({ query: "" });
  }, [headerNavigation]);

  const handleScanPress = useCallback(() => {
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

  const inputStyle = useMemo(
    () => [styles.input, { color: theme.text.primary }],
    [theme.text.primary],
  );

  const scanButtonStyle = useMemo(
    () => [styles.scanButton, { backgroundColor: theme.semantic.primary }],
    [theme.semantic.primary],
  );

  const scanButtonPressedStyle = useMemo(
    () => [scanButtonStyle, styles.scanButtonPressed],
    [scanButtonStyle],
  );

  return (
    <Box style={containerStyle}>
      <HStack style={styles.row} gap={1.5} alignItems="center">
        <BackArrow canGoBack={!!back} />
        <HStack style={inputContainerStyle} gap={0.5}>
          <Icon name="search" size="xs" color={theme.text.muted} />
          <TextInput
            ref={inputRef}
            style={inputStyle}
            placeholder="Search food..."
            placeholderTextColor={theme.text.muted}
            onChangeText={handleChangeText}
            autoFocus
            returnKeyType="search"
            autoCorrect={false}
          />
          {hasText && (
            <Pressable onPress={handleClear}>
              <Icon name="close" size="xs" color={theme.text.muted} />
            </Pressable>
          )}
        </HStack>
        <Pressable
          style={({ pressed }) =>
            pressed ? scanButtonPressedStyle : scanButtonStyle
          }
          onPress={handleScanPress}
        >
          <Icon community name="barcode-scan" color={theme.text.inverse} />
        </Pressable>
      </HStack>
    </Box>
  );
}
