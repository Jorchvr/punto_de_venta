import "../global.css";
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as SplashScreen from "expo-splash-screen";
import { getDb } from "@/db/client";
import { useTheme } from "@/stores/theme.store";
import { useSession } from "@/stores/session.store";
import { useCloud } from "@/stores/cloud.store";

SplashScreen.preventAutoHideAsync().catch(() => {});

const DB_TIMEOUT_MS = 15000;

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(
      () => reject(new Error(`${label}: no respondió en ${ms / 1000}s`)),
      ms
    );
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState("Iniciando...");
  const theme = useTheme();
  const session = useSession();
  const cloud = useCloud();

  useFonts({
    Fraunces_400Regular: Manrope_400Regular,
    Fraunces_500Medium: Manrope_500Medium,
    Fraunces_600SemiBold: Manrope_600SemiBold,
    Fraunces_700Bold: Manrope_800ExtraBold,
    ...Ionicons.font,
  });

  useEffect(() => {
    (async () => {
      try {
        setStage("Restaurando sesión...");
        await withTimeout(
          Promise.all([theme.hydrate(), session.hydrate(), cloud.hydrate()]),
          5000,
          "Sesión"
        );
        setStage("Cargando base de datos...");
        await withTimeout(getDb(), DB_TIMEOUT_MS, "Base de datos");
        setDbReady(true);
      } catch (e: any) {
        setError(String(e?.message ?? e));
        setDbReady(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (dbReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [dbReady]);

  if (!dbReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.bg,
          padding: 20,
        }}
      >
        <ActivityIndicator color={theme.colors.accent} size="large" />
        <Text
          style={{
            color: theme.colors.textMuted,
            marginTop: 16,
            fontSize: 14,
          }}
        >
          {stage}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
          backgroundColor: theme.colors.bg,
        }}
      >
        <Text
          style={{
            color: theme.colors.danger,
            fontSize: 18,
            fontWeight: "700",
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          No se pudo iniciar
        </Text>
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 14,
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          {error}
        </Text>
        <Text
          style={{
            color: theme.colors.textMuted,
            fontSize: 12,
            textAlign: "center",
          }}
        >
          Recargá la página (Ctrl+F5 o cerrá y volvé a abrir).{"\n"}
          Si persiste, verificá tu conexión a internet.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.bg },
          animation: "fade",
        }}
      />
    </SafeAreaProvider>
  );
}
