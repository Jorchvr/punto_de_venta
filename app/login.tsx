import React, { useEffect, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { NeoButton } from "@/components/NeoButton";
import { listUsuarios, type Usuario } from "@/db/usuarios.repo";
import { useSession } from "@/stores/session.store";
import { useTheme } from "@/stores/theme.store";

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
      setErr("PIN INCORRECTO");
      setPin("");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: 20, alignItems: "center" }}>
        <Text
          style={{
            color: colors.text,
            fontFamily: "SpaceGrotesk_700Bold",
            fontSize: 28,
            letterSpacing: 3,
          }}
        >
          BLACK MAMBA
        </Text>
        <Text
          style={{
            color: colors.textMuted,
            fontFamily: "SpaceGrotesk_500Medium",
            fontSize: 12,
            letterSpacing: 2,
            marginTop: 4,
          }}
        >
          PUNTO DE VENTA
        </Text>
      </View>

      {!selected ? (
        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          <Text
            style={{
              color: colors.textMuted,
              fontFamily: "SpaceGrotesk_700Bold",
              fontSize: 12,
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            SELECCIONA CAJERO
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
                  borderColor: "#000",
                  borderWidth: 2,
                  borderRadius: 10,
                  padding: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Ionicons name="person-circle-outline" size={30} color={colors.accent} />
                  <View>
                    <Text
                      style={{
                        color: colors.text,
                        fontFamily: "SpaceGrotesk_700Bold",
                        fontSize: 16,
                      }}
                    >
                      {item.Nombre.toUpperCase()}
                    </Text>
                    <Text
                      style={{
                        color: colors.textMuted,
                        fontFamily: "SpaceGrotesk_500Medium",
                        fontSize: 11,
                      }}
                    >
                      {item.Rol.toUpperCase()} {item.Pin ? "• PIN" : "• SIN PIN"}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
              </Pressable>
            )}
            ListEmptyComponent={
              <Text style={{ color: colors.textMuted, textAlign: "center", padding: 20 }}>
                NO HAY USUARIOS. CREA UNO EN AJUSTES.
              </Text>
            }
          />
        </View>
      ) : (
        <View style={{ flex: 1, paddingHorizontal: 20, alignItems: "center" }}>
          <Text
            style={{
              color: colors.text,
              fontFamily: "SpaceGrotesk_700Bold",
              fontSize: 18,
              letterSpacing: 1,
            }}
          >
            {selected.Nombre.toUpperCase()}
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              fontFamily: "SpaceGrotesk_500Medium",
              fontSize: 12,
              marginTop: 4,
            }}
          >
            INGRESA TU PIN
          </Text>
          <TextInput
            value={pin}
            onChangeText={(t) => setPin(t.replace(/\D/g, "").slice(0, 4))}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
            style={{
              marginTop: 16,
              width: 200,
              textAlign: "center",
              fontSize: 32,
              letterSpacing: 12,
              paddingVertical: 12,
              color: colors.text,
              backgroundColor: colors.card,
              borderColor: "#000",
              borderWidth: 2,
              borderRadius: 10,
              fontFamily: "SpaceGrotesk_700Bold",
            }}
          />
          {!!err && (
            <Text
              style={{
                color: colors.pink,
                marginTop: 8,
                fontFamily: "SpaceGrotesk_700Bold",
              }}
            >
              {err}
            </Text>
          )}
          <View style={{ flexDirection: "row", gap: 10, marginTop: 20 }}>
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
              variant="green"
              onPress={submitPin}
              disabled={pin.length !== 4}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
