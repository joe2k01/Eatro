import Svg, { Path, SvgProps } from "react-native-svg";

export default function UserSVG({
  size = 24,
  color = "currentColor",
}: Pick<SvgProps, "color"> & { size?: SvgProps["width"] }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      style={{ backgroundColor: "red" }}
    >
      <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" />
    </Svg>
  );
}
