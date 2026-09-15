import React, { useEffect, useState } from "react";
import { FlatList, Image, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { NeoButton } from "@/components/NeoButton";
import { listUsuarios, type Usuario } from "@/db/usuarios.repo";
import { useSession } from "@/stores/session.store";
import { useTheme } from "@/stores/theme.store";

const LOGO = require("../assets/powergym-logo.png");

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { login, usuario } = useSession();
  const [users, setUsers] = useState<Usuario[]>([]);
  const [selected, setSelected] = useState<Usuario | null>(null);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    listUsuarios().then(setUsers);
  }, []);

  useEffect(() => {
    if (usuario) router.replace("/");
  }, [usuario, router]);

  const enter = async (u: Usuario) => {
    setErr("");
    if (u.Pin) {
      setSelected(u);
      setPin("");
      return;
    }
    await login(u.Nombre, u.Rol);
    router.replace("/");
  };

  const submitPin = async () => {
    if (!selected) return;
    if (pin === selected.Pin) {
      await login(selected.Nombre, selected.Rol);
      router.replace("/");
    } else {
      setErr("PIN incorrecto");
      setPin("");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface2, alignItems: "center" }}>
      <View style={{ padding: 24, alignItems: "center", gap: 6, width: "100%", maxWidth: 500 }}>
        <View
          style={{
            width: 220,
            height: 120,
            backgroundColor: "#0F0F17",
            borderRadius: 20,
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 8,
          }}
        >
          <Image
            source={LOGO}
            style={{ width: "100%", height: "100%" }}
            resizeMode="contain"
          />
        </View>
        <Text
          style={{
            color: colors.textMuted,
            fontFamily: "Fraunces_500Medium",
            fontSize: 14,
            letterSpacing: 0.5,
          }}
        >
          Punto de venta
        </Text>
      </View>

      {!selected ? (
        <View style={{ flex: 1, paddingHorizontal: 20, width: "100%", maxWidth: 500 }}>
          <Text
            style={{
              color: colors.textMuted,
              fontFamily: "Fraunces_600SemiBold",
              fontSize: 13,
              letterSpacing: 0.3,
              marginBottom: 12,
            }}
          >
            Selecciona cajero
          </Text>
          <FlatList
            data={users}
            keyExtractor={(u) => String(u.Id)}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => enter(item)}
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 999,
                      backgroundColor: colors.accentSoft,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="person" size={22} color={colors.accent} />
                  </View>
                  <View>
                    <Text
                      style={{
                        color: colors.text,
                        fontFamily: "Fraunces_700Bold",
                        fontSize: 17,
                      }}
                    >
                      {item.Nombre}
                    </Text>
                    <Text
                      style={{
                        color: colors.textMuted,
                        fontFamily: "Fraunces_500Medium",
                        fontSize: 12,
                        marginTop: 2,
                      }}
                    >
                      {item.Rol} {item.Pin ? "· PIN" : "· sin PIN"}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
              </Pressable>
            )}
            ListEmptyComponent={
              <Text style={{ color: colors.textMuted, textAlign: "center", padding: 20 }}>
                No hay usuarios. Crea uno en Ajustes.
              </Text>
            }
          />
        </View>
      ) : (
        <View style={{ flex: 1, paddingHorizontal: 20, alignItems: "center", width: "100%", maxWidth: 500 }}>
          <Text
            style={{
              color: colors.text,
              fontFamily: "Fraunces_700Bold",
              fontSize: 20,
            }}
          >
            {selected.Nombre}
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              fontFamily: "Fraunces_500Medium",
              fontSize: 14,
              marginTop: 4,
            }}
          >
            Ingresa tu PIN
          </Text>
          <TextInput
            value={pin}
            onChangeText={(t) => setPin(t.replace(/\D/g, "").slice(0, 4))}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
            style={{
              marginTop: 20,
              width: 220,
              textAlign: "center",
              fontSize: 34,
              letterSpacing: 14,
              paddingVertical: 14,
              color: colors.text,
              backgroundColor: colors.surface2,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 16,
              fontFamily: "Fraunces_700Bold",
            }}
          />
          {!!err && (
            <Text
              style={{
                color: colors.danger,
                marginTop: 10,
                fontFamily: "Fraunces_600SemiBold",
              }}
            >
              {err}
            </Text>
          )}
          <View style={{ flexDirection: "row", gap: 10, marginTop: 24 }}>
            <NeoButton
              label="Cancelar"
              variant="surface"
              onPress={() => {
                setSelected(null);
                setPin("");
                setErr("");
              }}
            />
            <NeoButton
              label="Entrar"
              variant="primary"
              onPress={submitPin}
              disabled={pin.length !== 4}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
