import { useCallback } from "react";
import { TextBody } from "@components/typography/Text";
import { IconButton } from "@components/buttons/IconButton";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { CenteredHeader } from "@components/navigation/CenteredHeader";

export function Header({ back, navigation }: NativeStackHeaderProps) {
  const onGoBack = useCallback(
    () => (back ? navigation.goBack() : undefined),
    [back, navigation],
  );

  return (
    <CenteredHeader
      left={
        <IconButton name="chevron-left" onPress={onGoBack} disabled={!back} />
      }
      center={<TextBody>User configuration</TextBody>}
    />
  );
}
