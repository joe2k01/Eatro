import { requireNativeView } from "expo";
import * as React from "react";

import { ChangeEventPayload, PopupButtonViewProps } from "./PopupButton.types";

// Internal type for native view (includes nativeEvent wrapper)
type NativePopupButtonViewProps<T = any> = Omit<
  PopupButtonViewProps<T>,
  "onOptionSelect"
> & {
  onOptionSelect?: (event: { nativeEvent: ChangeEventPayload<T> }) => void;
};

const NativeView: React.ComponentType<NativePopupButtonViewProps> =
  requireNativeView("PopupButton");

export default function PopupButtonView<T = any>(
  props: PopupButtonViewProps<T>,
) {
  const { onOptionSelect, children } = props;

  const handleOptionSelect = React.useCallback(
    (event: { nativeEvent: ChangeEventPayload<T> }) => {
      // Forward just the selected option, not the entire event object
      onOptionSelect?.({
        label: event.nativeEvent.label,
        value: event.nativeEvent.value,
      });
    },
    [onOptionSelect],
  );

  return (
    <NativeView {...props} onOptionSelect={handleOptionSelect}>
      {children}
    </NativeView>
  );
}
