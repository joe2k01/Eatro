import type { ReactNode } from "react";
import { TextCaption } from "@components/typography/Text";
import { intoThemeDimension } from "@hooks/useThemeDimension";
import { useComposedStyle } from "@hooks/useComposedStyle";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";
import { useCallback, useMemo, useState } from "react";
import {
  StyleSheet,
  TextInput,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { HStack } from "@components/layout/HStack";
import { VStack } from "@components/layout/VStack";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";

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

type ControlledInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  /** Optional label/caption displayed above the input. */
  label?: ReactNode;
  placeholder?: string;
  keyboardType?: TextInputProps["keyboardType"];
  unit?: string;
  /** Called with raw text as the user types. */
  onTextChange?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  /** Format the form value into a string for display. */
  format?: (value: TFieldValues[TName]) => string;
  inputStyle?: TextStyle;
  containerStyle?: ViewStyle;
  inTray?: boolean;
  value: TFieldValues[TName];
  onChange: (value: TFieldValues[TName]) => void;
  rhfOnBlur: () => void;
};

function defaultFormat(value: unknown): string {
  return value === undefined || value === null ? "" : String(value);
}

function ControlledInput<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  label,
  containerStyle = {},
  inputStyle = {},
  placeholder,
  keyboardType,
  unit,
  onTextChange,
  onFocus,
  onBlur,
  format,
  value,
  onChange,
  rhfOnBlur,
  inTray,
}: ControlledInputProps<TFieldValues, TName>) {
  const labelElement = useMemo(() => {
    if (typeof label === "string") {
      return <TextCaption>{label}</TextCaption>;
    }
    return label;
  }, [label]);

  const formatFn = useMemo(() => format ?? defaultFormat, [format]);

  const [isFocused, setIsFocused] = useState(false);
  const [text, setText] = useState(() => formatFn(value));

  const mOnChange = useCallback(
    (value: string) => {
      onTextChange?.(value);
      setText(value);

      onChange(value as TFieldValues[TName]);
    },
    [onChange, onTextChange],
  );

  const mOnFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const mOnBlur = useCallback(() => {
    setIsFocused(false);
    rhfOnBlur();
    onBlur?.();
  }, [rhfOnBlur, onBlur]);

  const containerComposedStyle = useComposedStyle<ViewStyle>({
    base: baseStyles.container,
    props: containerStyle,
  });

  const inputComposedStyle = useComposedStyle<TextStyle>({
    base: baseStyles.input,
    props: inputStyle,
  });

  const TextInputComponent = useMemo(
    () => (inTray ? BottomSheetTextInput : TextInput),
    [inTray],
  );

  return (
    <VStack
      backgroundColor="transparent"
      flex={1}
      gap={0.5}
      style={containerComposedStyle}
    >
      {labelElement}
      <HStack alignItems="center" backgroundColor="transparent">
        <TextInputComponent
          value={isFocused ? text : formatFn(value)}
          onChangeText={mOnChange}
          onFocus={mOnFocus}
          onBlur={mOnBlur}
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
  );
}

export type FormInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TName;
} & Omit<
  ControlledInputProps<TFieldValues, TName>,
  "value" | "onChange" | "rhfOnBlur"
>;

export function FormInput<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({ control, name, ...props }: FormInputProps<TFieldValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur: rhfOnBlur, value } }) => (
        <ControlledInput
          {...props}
          value={value}
          onChange={onChange}
          rhfOnBlur={rhfOnBlur}
        />
      )}
    />
  );
}
