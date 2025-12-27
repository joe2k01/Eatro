import type { ReactNode } from "react";
import { TextCaption } from "@components/typography/Text";
import { intoThemeDimension } from "@hooks/useThemeDimension";
import { useComposedStyle } from "@hooks/useComposedStyle";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";
import { useMemo } from "react";
import {
  StyleSheet,
  TextInput,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { HStack } from "@components/layout/HStack";
import { VStack } from "@components/layout/VStack";

export type FormInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TName;
  /** Optional label/caption displayed above the input. */
  label?: ReactNode;
  placeholder?: string;
  keyboardType?: TextInputProps["keyboardType"];
  unit?: string;
  /** Called with raw text as the user types. */
  onTextChange?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  /** Parse raw text into the form value. */
  parse: (text: string) => TFieldValues[TName];
  /** Format the form value into a string for display. */
  format?: (value: TFieldValues[TName]) => string;
  inputStyle?: TextStyle;
  containerStyle?: ViewStyle;
};

function defaultFormat(value: unknown): string {
  return value === undefined || value === null ? "" : String(value);
}

const baseStyles = StyleSheet.create({
  container: {
    borderRadius: intoThemeDimension(0.5),
    paddingHorizontal: intoThemeDimension(1.5),
    alignItems: "center",
    backgroundColor: "popover",
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    margin: 0,
    color: "fgPopover",
    paddingVertical: intoThemeDimension(1.5),
  },
  unit: {
    opacity: 0.72,
    marginLeft: 8,
  },
});

export function FormInput<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  placeholder,
  keyboardType = "default",
  unit,
  onTextChange,
  onFocus,
  onBlur,
  parse,
  format,
  inputStyle = {},
  containerStyle = {},
}: FormInputProps<TFieldValues, TName>) {
  const labelElement = useMemo(() => {
    if (typeof label === "string") {
      return <TextCaption>{label}</TextCaption>;
    }
    return label;
  }, [label]);

  const containerComposedStyle = useComposedStyle<ViewStyle>({
    base: baseStyles.container,
    props: containerStyle,
  });

  const inputComposedStyle = useComposedStyle<TextStyle>({
    base: baseStyles.input,
    props: inputStyle,
  });

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur: rhfOnBlur, value } }) => (
        <VStack backgroundColor="transparent" flex={1} gap={0.5}>
          {labelElement}
          <HStack style={containerComposedStyle} alignItems="center">
            <TextInput
              value={(format ?? (defaultFormat as never))(value)}
              onChangeText={(text) => {
                onTextChange?.(text);
                onChange(parse(text));
              }}
              onFocus={() => onFocus?.()}
              onBlur={() => {
                rhfOnBlur();
                onBlur?.();
              }}
              placeholder={placeholder}
              keyboardType={keyboardType}
              style={inputComposedStyle}
              returnKeyType="done"
            />
            {unit ? (
              <TextCaption color="fgPopover" style={baseStyles.unit}>
                {unit}
              </TextCaption>
            ) : null}
          </HStack>
        </VStack>
      )}
    />
  );
}
