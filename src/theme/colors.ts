export type ThemeName = "light";

export interface ThemePalette {
  bg: string;
  card: string;
  surface2: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
  accentText: string;
  danger: string;
  dangerSoft: string;
  success: string;
  yellow: string;
  pink: string;
  green: string;
  blue: string;
  black: string;
  white: string;
}

export const LIGHT: ThemePalette = {
  bg: "#FFFFFF",
  card: "#FFFFFF",
  surface2: "#F5F5F7",
  border: "#EDEDF1",
  borderStrong: "#111827",
  text: "#0F0F17",
  textMuted: "#6B6B7B",
  accent: "#E11D2E",
  accentSoft: "#FFE4E6",
  accentText: "#FFFFFF",
  danger: "#E11D2E",
  dangerSoft: "#FFE4E6",
  success: "#10B981",
  yellow: "#111827",
  pink: "#E11D2E",
  green: "#059669",
  blue: "#2563EB",
  black: "#0F0F17",
  white: "#FFFFFF",
};

export const DARK = LIGHT;

export function palette(_name: ThemeName): ThemePalette {
  return LIGHT;
}
