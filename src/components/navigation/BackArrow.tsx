import { NativeStackHeaderBackProps } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { IconButton, IconButtonProps } from "@components/buttons/IconButton";

export function BackArrow({
  canGoBack,
  ...props
}: NativeStackHeaderBackProps &
  Omit<IconButtonProps, "name" | "onPress" | "disabled">) {
  const navigation = useNavigation();

  const onGoBack = useCallback(() => {
    if (canGoBack) navigation.goBack();
  }, [canGoBack, navigation]);

  return (
    <IconButton
      {...props}
      name="chevron-left"
      onPress={onGoBack}
      disabled={!canGoBack}
    />
  );
}
