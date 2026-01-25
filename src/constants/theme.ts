import type { TextStyle, ViewStyle, ImageStyle } from "react-native";

export const IconSizes = {
  xs: 16,
  s: 20,
  m: 32,
  l: 50,
} as const;

export type IconSize = keyof typeof IconSizes;

// Spacing system (8px base unit)
export const Spacing = {
  0: 0,
  0.25: 2,
  0.5: 4,
  0.75: 6,
  1: 8,
  1.5: 12,
  2: 16,
  3: 24,
  4: 32,
} as const;

export type SpacingKey = keyof typeof Spacing;

// Border radius tokens
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export type BorderRadiusKey = keyof typeof BorderRadius;

// Typography scale
export const Typography = {
  display: {
    fontSize: 32,
    fontWeight: "700" as const,
    lineHeight: 40,
  },
  heading: {
    fontSize: 26,
    fontWeight: "700" as const,
    lineHeight: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "600" as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
    lineHeight: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500" as const,
    lineHeight: 20,
  },
} as const;

// Semantic color token structure
export type ThemeColors = {
  // Surface colors (backgrounds)
  surface: {
    primary: string; // Main background (was: bg)
    secondary: string; // Cards, elevated surfaces (was: card)
    tertiary: string; // Subtle backgrounds (was: muted)
  };
  // Text colors
  text: {
    primary: string; // Primary text (was: fg)
    secondary: string; // Secondary text (was: fgCard)
    muted: string; // Muted/disabled text (was: fgMuted)
    inverse: string; // Text on colored backgrounds (was: fgPrimary)
  };
  // Semantic action colors
  semantic: {
    primary: string; // Primary action (was: primary)
    primaryForeground: string; // Text on primary (was: fgPrimary)
    secondary: string; // Secondary action (was: secondary)
    secondaryForeground: string; // Text on secondary (was: fgSecondary)
    destructive: string; // Destructive action (was: destructive)
    destructiveForeground: string; // Text on destructive (was: fgDestructive)
    success: string; // Success state
    successForeground: string;
    accent: string; // Accent highlights (was: accent)
    accentForeground: string; // Text on accent (was: fgAccent)
  };
};

export type Theme = {
  light: ThemeColors;
  dark: ThemeColors;
};

export const EatroTheme: Theme = {
  light: {
    surface: {
      primary: "#FBF8F2",
      secondary: "#EFE8DD",
      tertiary: "#F4EEE4",
    },
    text: {
      primary: "#141412",
      secondary: "#141412",
      muted: "#6A655D",
      inverse: "#FFFFFF",
    },
    semantic: {
      primary: "#1F6F4A",
      primaryForeground: "#FFFFFF",
      secondary: "#F2B84B",
      secondaryForeground: "#141412",
      destructive: "#D64545",
      destructiveForeground: "#FFFFFF",
      success: "#1F6F4A",
      successForeground: "#FFFFFF",
      accent: "#C56A3D",
      accentForeground: "#FFF7F0",
    },
  },
  dark: {
    surface: {
      primary: "#0F1411",
      secondary: "#18201B",
      tertiary: "#121A15",
    },
    text: {
      primary: "#F6F3ED",
      secondary: "#F6F3ED",
      muted: "#9AA79F",
      inverse: "#08100C",
    },
    semantic: {
      primary: "#3ABF84",
      primaryForeground: "#08100C",
      secondary: "#F3C56B",
      secondaryForeground: "#0B0F0C",
      destructive: "#FF6B6B",
      destructiveForeground: "#101312",
      success: "#3ABF84",
      successForeground: "#08100C",
      accent: "#D08B5B",
      accentForeground: "#101312",
    },
  },
};

// Helper to get spacing value with proper type inference
export function spacing(key: SpacingKey): number;
export function spacing(key: undefined): undefined;
export function spacing(key: SpacingKey | undefined): number | undefined;
export function spacing(key: SpacingKey | undefined): number | undefined {
  if (key === undefined) return undefined;
  return Spacing[key];
}

// Simplified style type
export type Style = ViewStyle | TextStyle | ImageStyle;
