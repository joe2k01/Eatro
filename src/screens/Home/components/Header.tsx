import { useCallback, useMemo } from "react";
import { format } from "date-fns";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { TextBody } from "@components/typography/Text";
import { IconButton } from "@components/buttons/IconButton";
import { CenteredHeader } from "@components/navigation/CenteredHeader";

export function Header({ navigation }: NativeStackHeaderProps) {
  const dateString = useMemo(() => format(new Date(), "MMMM do"), []);

  const onAvatarClick = useCallback(
    () => navigation.navigate("Settings"),
    [navigation],
  );

  return (
    <CenteredHeader
      left={<IconButton name="person" onPress={onAvatarClick} />}
      center={<TextBody>Today, {dateString}</TextBody>}
    />
  );
}
