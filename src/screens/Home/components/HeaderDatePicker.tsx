import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { useCallback, useMemo, useRef, useState } from "react";
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

  const options = useMemo<PopupButtonOption<DateOption>[]>(
    () => [
      { label: "Today", value: "today", disabled: isToday },
      { label: "Yesterday", value: "yesterday", disabled: isYesterday },
      { label: "Custom date", value: "custom", persistSelection: false },
    ],
    [isToday, isYesterday],
  );

  /**
   * Remount the native PopupButtonView so UIKit drops any stale menu selection
   * (e.g. "Custom date" highlighted after opening the tray then dismissing without
   * confirming). Skip remount after Confirm — a fresh native view defaults its
   * checkmark to the first row (Today), which would lie for a custom day.
   */
  const [pulldownKey, setPulldownKey] = useState(0);
  const resetPulldown = useCallback(() => {
    setPulldownKey((k) => k + 1);
  }, []);

  /** When true, the next tray `onDismiss` should not remount the pulldown (Confirm path). */
  const skipPulldownRemountOnDismissRef = useRef(false);

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

    skipPulldownRemountOnDismissRef.current = true;
    trayRef.current?.closeTray();
  }, [localDate, setDayUtcSeconds]);

  const onCancel = useCallback(() => {
    void trayRef.current?.closeTray();
  }, []);

  const onTrayDismiss = useCallback(() => {
    if (skipPulldownRemountOnDismissRef.current) {
      skipPulldownRemountOnDismissRef.current = false;
      return;
    }
    resetPulldown();
  }, [resetPulldown]);

  return (
    <>
      <PopupButtonView
        key={pulldownKey}
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
