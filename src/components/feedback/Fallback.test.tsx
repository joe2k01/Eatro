import { renderWithProviders } from "../../../test/helpers/render";
import { Fallback } from "./Fallback";

describe("Fallback", () => {
  it("renders without crashing (default props)", () => {
    const { toJSON } = renderWithProviders(
      <Fallback style={{ width: 100, height: 100 }} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it("renders with animate={false}", () => {
    const { toJSON } = renderWithProviders(
      <Fallback animate={false} style={{ width: 100, height: 100 }} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it("renders with circle shape", () => {
    const { toJSON } = renderWithProviders(
      <Fallback shape="circle" style={{ width: 50, height: 50 }} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it("renders with squircle shape", () => {
    const { toJSON } = renderWithProviders(
      <Fallback shape="squircle" style={{ width: 50, height: 50 }} />,
    );
    expect(toJSON()).toBeTruthy();
  });
});
