import { useCallback } from "react";
import { useCameraPermission } from "react-native-vision-camera";

type UseSetupCamera = () => Promise<boolean>;

export function useSetupCamera(): UseSetupCamera {
  const { hasPermission, requestPermission } = useCameraPermission();

  return useCallback(async () => {
    if (hasPermission) {
      return true;
    }

    return requestPermission();
  }, []);
}
