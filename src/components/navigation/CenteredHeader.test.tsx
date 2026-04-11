import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { CenteredHeader } from "./CenteredHeader";

describe("CenteredHeader", () => {
  it("renders left, center, right slots", () => {
    render(
      <CenteredHeader
        left={<Text>L</Text>}
        center={<Text>C</Text>}
        right={<Text>R</Text>}
      />,
    );
    expect(screen.getByText("L")).toBeTruthy();
    expect(screen.getByText("C")).toBeTruthy();
    expect(screen.getByText("R")).toBeTruthy();
  });

  it("handles missing slots gracefully", () => {
    const { toJSON } = render(<CenteredHeader />);
    expect(toJSON()).toBeTruthy();
  });
});
