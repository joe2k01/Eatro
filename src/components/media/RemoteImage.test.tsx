import { screen } from "@testing-library/react-native";
import { Path } from "react-native-svg";
import { renderWithProviders } from "../../../test/helpers/render";
import { RemoteImage } from "./RemoteImage";

jest.mock("expo-image", () => {
  const React = require("react");
  const { View: RNView } = require("react-native");
  return {
    Image: (props: Record<string, unknown>) =>
      React.createElement(RNView, { ...props, testID: "remote-image-node" }),
  };
});

describe("RemoteImage", () => {
  it("renders image when source is valid", () => {
    renderWithProviders(
      <RemoteImage
        source={{ uri: "https://example.com/img.jpg" }}
        style={{ width: 50, height: 50 }}
      />,
    );
    expect(screen.getByTestId("remote-image-node")).toBeOnTheScreen();
    expect(screen.queryAllByTestId("remote-image-node")).toHaveLength(1);
  });

  it("shows fallback artwork and hides image when source is empty", () => {
    const { UNSAFE_getAllByType } = renderWithProviders(
      <RemoteImage source={undefined} style={{ width: 50, height: 50 }} />,
    );
    expect(screen.queryByTestId("remote-image-node")).toBeNull();
    expect(UNSAFE_getAllByType(Path).length).toBeGreaterThan(0);
  });

  it("applies squircle border radius to container", () => {
    const { toJSON } = renderWithProviders(
      <RemoteImage
        source={{ uri: "https://example.com/img.jpg" }}
        shape="squircle"
        style={{ width: 50, height: 50 }}
      />,
    );
    const rootStyle = toJSON()?.props?.style;
    const styleList = Array.isArray(rootStyle) ? rootStyle : [rootStyle];
    expect(styleList).toEqual(
      expect.arrayContaining([expect.objectContaining({ borderRadius: 12 })]),
    );
  });
});
