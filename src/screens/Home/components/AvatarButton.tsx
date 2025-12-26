import { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import { IconButton } from "@components/buttons/IconButton";

export function AvatarButton() {
  const navigation = useNavigation();
  const onPress = useCallback(
    () => navigation.navigate("Settings" as never),
    [navigation],
  );

  return <IconButton name="person" onPress={onPress} />;
}
