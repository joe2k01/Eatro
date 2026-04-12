import { BorderRadius } from "@constants/theme";
import { screen } from "@testing-library/react-native";
import { renderWithProviders } from "../../../test/helpers/render";
import { Fallback } from "./Fallback";

describe("Fallback", () => {
  it("applies rect border radius by default", () => {
    renderWithProviders(
      <Fallback testID="fallback" style={{ width: 100, height: 100 }} />,
    );
    expect(screen.getByTestId("fallback")).toHaveStyle({
      borderRadius: BorderRadius.md,
    });
  });

  it("applies squircle border radius", () => {
    renderWithProviders(
      <Fallback
        testID="fallback"
        shape="squircle"
        style={{ width: 100, height: 100 }}
      />,
    );
    expect(screen.getByTestId("fallback")).toHaveStyle({
      borderRadius: BorderRadius.lg,
    });
  });

  it("applies explicit border radius override", () => {
    renderWithProviders(
      <Fallback
        testID="fallback"
        borderRadius={20}
        style={{ width: 100, height: 100 }}
      />,
    );
    expect(screen.getByTestId("fallback")).toHaveStyle({ borderRadius: 20 });
  });

  it("applies custom base color as background color", () => {
    renderWithProviders(
      <Fallback
        testID="fallback"
        baseColor="#ff0000"
        style={{ width: 100, height: 100 }}
      />,
    );
    expect(screen.getByTestId("fallback")).toHaveStyle({
      backgroundColor: "#ff0000",
    });
  });
});
