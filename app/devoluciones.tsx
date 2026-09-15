import React, { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Header } from "@/components/Header";
import { NeoButton } from "@/components/NeoButton";
import { fromSqlite, refundVenta, ventasHoy, type Venta } from "@/db/ventas.repo";
import { useTheme } from "@/stores/theme.store";
import { fmtTime } from "@/utils/date";
import { money } from "@/utils/money";

export default function DevolucionesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setVentas(await ventasHoy());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const revertir = (v: Venta) => {
    Alert.alert(
      "REVERTIR VENTA",
      `¿REVERTIR ${v.Concepto.toUpperCase()} POR ${money(v.Total)}?`,
      [
        { text: "CANCELAR", style: "cancel" },
        {
          text: "REVERTIR",
          style: "destructive",
          onPress: async () => {
            await refundVenta(v.Id);
            await load();
            setToast("VENTA REVERTIDA");
            setTimeout(() => setToast(null), 2000);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface2 }} edges={["top"]}>
      <Header title="Devoluciones" onBack={() => router.back()} />
      <FlatList
        data={ventas}
        keyExtractor={(v) => String(v.Id)}
        style={{ width: "100%", maxWidth: 900, alignSelf: "center" }}
        contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => {
          const refunded = item.Refundada === 1;
          return (
            <View
              style={{
                backgroundColor: colors.card,
                borderColor: refunded ? colors.pink : "#000",
                borderWidth: 2,
                borderRadius: 10,
                padding: 12,
                opacity: refunded ? 0.6 : 1,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text
                  style={{
                    color: colors.textMuted,
                    fontFamily: "Fraunces_700Bold",
                    fontSize: 11,
                    letterSpacing: 1,
                  }}
                >
                  {fmtTime(fromSqlite(item.Fecha))} • {item.Usuario.toUpperCase()} • {item.MetodoPago.toUpperCase()}
                </Text>
                <Text
                  style={{
                    color: colors.green,
                    fontFamily: "Fraunces_700Bold",
                    fontSize: 14,
                  }}
                >
                  {money(item.Total)}
                </Text>
              </View>
              <Text
                style={{
                  color: colors.text,
                  fontFamily: "Fraunces_700Bold",
                  fontSize: 14,
                  marginTop: 4,
                  textDecorationLine: refunded ? "line-through" : "none",
                }}
              >
                {item.Concepto.toUpperCase()}
              </Text>
              <View style={{ marginTop: 8, alignSelf: "flex-end" }}>
                <NeoButton
                  label={refunded ? "Ya revertida" : "Revertir"}
                  variant="pink"
                  size="sm"
                  onPress={() => revertir(item)}
                  disabled={refunded}
                />
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text
            style={{
              color: colors.textMuted,
              textAlign: "center",
              padding: 30,
              fontFamily: "Fraunces_500Medium",
            }}
          >
            SIN VENTAS HOY
          </Text>
        }
      />
      {toast && (
        <View
          style={{
            position: "absolute",
            bottom: 20,
            alignSelf: "center",
            backgroundColor: colors.green,
            borderColor: colors.borderStrong,
            borderWidth: 2,
            borderRadius: 10,
            paddingHorizontal: 16,
            paddingVertical: 10,
          }}
        >
          <Text style={{ color: "#000", fontFamily: "Fraunces_700Bold" }}>{toast}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
