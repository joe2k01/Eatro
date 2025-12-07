import { useSetupCamera } from "../hooks/useSetupCamera";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@coinbase/cds-mobile/buttons/Button";
import { useNavigation } from "@react-navigation/native";
import { SafeVStack } from "../components";

export function Home() {
  const setupCamera = useSetupCamera();

  const [isCameraEnabled, setIsCameraEnabled] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    setupCamera().then(setIsCameraEnabled);
  }, [setupCamera]);

  const onGoToCamera = useCallback(
    () => navigation.navigate("Scanner"),
    [navigation],
  );

  return (
    <SafeVStack background="accentBoldRed">
      <Button disabled={!isCameraEnabled} onPress={onGoToCamera}>
        Go to camera
      </Button>
    </SafeVStack>
  );
}

export type HomeParams = undefined;
