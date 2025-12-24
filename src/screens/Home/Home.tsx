import { SafeVStack } from "@components/SafeVStack";

export function Home() {
  return <SafeVStack paddingHorizontal={2} guard="both"></SafeVStack>;
}

export type HomeParams = undefined;
