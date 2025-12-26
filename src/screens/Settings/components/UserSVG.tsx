import Svg, { Path, Rect, SvgProps } from "react-native-svg";
import { ClipPath } from "@components/media/ClipPath";
import { useTheme } from "@contexts/ThemeProvider";

const svgSize = 24;
const userViewBox = `0 0 ${svgSize} ${svgSize}`;

export default function UserSVG({ size = 24 }: { size?: SvgProps["width"] }) {
  const { fgMuted, muted } = useTheme();

  return (
    <Svg width={size} height={size} viewBox={userViewBox}>
      <ClipPath width={svgSize} height={svgSize} shape="circle">
        <Rect width="100%" height="100%" fill={fgMuted} />
        <Path
          d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z"
          fill={muted}
        />
      </ClipPath>
    </Svg>
  );
}
