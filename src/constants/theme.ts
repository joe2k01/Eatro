import type { TextStyle, ViewStyle, ImageStyle } from "react-native";

const _redSpectrum = {
  red0: "254,240,240",
  red5: "254,242,242",
  red10: "254,227,226",
  red15: "253,205,203",
  red20: "246,120,115",
  red30: "253,169,166",
  red40: "246,120,115",
  red50: "237,76,70",
  red60: "221,64,58",
  red70: "183,36,30",
  red80: "152,33,28",
  red90: "126,34,30",
  red100: "68,13,11",
};

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
    bg: "#f9f9f9",
    fg: "#202020",
    card: "#fcfcfc",
    fgCard: "#202020",
    popover: "#fcfcfc",
    fgPopover: "#202020",
    primary: "#644a40",
    fgPrimary: "#ffffff",
    secondary: "#ffdfb5",
    fgSecondary: "#582d1d",
    muted: "#efefef",
    fgMuted: "#646464",
    accent: "#e8e8e8",
    fgAccent: "#202020",
    destructive: "#e54d2e",
    fgDestructive: "#ffffff",
  },
  dark: {
    bg: "#111111",
    fg: "#eeeeee",
    card: "#191919",
    fgCard: "#eeeeee",
    popover: "#191919",
    fgPopover: "#eeeeee",
    primary: "#ffe0c2",
    fgPrimary: "#081a1b",
    secondary: "#393028",
    fgSecondary: "#ffe0c2",
    muted: "#222222",
    fgMuted: "#b4b4b4",
    accent: "#2a2a2a",
    fgAccent: "#eeeeee",
    destructive: "#e54d2e",
    fgDestructive: "#ffffff",
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

export type ColourProps = Extract<keyof TextStyle, "color">;
export type ThemeColourProps = { [K in ColourProps]?: AllColours };
export type ViewColourStyle = Pick<TextStyle, ColourProps>;
export type ColourViewProps<P> = P extends ViewColourStyle
  ? Omit<P, ColourProps> & ThemeColourProps
  : P;
export const ColourPropsConcrete: ColourProps[] = ["color"];

export type Style = ViewStyle | TextStyle | ImageStyle;

export type StyledViewProps<P> = PaddedViewProps<ColourViewProps<P>>;
