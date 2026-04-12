import { screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { renderWithProviders } from "../../../test/helpers/render";
import { ErrorBoundary } from "./ErrorBoundary";

function ThrowingChild(): never {
  throw new Error("boom");
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("renders children when no error", () => {
    renderWithProviders(
      <ErrorBoundary fallback={<Text>fallback</Text>}>
        <Text>safe content</Text>
      </ErrorBoundary>,
    );
    expect(screen.getByText("safe content")).toBeOnTheScreen();
    expect(screen.queryByText("fallback")).toBeNull();
  });

  it("renders fallback ReactNode when child throws", () => {
    renderWithProviders(
      <ErrorBoundary fallback={<Text>error occurred</Text>}>
        <ThrowingChild />
      </ErrorBoundary>,
    );
    expect(screen.getByText("error occurred")).toBeOnTheScreen();
  });

  it("renders render-prop fallback with error info", () => {
    renderWithProviders(
      <ErrorBoundary
        fallback={({ error }) => (
          <Text>caught: {(error as Error).message}</Text>
        )}
      >
        <ThrowingChild />
      </ErrorBoundary>,
    );
    expect(screen.getByText("caught: boom")).toBeOnTheScreen();
  });
});
