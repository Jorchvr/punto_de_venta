export type ThemeName = "dark" | "light";

export interface ThemePalette {
  bg: string;
  card: string;
  surface2: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
  // Common brutalist
  yellow: string;
  pink: string;
  green: string;
  blue: string;
  black: string;
  white: string;
}

export const DARK: ThemePalette = {
  bg: "#0B0B0F",
  card: "#1A1A24",
  surface2: "#24242E",
  border: "#2A2A36",
  text: "#FFFFFF",
  textMuted: "#B8B8C8",
  accent: "#F97316",
  accentSoft: "#3A2416",
  yellow: "#F5C518",
  pink: "#FF6B9D",
  green: "#7BC67E",
  blue: "#87CEEB",
  black: "#000000",
  white: "#FFFFFF",
};

export const LIGHT: ThemePalette = {
  bg: "#FBFBFD",
  card: "#FFFFFF",
  surface2: "#F5F5F7",
  border: "#E5E5EA",
  text: "#0D0D14",
  textMuted: "#6B6B7B",
  accent: "#F97316",
  accentSoft: "#FED7AA",
  yellow: "#F5C518",
  pink: "#FF6B9D",
  green: "#7BC67E",
  blue: "#87CEEB",
  black: "#000000",
  white: "#FFFFFF",
};

export function palette(name: ThemeName): ThemePalette {
  return name === "dark" ? DARK : LIGHT;
}
