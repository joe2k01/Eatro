import { useCallback, useMemo } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { HStack } from "@components/layout/HStack";
import { Box } from "@components/layout/Box";
import { Icon } from "@components/media/Icon";
import { BackArrow } from "@components/navigation/BackArrow";
import { useTheme } from "@contexts/ThemeProvider";
import { BorderRadius, spacing } from "@constants/theme";

type SearchHeaderProps = {
  query: string;
  onQueryChange: (value: string) => void;
};

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

export function SearchHeader({ query, onQueryChange }: SearchHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack();

  const handleClear = useCallback(() => {
    onQueryChange("");
  }, [onQueryChange]);

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
        <BackArrow canGoBack={canGoBack} />
        <HStack style={inputContainerStyle} gap={0.5}>
          <Icon name="search" size="xs" color={theme.text.muted} />
          <TextInput
            style={inputStyle}
            value={query}
            placeholder="Search food..."
            placeholderTextColor={theme.text.muted}
            onChangeText={onQueryChange}
            autoFocus
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
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
