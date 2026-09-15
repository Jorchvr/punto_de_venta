import { create } from "zustand";
import { palette, type ThemeName, type ThemePalette } from "../theme/colors";

interface ThemeState {
  name: ThemeName;
  colors: ThemePalette;
  ready: boolean;
  toggle: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useTheme = create<ThemeState>(() => ({
  name: "light",
  colors: palette("light"),
  ready: true,
  hydrate: async () => {},
  toggle: async () => {},
}));
