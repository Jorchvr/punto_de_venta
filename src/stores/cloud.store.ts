import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface CloudState {
  enabled: boolean;
  apiKey: string;
  status: "idle" | "ok" | "error";
  lastError: string | null;
  ready: boolean;
  setEnabled: (v: boolean) => Promise<void>;
  setApiKey: (k: string) => Promise<void>;
  setStatus: (s: CloudState["status"], err?: string | null) => void;
  hydrate: () => Promise<void>;
}

const K_ENABLED = "@bm:cloud_enabled";
const K_API_KEY = "@bm:cloud_apikey";

export const useCloud = create<CloudState>((set) => ({
  enabled: false,
  apiKey: "",
  status: "idle",
  lastError: null,
  ready: false,
  hydrate: async () => {
    try {
      const [e, k] = await Promise.all([
        AsyncStorage.getItem(K_ENABLED),
        AsyncStorage.getItem(K_API_KEY),
      ]);
      set({
        enabled: e === "1",
        apiKey: k ?? "",
        ready: true,
      });
    } catch {
      set({ ready: true });
    }
  },
  setEnabled: async (v) => {
    set({ enabled: v });
    await AsyncStorage.setItem(K_ENABLED, v ? "1" : "0");
  },
  setApiKey: async (k) => {
    set({ apiKey: k });
    await AsyncStorage.setItem(K_API_KEY, k);
  },
  setStatus: (status, lastError = null) => set({ status, lastError }),
}));

export function isCloudActive(): boolean {
  return useCloud.getState().enabled && !!useCloud.getState().apiKey;
}
