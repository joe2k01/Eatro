import { ReactNode, useMemo } from "react";
import { ClipPath as ClipPathSVG, Defs, G, Path } from "react-native-svg";

type ClipPathDefinitionProps = {
  shape: "hexagon" | "circle";
  width: number;
  height: number;
};

const sqrt3 = Math.sqrt(3);
function getHexagonPath(width: number, height: number) {
  if (!(width > 0) || !(height > 0)) return "M 0 0";

  // Regular (equal sides) flat-top hexagon fitted into the provided width/height.
  // A regular flat-top hexagon has:
  // - hexWidth  = 2s
  // - hexHeight = √3 * s
  // where s is the side length.
  const s = Math.min(width / 2, height / sqrt3);
  const hexWidth = 2 * s;
  const hexHeight = sqrt3 * s;
  const xOffset = (width - hexWidth) / 2;
  const yOffset = (height - hexHeight) / 2;

  // Points (clockwise), starting at top-left:
  // (s/2, 0) -> (3s/2, 0) -> (2s, √3*s/2) -> (3s/2, √3*s) -> (s/2, √3*s) -> (0, √3*s/2)
  const p0x = xOffset + s / 2;
  const p0y = yOffset + 0;
  const p1x = xOffset + (3 * s) / 2;
  const p1y = yOffset + 0;
  const p2x = xOffset + 2 * s;
  const p2y = yOffset + (sqrt3 * s) / 2;
  const p3x = xOffset + (3 * s) / 2;
  const p3y = yOffset + sqrt3 * s;
  const p4x = xOffset + s / 2;
  const p4y = yOffset + sqrt3 * s;
  const p5x = xOffset + 0;
  const p5y = yOffset + (sqrt3 * s) / 2;

  return `M ${p0x} ${p0y} L ${p1x} ${p1y} L ${p2x} ${p2y} L ${p3x} ${p3y} L ${p4x} ${p4y} L ${p5x} ${p5y} Z`;
}

function getCirclePath(width: number, height: number) {
  if (!(width > 0) || !(height > 0)) return "M 0 0";

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(cx, cy);
  return `M ${cx} ${cy} m ${radius} 0 a ${radius},${radius} 0 1, 0 -${radius * 2} 0 a ${radius},${radius} 0 1, 0 ${radius * 2} 0 Z`;
}

export function ClipPathDefinition({
  shape,
  width,
  height,
}: ClipPathDefinitionProps) {
  const d = useMemo(() => {
    switch (shape) {
      case "circle":
        return getCirclePath(width, height);
      case "hexagon":
      default:
        return getHexagonPath(width, height);
    }
  }, [shape, width, height]);

  return <Path d={d} />;
}

export type ClipPathProps = {
  children?: ReactNode;
} & ClipPathDefinitionProps;

export function ClipPath({ children, width, height, shape }: ClipPathProps) {
  return (
    <G>
      <Defs>
        <ClipPathSVG id="aaa">
          <ClipPathDefinition shape={shape} width={width} height={height} />
        </ClipPathSVG>
      </Defs>

      <G clipPath="url(#aaa)">{children}</G>
    </G>
  );
}
