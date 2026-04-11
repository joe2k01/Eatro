import { act, renderHook } from "@testing-library/react-native";
import { useTextInput } from "./useTextInput";

describe("useTextInput", () => {
  it("returns default value as initial text", () => {
    const { result } = renderHook(() =>
      useTextInput({ defaultValue: "hello", onChange: jest.fn() }),
    );
    expect(result.current.value).toBe("hello");
  });

  it("returns empty string when no default", () => {
    const { result } = renderHook(() =>
      useTextInput({ onChange: jest.fn() }),
    );
    expect(result.current.value).toBe("");
  });

  it("onChange updates internal state and calls callback", () => {
    const onChange = jest.fn();
    const { result } = renderHook(() => useTextInput({ onChange }));

    act(() => {
      result.current.onChange("new value");
    });

    expect(result.current.value).toBe("new value");
    expect(onChange).toHaveBeenCalledWith("new value");
  });
});
