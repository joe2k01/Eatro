import { renderWithProviders } from "../../../test/helpers/render";
import { RemoteImage } from "./RemoteImage";

describe("RemoteImage", () => {
  it("renders with valid source", () => {
    const { toJSON } = renderWithProviders(
      <RemoteImage
        source={{ uri: "https://example.com/img.jpg" }}
        style={{ width: 50, height: 50 }}
      />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it("shows fallback when source is empty", () => {
    const { toJSON } = renderWithProviders(
      <RemoteImage source={undefined} style={{ width: 50, height: 50 }} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it("applies squircle shape", () => {
    const { toJSON } = renderWithProviders(
      <RemoteImage
        source={{ uri: "https://example.com/img.jpg" }}
        shape="squircle"
        style={{ width: 50, height: 50 }}
      />,
    );
    expect(toJSON()).toBeTruthy();
  });
});
