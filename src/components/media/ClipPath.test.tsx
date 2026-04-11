import { render } from "@testing-library/react-native";
import { ClipPath } from "./ClipPath";
import Svg, { Rect } from "react-native-svg";

describe("ClipPath", () => {
  it("renders children with hexagon shape", () => {
    const { toJSON } = render(
      <Svg width={100} height={100}>
        <ClipPath shape="hexagon" width={100} height={100}>
          <Rect width={100} height={100} fill="red" />
        </ClipPath>
      </Svg>,
    );
    expect(toJSON()).toBeTruthy();
  });

  it("renders children with circle shape", () => {
    const { toJSON } = render(
      <Svg width={100} height={100}>
        <ClipPath shape="circle" width={100} height={100}>
          <Rect width={100} height={100} fill="blue" />
        </ClipPath>
      </Svg>,
    );
    expect(toJSON()).toBeTruthy();
  });
});
