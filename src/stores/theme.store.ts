import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { palette, type ThemeName, type ThemePalette } from "../theme/colors";

interface ThemeState {
  name: ThemeName;
  colors: ThemePalette;
  ready: boolean;
  toggle: () => Promise<void>;
  hydrate: () => Promise<void>;
}

const KEY = "@bm:theme";

export const useTheme = create<ThemeState>((set, get) => ({
  name: "dark",
  colors: palette("dark"),
  ready: false,
  hydrate: async () => {
    try {
      const saved = (await AsyncStorage.getItem(KEY)) as ThemeName | null;
      const name: ThemeName = saved === "light" ? "light" : "dark";
      set({ name, colors: palette(name), ready: true });
    } catch {
      set({ ready: true });
    }
  },
  toggle: async () => {
    const next: ThemeName = get().name === "dark" ? "light" : "dark";
    set({ name: next, colors: palette(next) });
    try {
      await AsyncStorage.setItem(KEY, next);
    } catch {}
  },
}));
