import { ReactNode, useMemo } from "react";
import {
  StyleSheet,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
  ViewStyle,
  TextStyle,
} from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useTheme } from "@contexts/ThemeProvider";
import { spacing, BorderRadius } from "@constants/theme";
import { Label, Caption } from "@components/typography/Text";

export type TextInputProps = Omit<RNTextInputProps, "style"> & {
  /** Label displayed above the input */
  label?: ReactNode;
  /** Unit displayed after the input (e.g., "kcal", "g") */
  unit?: string;
  /** Error message displayed below the input */
  error?: string;
  /** Style for the outer container */
  containerStyle?: ViewStyle;
  /** Style for the input field */
  inputStyle?: TextStyle;
  /** Use BottomSheetTextInput for inputs inside bottom sheets */
  inBottomSheet?: boolean;
};

const styles = StyleSheet.create({
  container: {
    gap: spacing(0.5),
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    paddingHorizontal: spacing(1.5),
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    margin: 0,
    paddingVertical: spacing(1.5),
  },
  unit: {
    opacity: 0.72,
    marginLeft: spacing(1),
  },
  error: {
    marginTop: spacing(0.25),
  },
});

export function TextInput({
  label,
  unit,
  error,
  containerStyle,
  inputStyle,
  inBottomSheet = false,
  ...inputProps
}: TextInputProps) {
  const theme = useTheme();

  const InputComponent = inBottomSheet ? BottomSheetTextInput : RNTextInput;

  const inputRowStyle = useMemo(
    () => [
      styles.inputRow,
      {
        backgroundColor: theme.surface.secondary,
        borderWidth: error ? 1 : 0,
        borderColor: error ? theme.semantic.destructive : undefined,
      },
    ],
    [theme, error],
  );

  const inputComputedStyle = useMemo(
    () => [styles.input, { color: theme.text.primary }, inputStyle],
    [theme.text.primary, inputStyle],
  );

  const labelElement = useMemo(() => {
    if (!label) return null;
    if (typeof label === "string") {
      return <Label style={{ color: theme.text.secondary }}>{label}</Label>;
    }
    return label;
  }, [label, theme.text.secondary]);

  return (
    <View style={[styles.container, containerStyle]}>
      {labelElement}

      <View style={inputRowStyle}>
        <InputComponent
          {...inputProps}
          style={inputComputedStyle}
          placeholderTextColor={theme.text.muted}
          returnKeyType={inputProps.returnKeyType ?? "done"}
        />
        {unit && (
          <Caption style={[styles.unit, { color: theme.text.secondary }]}>
            {unit}
          </Caption>
        )}
      </View>

      {error && (
        <Caption style={[styles.error, { color: theme.semantic.destructive }]}>
          {error}
        </Caption>
      )}
    </View>
  );
}
