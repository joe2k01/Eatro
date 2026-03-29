import { useCallback, type RefObject } from "react";
import { Tray, type TrayApi } from "@components/layout/Tray";
import { VStack } from "@components/layout/VStack";
import { Body, Heading } from "@components/typography/Text";
import { Button } from "@components/buttons/Button";

export type ConfirmDeleteTrayProps = {
  trayRef: RefObject<TrayApi | null>;
  foodName: string;
  onConfirm: () => Promise<void>;
  /** Side effects (e.g. clear selection); tray is closed by this component after. */
  onCancel: () => void;
};

export function ConfirmDeleteTray({
  trayRef,
  foodName,
  onConfirm,
  onCancel,
}: ConfirmDeleteTrayProps) {
  const close = useCallback(async () => {
    await trayRef.current?.closeTray();
  }, [trayRef]);

  const handleCancel = useCallback(async () => {
    onCancel();
    await close();
  }, [onCancel, close]);

  const handleConfirm = useCallback(async () => {
    await onConfirm();
    await close();
  }, [onConfirm, close]);

  return (
    <Tray ref={trayRef}>
      <VStack gap={2} backgroundColor="transparent">
        <Heading>Remove food?</Heading>
        <Body>Are you sure you want to remove {foodName} from this meal?</Body>
        <Button variant="destructive" onPress={handleConfirm}>
          Yes, remove
        </Button>
        <Button variant="secondary" inverted onPress={handleCancel}>
          Cancel
        </Button>
      </VStack>
    </Tray>
  );
}
