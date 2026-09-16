import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SessionState {
  usuario: string | null;
  rol: "Admin" | "Cajero" | null;
  negocio: string;
  ready: boolean;
  login: (nombre: string, rol: "Admin" | "Cajero") => Promise<void>;
  logout: () => Promise<void>;
  setNegocio: (n: string) => Promise<void>;
  hydrate: () => Promise<void>;
}

const K_USER = "@bm:usuario";
const K_ROL = "@bm:rol";
const K_NEG = "@bm:negocio";

export const useSession = create<SessionState>((set) => ({
  usuario: "ADMIN",
  rol: "Admin",
  negocio: "POWER GYM",
  ready: false,
  hydrate: async () => {
    try {
      const [u, r, n] = await Promise.all([
        AsyncStorage.getItem(K_USER),
        AsyncStorage.getItem(K_ROL),
        AsyncStorage.getItem(K_NEG),
      ]);
      set({
        usuario: u ?? "ADMIN",
        rol: (r as "Admin" | "Cajero" | null) ?? "Admin",
        negocio: n ?? "POWER GYM",
        ready: true,
      });
    } catch {
      set({ ready: true });
    }
  },
  login: async (nombre, rol) => {
    set({ usuario: nombre, rol });
    await AsyncStorage.setItem(K_USER, nombre);
    await AsyncStorage.setItem(K_ROL, rol);
  },
  logout: async () => {
    set({ usuario: "ADMIN", rol: "Admin" });
    await AsyncStorage.removeItem(K_USER);
    await AsyncStorage.removeItem(K_ROL);
  },
  setNegocio: async (n) => {
    set({ negocio: n });
    await AsyncStorage.setItem(K_NEG, n);
  },
}));
