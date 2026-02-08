import { Pressable } from "react-native";
import { Title } from "@components/typography/Text";
import { format } from "date-fns";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useCallback, useMemo, useRef, useState } from "react";
import { Tray, TrayApi } from "@components/layout/Tray";
import { VStack } from "@components/layout/VStack";
import { Button } from "@components/buttons/Button";
import { HStack } from "@components/layout/HStack";
import { Icon } from "@components/media/Icon";

type HeaderDatePickerProps = {
  dayUtcSeconds: number;
  setDayUtcSeconds: (dayUtcSeconds: number) => void;
};

export function HeaderDatePicker({
  dayUtcSeconds,
  setDayUtcSeconds,
}: HeaderDatePickerProps) {
  const date = useMemo(() => new Date(dayUtcSeconds * 1000), [dayUtcSeconds]);
  const today = useMemo(() => new Date(), []);

  const trayRef = useRef<TrayApi>(null);

  const [localDate, setLocalDate] = useState(date);

  const onLayout = useCallback(() => {
    setLocalDate(date);
  }, [date]);

  const onOpenTray = useCallback(() => {
    trayRef.current?.openTray();
  }, []);

  const onChange = useCallback(
    (_: DateTimePickerEvent, selectedDate: Date | undefined) => {
      if (selectedDate) {
        setLocalDate(selectedDate);
      }
    },
    [],
  );

  const onConfirm = useCallback(() => {
    if (localDate) {
      setDayUtcSeconds(Math.floor(localDate.getTime() / 1000));
    }

    trayRef.current?.closeTray();
  }, [localDate, setDayUtcSeconds]);

  const onCancel = useCallback(() => {
    trayRef.current?.closeTray();
  }, []);

  return (
    <Pressable onPress={onOpenTray}>
      <HStack gap={1} alignItems="center">
        <Title>{format(date, "MMMM do yyyy")}</Title>
        <Icon name="chevron-down" community />
      </HStack>
      <Tray ref={trayRef}>
        <VStack backgroundColor="transparent" gap={2}>
          <DateTimePicker
            value={localDate}
            mode="date"
            display="spinner"
            onChange={onChange}
            onLayout={onLayout}
            maximumDate={today}
          />
          <Button variant="primary" onPress={onConfirm}>
            Confirm
          </Button>
          <Button variant="destructive" onPress={onCancel}>
            Cancel
          </Button>
        </VStack>
      </Tray>
    </Pressable>
  );
}
