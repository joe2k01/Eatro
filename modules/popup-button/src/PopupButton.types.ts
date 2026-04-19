import type { StyleProp, ViewStyle } from "react-native";

export type PopupButtonModuleEvents = {
  onOptionSelect: (params: ChangeEventPayload) => void;
};

export type ChangeEventPayload<T = any> = {
  label: string;
  value: T;
};

export type PopupButtonOption<T = any> = {
  label: string;
  value: T;
  /** When true, the native menu item is non-interactive (grayed out). */
  disabled?: boolean;
  /**
   * When false, selecting this option dispatches the event but does not remain checked.
   * Useful for action-like menu items (e.g. "Custom date").
   */
  persistSelection?: boolean;
};

export type PopupButtonPreferredMenuElementOrder = "fixed" | "automatic";

export type PopupButtonViewProps<T = any> = {
  options?: PopupButtonOption<T>[];
  onOptionSelect?: (option: ChangeEventPayload<T>) => void;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  preferredMenuElementOrder?: PopupButtonPreferredMenuElementOrder;
};
