import type { TextStyle, ViewStyle, ImageStyle } from "react-native";

export const IconSizes = {
  s: 20,
  m: 32,
  l: 50,
} as const;

export type IconSize = keyof typeof IconSizes;

export type Dimension = 0.5 | 1 | 2 | 3 | 4;
export const DimensionSize = 8;

type ColourTypes =
  | "primary"
  | "secondary"
  | "accent"
  | "bg"
  | "fg"
  | "card"
  | "popover"
  | "muted"
  | "destructive";

export type ThemeVariant = {
  [K in ColourTypes]: string;
} & {
  [FG in Exclude<ColourTypes, "bg" | "fg"> as `fg${Capitalize<FG>}`]: string;
};

type AllColours = keyof ThemeVariant;

export type Theme = {
  light: ThemeVariant;
  dark: ThemeVariant;
};

export const EatroTheme: Theme = {
  light: {
    bg: "#fafafa",
    fg: "#09090b",
    card: "#e4e4e7",
    fgCard: "#09090b",
    popover: "#e4e4e7",
    fgPopover: "#09090b",
    primary: "#2f27ce",
    fgPrimary: "#fafafa",
    secondary: "#fd9a00",
    fgSecondary: "#09090b",
    muted: "#52525c",
    fgMuted: "#e4e4e7",
    accent: "#fcc800",
    fgAccent: "#09090b",
    destructive: "#e54d2e",
    fgDestructive: "#e7000b",
  },
  dark: {
    bg: "#09090b",
    fg: "#fafafa",
    card: "#e4e4e7",
    fgCard: "#09090b",
    popover: "#e4e4e7",
    fgPopover: "#09090b",
    primary: "#2f27ce",
    fgPrimary: "#fafafa",
    secondary: "#fd9a00",
    fgSecondary: "#09090b",
    muted: "#27272a",
    fgMuted: "#52525c",
    accent: "#fcc800",
    fgAccent: "#09090b",
    destructive: "#e54d2e",
    fgDestructive: "#e7000b",
  },
};

export type PaddingProps = Extract<keyof ViewStyle, `padding${string}`>;
export type DimensionPaddingProps = { [K in PaddingProps]?: Dimension };
export type ViewPaddingStyle = Pick<ViewStyle, PaddingProps>;
export type PaddedViewProps<P> = P extends ViewPaddingStyle
  ? Omit<P, PaddingProps> & DimensionPaddingProps
  : P;
export const PaddingPropsConcrete: PaddingProps[] = [
  "padding",
  "paddingBlock",
  "paddingBlockEnd",
  "paddingBlockStart",
  "paddingBottom",
  "paddingEnd",
  "paddingHorizontal",
  "paddingInline",
  "paddingInlineEnd",
  "paddingInlineStart",
  "paddingLeft",
  "paddingRight",
  "paddingStart",
  "paddingTop",
  "paddingVertical",
];

export type GapProps = Extract<keyof ViewStyle, "gap">;
export type DimensionGapProps = { [K in GapProps]?: Dimension };
export type ViewGapStyle = Pick<ViewStyle, GapProps>;
export type GapViewProps<P> = P extends ViewGapStyle
  ? Omit<P, GapProps> & DimensionGapProps
  : P;
export const GapPropsConcrete: GapProps[] = ["gap"];

/**
 * Style props that can be mapped from a theme token (e.g. "popover") to a real colour.
 *
 * Note: we intentionally allow raw strings too (e.g. "transparent", "#fff").
 */
export type ColourProps = "color" | "backgroundColor" | "borderColor";
export type ThemeColourProps = { [K in ColourProps]?: AllColours | string };
export type ViewColourStyle = Pick<
  TextStyle & ViewStyle & ImageStyle,
  ColourProps
>;
export type ColourViewProps<P> = P extends ViewColourStyle
  ? Omit<P, ColourProps> & ThemeColourProps
  : P;
export const ColourPropsConcrete: ColourProps[] = [
  "color",
  "backgroundColor",
  "borderColor",
];

export type Style = ViewStyle | TextStyle | ImageStyle;

export type StyledViewProps<P> = PaddedViewProps<
  GapViewProps<ColourViewProps<P>>
>;
