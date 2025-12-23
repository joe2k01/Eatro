import Svg, { Path, SvgProps } from "react-native-svg";

export default function UserSVG({
  size = 24,
  color = "currentColor",
}: Pick<SvgProps, "color"> & { size?: SvgProps["width"] }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 0a6 6 0 1 1 0 12a6 6 0 1 1 0-12M0 24c0-6.63 5.37-12 12-12s12 5.37 12 12Z" />
    </Svg>
  );
}
