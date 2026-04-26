import { fireEvent, screen } from "@testing-library/react-native";
import { renderWithProviders } from "../../../../test/helpers/render";
import { addUtcDaysSeconds, utcStartOfTodaySeconds } from "@db/utils/utc";
import { HeaderDatePicker } from "./HeaderDatePicker";

jest.mock("@react-native-community/datetimepicker", () => ({
  __esModule: true,
  default: () => {
    const { Text } = require("react-native") as typeof import("react-native");
    return <Text>Date picker</Text>;
  },
}));

describe("HeaderDatePicker", () => {
  it("selects today immediately and marks it selected", () => {
    const setDayUtcSeconds = jest.fn();
    const todayUtcSeconds = utcStartOfTodaySeconds();

    renderWithProviders(
      <HeaderDatePicker
        dayUtcSeconds={todayUtcSeconds}
        setDayUtcSeconds={setDayUtcSeconds}
      />,
    );

    expect(
      screen.getByTestId("popup-option-today").props.accessibilityState
        .selected,
    ).toBe(true);
    expect(
      screen.getByTestId("popup-option-today").props.accessibilityState
        .disabled,
    ).toBe(true);

    fireEvent.press(screen.getByTestId("popup-option-yesterday"));
    expect(setDayUtcSeconds).toHaveBeenCalledWith(
      addUtcDaysSeconds(todayUtcSeconds, -1),
    );
  });

  it("leaves shortcut options unchecked for a custom day", () => {
    const customDayUtcSeconds = addUtcDaysSeconds(utcStartOfTodaySeconds(), -3);

    renderWithProviders(
      <HeaderDatePicker
        dayUtcSeconds={customDayUtcSeconds}
        setDayUtcSeconds={jest.fn()}
      />,
    );

    expect(
      screen.getByTestId("popup-option-today").props.accessibilityState
        .selected,
    ).toBe(false);
    expect(
      screen.getByTestId("popup-option-yesterday").props.accessibilityState
        .selected,
    ).toBe(false);
    expect(
      screen.getByTestId("popup-option-custom").props.accessibilityState
        .selected,
    ).toBe(false);
  });
});
