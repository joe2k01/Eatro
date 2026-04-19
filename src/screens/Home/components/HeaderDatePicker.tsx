import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PopupButtonView,
  type ChangeEventPayload,
  type PopupButtonOption,
} from "../../../../modules/popup-button";
import { Button } from "@components/buttons/Button";
import { HStack } from "@components/layout/HStack";
import { Tray, TrayApi } from "@components/layout/Tray";
import { VStack } from "@components/layout/VStack";
import { Icon } from "@components/media/Icon";
import { Title } from "@components/typography/Text";
import { addUtcDaysSeconds, utcStartOfTodaySeconds } from "@db/utils/utc";

type HeaderDatePickerProps = {
  dayUtcSeconds: number;
  setDayUtcSeconds: (dayUtcSeconds: number) => void;
};

type DateOption = "today" | "yesterday" | "custom";

export function HeaderDatePicker({
  dayUtcSeconds,
  setDayUtcSeconds,
}: HeaderDatePickerProps) {
  const date = useMemo(() => new Date(dayUtcSeconds * 1000), [dayUtcSeconds]);
  const todayDate = useMemo(() => new Date(), []);

  const todayUtcSeconds = utcStartOfTodaySeconds();
  const yesterdayUtcSeconds = addUtcDaysSeconds(todayUtcSeconds, -1);
  const isToday = dayUtcSeconds === todayUtcSeconds;
  const isYesterday = dayUtcSeconds === yesterdayUtcSeconds;

  // Returns a fresh options array. Stored in state so we can force a new
  // reference on tray dismiss, which causes the native PopupButtonView to
  // re-run createMenu() and clear any stale UIKit selection state left behind
  // by the "Custom date" action.
  const computeOptions = useCallback(
    (): PopupButtonOption<DateOption>[] => [
      { label: "Today", value: "today", disabled: isToday },
      { label: "Yesterday", value: "yesterday", disabled: isYesterday },
      { label: "Custom date", value: "custom", persistSelection: false },
    ],
    [isToday, isYesterday],
  );

  const [options, setOptions] = useState(computeOptions);

  useEffect(() => {
    setOptions(computeOptions());
  }, [computeOptions]);

  const trayRef = useRef<TrayApi>(null);

  const [localDate, setLocalDate] = useState(date);

  const onLayout = useCallback(() => {
    setLocalDate(date);
  }, [date]);

  const onOptionSelect = useCallback(
    (option: ChangeEventPayload<DateOption>) => {
      if (option.value === "today") {
        setDayUtcSeconds(utcStartOfTodaySeconds());
        return;
      }
      if (option.value === "yesterday") {
        setDayUtcSeconds(addUtcDaysSeconds(utcStartOfTodaySeconds(), -1));
        return;
      }
      trayRef.current?.openTray();
    },
    [setDayUtcSeconds],
  );

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

  const onTrayDismiss = useCallback(() => {
    setOptions(computeOptions());
  }, [computeOptions]);

  return (
    <>
      <PopupButtonView
        options={options}
        onOptionSelect={onOptionSelect}
        preferredMenuElementOrder="fixed"
      >
        <HStack gap={1} alignItems="center">
          <Title>{format(date, "MMMM do yyyy")}</Title>
          <Icon name="chevron-down" community />
        </HStack>
      </PopupButtonView>
      <Tray ref={trayRef} onDismiss={onTrayDismiss}>
        <VStack backgroundColor="transparent" gap={2}>
          <DateTimePicker
            value={localDate}
            mode="date"
            display="spinner"
            onChange={onChange}
            onLayout={onLayout}
            maximumDate={todayDate}
          />
          <Button variant="primary" onPress={onConfirm}>
            Confirm
          </Button>
          <Button variant="destructive" onPress={onCancel}>
            Cancel
          </Button>
        </VStack>
      </Tray>
    </>
  );
}
