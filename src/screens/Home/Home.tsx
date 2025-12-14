import { SafeVStack } from "../../components";
import { Header } from "./components/Header";

export function Home() {
  return (
    <SafeVStack paddingX={2}>
      <Header />
    </SafeVStack>
  );
}

export type HomeParams = undefined;
