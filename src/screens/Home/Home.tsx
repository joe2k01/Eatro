import { SafeVStack } from "@components/SafeVStack";
import { Header } from "./components/Header";

export function Home() {
  return (
    <SafeVStack paddingHorizontal={2} backgroundColor={"red"}>
      <Header />
    </SafeVStack>
  );
}

export type HomeParams = undefined;
