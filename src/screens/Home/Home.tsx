import { SafeVStack } from "@components/SafeVStack";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { useStaticNavigationOptions } from "@hooks/useStaticNavigationOptions";
import { format } from "date-fns";
import { AvatarButton } from "./components/AvatarButton";
import { Title1 } from "@components/typography/Text";

export const homeHeaderOptions = {
  headerTitle: () => <Title1>Today, {format(new Date(), "MMMM do")}</Title1>,
  headerLeft: () => <AvatarButton />,
} satisfies NativeStackNavigationOptions;

export function Home() {
  useStaticNavigationOptions(homeHeaderOptions);
  return <SafeVStack paddingHorizontal={2} guard="both"></SafeVStack>;
}

export type HomeParams = undefined;
