import { VStack } from "@coinbase/cds-mobile/layout";
import { Text } from "@coinbase/cds-mobile/typography/Text";
import { useSetupCamera } from "../hooks/useSetupCamera";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@coinbase/cds-mobile/buttons/Button";
import { useNavigation } from "@react-navigation/native";

export function Home() {
  const setupCamera = useSetupCamera();

  const [isCameraEnabled, setIsCameraEnabled] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    setupCamera().then(setIsCameraEnabled);
  }, []);

  const onGoToCamera = useCallback(() => navigation.navigate("Scanner"), []);

  return (
    <VStack background="accentBoldRed">
      <Button disabled={!isCameraEnabled} onPress={onGoToCamera}>
        Go to camera
      </Button>
    </VStack>
  );
}

export type HomeParams = undefined;
