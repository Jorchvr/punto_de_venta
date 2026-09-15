import React from "react";
import { ScrollView, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/Header";
import { useTheme } from "@/stores/theme.store";

const ITEMS = [
  { route: "/productos", icon: "cube-outline", label: "PRODUCTOS", desc: "CATALOGO Y STOCK" },
  { route: "/historial", icon: "time-outline", label: "HISTORIAL", desc: "VENTAS Y REPORTES" },
  { route: "/devoluciones", icon: "return-up-back", label: "DEVOLUCIONES", desc: "REVERTIR VENTAS DEL DIA" },
  { route: "/corte", icon: "receipt-outline", label: "CORTE DE CAJA", desc: "CIERRE DEL DIA" },
  { route: "/ajustes", icon: "settings-outline", label: "AJUSTES", desc: "TEMA, NEGOCIO, USUARIOS" },
] as const;

export default function Backoffice() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface2 }} edges={["top"]}>
      <Header title="Backoffice" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          padding: 14,
          gap: 10,
          width: "100%",
          maxWidth: 900,
          alignSelf: "center",
        }}
      >
        {ITEMS.map((it) => (
          <Pressable
            key={it.route}
            onPress={() => router.push(it.route as any)}
            style={{
              backgroundColor: colors.card,
              borderColor: colors.borderStrong,
              borderWidth: 2,
              borderRadius: 12,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: colors.accentSoft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name={it.icon as any} size={24} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.text,
                  fontFamily: "Fraunces_700Bold",
                  fontSize: 15,
                  letterSpacing: 1,
                }}
              >
                {it.label}
              </Text>
              <Text
                style={{
                  color: colors.textMuted,
                  fontFamily: "Fraunces_500Medium",
                  fontSize: 11,
                  marginTop: 2,
                }}
              >
                {it.desc}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
