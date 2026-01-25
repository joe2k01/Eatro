import {
  PopupButtonOption,
  PopupButtonViewProps,
} from "../../../modules/popup-button";
import PopupButtonView from "../../../modules/popup-button/src/PopupButtonView";
import { useCallback, useState } from "react";
import { InvertibleVariant } from "@components/buttons/hooks/useButtonStyle";
import { Icon } from "@components/media/Icon";
import { Button } from "@components/buttons/Button";

export type PickerOption<T> = PopupButtonOption<T>;

export type PickerProps<T> = Pick<
  PopupButtonViewProps<T>,
  "options" | "onOptionSelect"
> & {
  variant?: InvertibleVariant;
  /** Inverts the button: transparent background with colored border/text */
  inverted?: boolean;
  /** Placeholder text when no option is selected */
  placeholder?: string;
};

export function Picker<T extends string | number>({
  options,
  onOptionSelect,
  variant = "secondary",
  inverted,
  placeholder = "Select...",
}: PickerProps<T>) {
  const [selected, setSelected] = useState<PopupButtonOption<T> | undefined>();

  const handleSelect = useCallback(
    (newOption: PopupButtonOption<T>) => {
      setSelected(newOption);
      onOptionSelect?.(newOption);
    },
    [onOptionSelect],
  );

  return (
    <PopupButtonView
      options={options}
      onOptionSelect={handleSelect}
      preferredMenuElementOrder="fixed"
    >
      <Button
        variant={variant}
        inverted={inverted}
        rightIcon={
          <Icon name="chevron-down" size="xs" variant={variant} community />
        }
      >
        {selected?.label ?? placeholder}
      </Button>
    </PopupButtonView>
  );
}
