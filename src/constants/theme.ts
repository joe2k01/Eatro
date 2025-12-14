import { ThemeConfig } from "@coinbase/cds-mobile";
import { defaultTheme } from "@coinbase/cds-mobile/themes/defaultTheme";

import type { ThemeVars } from "@coinbase/cds-common/core/theme";

type ColorKeys<C extends ThemeVars.SpectrumHue> = Extract<
  ThemeVars.SpectrumColor,
  `${C}${ThemeVars.SpectrumHueStep}`
>;

type Spectrum<C extends ThemeVars.SpectrumHue> = {
  [K in ColorKeys<C>]: string;
};

const redSpectrum: Spectrum<"red"> = {
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

const lightSpectrum: ThemeConfig["lightSpectrum"] = {
  ...defaultTheme.lightSpectrum,
  ...redSpectrum,
};

const darkSpectrum: ThemeConfig["darkSpectrum"] = {
  ...defaultTheme.darkSpectrum,
  ...redSpectrum,
};

const darkColor: ThemeConfig["darkColor"] = {
  ...defaultTheme.darkColor,
  bg: "rgb(23,18,18)",
  bgPrimary: `rgb(${redSpectrum.red60})`,
};

const lightColor: ThemeConfig["lightColor"] = {
  ...defaultTheme.lightColor,
  bg: "rgb(248,246,246)",
  bgPrimary: `rgb(${redSpectrum.red50})`,
};

export const eatroTheme: ThemeConfig = {
  ...defaultTheme,
  id: "eatro-theme",
  lightColor,
  darkColor,
  lightSpectrum,
  darkSpectrum,
};
