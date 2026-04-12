import { screen } from "@testing-library/react-native";
import { renderWithProviders } from "../../../test/helpers/render";
import { Snackbar, SnackbarVariant } from "./Snackbar";

jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock"),
);

describe("Snackbar", () => {
  it("returns null when no message", () => {
    const { toJSON } = renderWithProviders(
      <Snackbar message="" visible={false} />,
    );
    expect(toJSON()).toBeNull();
  });

  it("renders message text when visible", () => {
    renderWithProviders(<Snackbar message="Item logged" visible />);
    expect(screen.getByText("Item logged")).toBeOnTheScreen();
  });

  it("renders Info label by default", () => {
    renderWithProviders(<Snackbar message="msg" visible />);
    expect(screen.getByText("Info")).toBeOnTheScreen();
  });

  it("renders Success label for success variant", () => {
    renderWithProviders(
      <Snackbar message="saved" visible variant={SnackbarVariant.Success} />,
    );
    expect(screen.getByText("Success")).toBeOnTheScreen();
  });

  it("renders Error label for error variant", () => {
    renderWithProviders(
      <Snackbar message="failed" visible variant={SnackbarVariant.Error} />,
    );
    expect(screen.getByText("Error")).toBeOnTheScreen();
  });
});
