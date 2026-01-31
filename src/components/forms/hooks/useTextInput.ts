import { useCallback, useState } from "react";

export type UseTextInputProps = {
  defaultValue?: string;
  onChange: (text: string) => void;
};

export function useTextInput({
  defaultValue,
  onChange: onChangeProp,
}: UseTextInputProps) {
  const [value, setValue] = useState(defaultValue ?? "");

  const onChange = useCallback(
    (text: string) => {
      setValue(text);
      onChangeProp(text);
    },
    [onChangeProp],
  );

  return {
    value,
    onChange,
  };
}
