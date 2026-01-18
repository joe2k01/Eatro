import {
  PopupButtonOption,
  PopupButtonViewProps,
} from "../../../modules/popup-button";
import PopupButtonView from "../../../modules/popup-button/src/PopupButtonView";
import { useCallback, useState } from "react";
import { ButtonVariant } from "@components/buttons/hooks/useButtonStyle";
import { Icon } from "@components/media/Icon";
import { Button } from "@components/buttons/Button";

type PickerProps<T> = Pick<
  PopupButtonViewProps<T>,
  "options" | "onOptionSelect"
> & {
  variant?: ButtonVariant;
};

export function Picker<T extends string | number>({
  options,
  onOptionSelect,
  variant = "primary",
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
        rightIcon={
          <Icon name="chevron-down" size="xs" variant={variant} community />
        }
      >
        {selected?.label}
      </Button>
    </PopupButtonView>
  );
}
