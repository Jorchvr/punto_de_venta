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

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const session = useSession();

  const [fontsLoaded] = useFonts({
    Fraunces_400Regular: Manrope_400Regular,
    Fraunces_500Medium: Manrope_500Medium,
    Fraunces_600SemiBold: Manrope_600SemiBold,
    Fraunces_700Bold: Manrope_800ExtraBold,
    ...Ionicons.font,
  });

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([theme.hydrate(), session.hydrate(), getDb()]);
        setDbReady(true);
      } catch (e: any) {
        setError(String(e?.message ?? e));
        setDbReady(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (fontsLoaded && dbReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, dbReady]);

  if (!fontsLoaded || !dbReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.bg,
        }}
      >
        <ActivityIndicator color={theme.colors.accent} />
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
          padding: 20,
          backgroundColor: theme.colors.bg,
        }}
      >
        <Text style={{ color: theme.colors.pink, fontSize: 16, textAlign: "center" }}>
          Error al iniciar la BD:{"\n"}
          {error}
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
