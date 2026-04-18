import { screen } from "@testing-library/react-native";
import { renderWithProviders } from "../../../test/helpers/render";
import { ScreenHeader } from "./ScreenHeader";
import { Title } from "@components/typography/Text";

describe("ScreenHeader", () => {
  it("renders title text", () => {
    renderWithProviders(<ScreenHeader title="New Food" />);
    expect(screen.getByText("New Food")).toBeOnTheScreen();
  });

  it("renders default back button when canGoBack", () => {
    renderWithProviders(<ScreenHeader title="Title" />);
    expect(screen.getByTestId("icon-chevron-left")).toBeOnTheScreen();
  });

  it("renders custom right content", () => {
    renderWithProviders(
      <ScreenHeader title="Title" right={<Title>Right</Title>} />,
    );
    expect(screen.getByText("Right")).toBeOnTheScreen();
  });
});
