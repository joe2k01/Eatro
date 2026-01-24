import type { TextStyle, ViewStyle, ImageStyle } from "react-native";

export const IconSizes = {
  xs: 16,
  s: 20,
  m: 32,
  l: 50,
} as const;

export type IconSize = keyof typeof IconSizes;

// Simplified spacing system (8px base unit)
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

// Legacy dimension system (kept for backward compatibility during migration)
export type Dimension = 0 | 0.25 | 0.5 | 0.75 | 1 | 1.5 | 2 | 3 | 4;
export const DimensionSize = 8;

// Semantic color tokens structure
export type ColorTokens = {
  // Surface colors (backgrounds)
  surface: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  // Text colors
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  // Border colors
  border: {
    default: string;
    muted: string;
  };
  // Semantic colors (actions, states)
  semantic: {
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    destructive: string;
    destructiveForeground: string;
    success: string;
    successForeground: string;
    accent: string;
    accentForeground: string;
  };
};

// Legacy ThemeVariant type (kept for backward compatibility)
// Maps old color names to new semantic structure
export type ThemeVariant = {
  bg: string;
  fg: string;
  card: string;
  fgCard: string;
  popover: string;
  fgPopover: string;
  primary: string;
  fgPrimary: string;
  secondary: string;
  fgSecondary: string;
  accent: string;
  fgAccent: string;
  muted: string;
  fgMuted: string;
  destructive: string;
  fgDestructive: string;
};

export type Theme = {
  light: ThemeVariant;
  dark: ThemeVariant;
};

// Theme definition with legacy structure (for backward compatibility)
export const EatroTheme: Theme = {
  light: {
    bg: "#FBF8F2",
    fg: "#141412",
    card: "#EFE8DD",
    fgCard: "#141412",
    popover: "#F4EEE4",
    fgPopover: "#141412",
    // Community / trust
    primary: "#1F6F4A",
    fgPrimary: "#FFFFFF",
    // Food / warmth (good for CTAs, highlights)
    secondary: "#F2B84B",
    fgSecondary: "#141412",
    // Individual ownership (badges, chips, "my contributions")
    accent: "#C56A3D",
    fgAccent: "#FFF7F0",
    // `muted` is intended to be a *surface/background* colour.
    // `fgMuted` is the readable text/icon colour on top of `muted`.
    muted: "#EFE8DD",
    fgMuted: "#6A655D",
    destructive: "#D64545",
    fgDestructive: "#FFFFFF",
  },
  dark: {
    bg: "#0F1411",
    fg: "#F6F3ED",
    card: "#18201B",
    fgCard: "#F6F3ED",
    popover: "#121A15",
    fgPopover: "#F6F3ED",
    primary: "#3ABF84",
    fgPrimary: "#08100C",
    secondary: "#F3C56B",
    fgSecondary: "#0B0F0C",
    accent: "#D08B5B",
    fgAccent: "#101312",
    muted: "#2A332E",
    fgMuted: "#9AA79F",
    destructive: "#FF6B6B",
    fgDestructive: "#101312",
  },
};

// Helper function to get spacing value
export function spacing(key: SpacingKey): number {
  return Spacing[key];
}

// Helper function to get border radius value
export function borderRadius(key: BorderRadiusKey): number {
  return BorderRadius[key];
}

// Legacy support - map old color names to new structure for gradual migration
export type LegacyColorName = keyof ThemeVariant;

/**
 * Maps legacy color names to new token structure
 * This allows gradual migration without breaking existing code
 */
export function mapLegacyColor(
  theme: ThemeVariant,
  legacyName: LegacyColorName,
): string {
  return theme[legacyName];
}

// Legacy type exports (kept for backward compatibility during migration)
export type AllColours = LegacyColorName;

// Simplified style type
export type Style = ViewStyle | TextStyle | ImageStyle;

// Legacy StyledViewProps type - kept for backward compatibility
// Components will be migrated away from this gradually
export type StyledViewProps<P> = P;
