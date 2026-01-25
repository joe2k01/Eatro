import { useTheme } from "@contexts/ThemeProvider";
import { memo, useEffect } from "react";
import Svg, {
  Defs,
  Ellipse,
  G,
  Path,
  Pattern,
  Rect,
  Text,
  TextPath,
} from "react-native-svg";
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedText = Animated.createAnimatedComponent(Text);

/**
 * Ramen bowl "404" illustration
 */
export const Ramen404 = memo(function Ramen404() {
  const theme = useTheme();

  const outline = theme.text.primary;
  const steam = theme.text.muted;
  const noodlesBase = theme.semantic.secondary;
  const noodlesHighlight = theme.surface.secondary;
  const chopsticks = theme.semantic.accent;
  const bowlFill = theme.surface.secondary;
  const stripeBase = theme.semantic.destructive;
  const stripeHighlight = theme.surface.secondary;

  const smokeProgress = useSharedValue(0);
  const bounceProgress = useSharedValue(0);

  useEffect(() => {
    smokeProgress.value = withRepeat(
      withTiming(15, {
        duration: 1500,
        easing: Easing.linear,
        reduceMotion: ReduceMotion.System,
      }),
      -1,
      false,
    );

    bounceProgress.value = withRepeat(
      withTiming(10, {
        duration: 2000,
        reduceMotion: ReduceMotion.System,
      }),
      -1,
      true,
    );

    // We don't need to retrigger the effect as per the docs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const smokeAnimatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: smokeProgress.value,
    };
  });

  const numbersAnimatedProps = useAnimatedProps(() => {
    return {
      transform: [{ translateY: bounceProgress.value }],
    };
  });

  return (
    <Svg height={"100%"} width={"100%"} viewBox="0 0 194 155">
      <Defs>
        <Pattern
          id="noodles"
          patternUnits="userSpaceOnUse"
          patternContentUnits="userSpaceOnUse"
          width={8}
          height={2}
        >
          <Rect fill={noodlesBase} width={8} height={2} />
          <Path
            d="M 0 1 C 1 0 3 0 4 1 S 7 2 8 1"
            stroke={noodlesHighlight}
            strokeWidth={0.5}
            strokeLinecap="round"
            fill="none"
          />
        </Pattern>

        <Pattern
          id="stripes"
          patternUnits="userSpaceOnUse"
          width={4}
          height={4}
        >
          <Rect fill={stripeBase} width={4} height={4} />
          <Path
            d="M -1 1 l 2 -2 M 0 4 l 4 -4 M 3 5 l 2 -2"
            stroke={stripeHighlight}
            strokeWidth={1}
            fill="none"
          />
        </Pattern>

        <Path id="textline" d="M 46 30 l 54 35 l 54 -35" />
      </Defs>

      {/* steam */}
      <G>
        <AnimatedPath
          d="M62 40 c-8 10 8 14 0 24"
          fill="none"
          stroke={steam}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={[10, 5]}
          animatedProps={smokeAnimatedProps}
        />
        <AnimatedPath
          d="M100 12c-10 12 10 16 0 28"
          fill="none"
          stroke={steam}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={[10, 5]}
          animatedProps={smokeAnimatedProps}
        />
        <AnimatedPath
          d="M138 35 c-8 10 8 14 0 24"
          fill="none"
          stroke={steam}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={[10, 5]}
          animatedProps={smokeAnimatedProps}
        />
      </G>

      {/* “404” on a curve.
          RN-SVG doesn’t reliably honor `textLength/lengthAdjust`, so we place
          each glyph along the path via `startOffset`. */}
      <AnimatedText
        fontSize={32}
        fill={noodlesBase}
        stroke="none"
        textAnchor="middle"
        animatedProps={numbersAnimatedProps}
      >
        <TextPath href="#textline" startOffset="5%">
          4
        </TextPath>
      </AnimatedText>
      <AnimatedText
        fontSize={32}
        fill={noodlesBase}
        stroke="none"
        textAnchor="middle"
        animatedProps={numbersAnimatedProps}
      >
        <TextPath href="#textline" startOffset="50%">
          0
        </TextPath>
      </AnimatedText>
      <AnimatedText
        fontSize={32}
        fill={noodlesBase}
        stroke="none"
        textAnchor="middle"
        animatedProps={numbersAnimatedProps}
      >
        <TextPath href="#textline" startOffset="98%">
          4
        </TextPath>
      </AnimatedText>

      {/* bowl */}
      <G>
        {/* shadow */}
        <Ellipse
          cx={100}
          cy={148}
          rx={58}
          ry={6}
          fill={outline}
          opacity={0.08}
        />

        {/* bowl bottom half */}
        <Path
          d="M 28 96 A 72 50 0 0 0 172 96"
          fill="url(#stripes)"
          stroke={outline}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />

        {/* outer rim */}
        <Ellipse
          cx={100}
          cy={96}
          rx={74}
          ry={26}
          fill={bowlFill}
          stroke={outline}
          strokeWidth={1.5}
        />

        {/* inner rim */}
        <Ellipse
          cx={100}
          cy={96}
          rx={70}
          ry={20}
          fill="url(#noodles)"
          stroke={outline}
          strokeWidth={1.5}
        />

        {/* chopsticks */}
        <Path
          d="M120 92 L176 36"
          stroke={chopsticks}
          strokeWidth={6}
          strokeLinecap="round"
        />
        <Path
          d="M126 98 L182 42"
          stroke={chopsticks}
          strokeWidth={6}
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
});
