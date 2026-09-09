import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import Constants from "expo-constants";
import { Header } from "@/components/Header";
import { NeoButton } from "@/components/NeoButton";
import {
  createUsuario,
  deleteUsuario,
  listUsuarios,
  updateUsuario,
  type Usuario,
} from "@/db/usuarios.repo";
import { useSession } from "@/stores/session.store";
import { useTheme } from "@/stores/theme.store";
import { DB_NAME } from "@/db/schema";
import { resetDb } from "@/db/client";

export default function AjustesScreen() {
  const { colors, name, toggle } = useTheme();
  const { negocio, setNegocio, logout } = useSession();
  const router = useRouter();
  const [neg, setNeg] = useState(negocio);
  const [users, setUsers] = useState<Usuario[]>([]);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setUsers(await listUsuarios());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const guardarNeg = async () => {
    await setNegocio(neg.trim().toUpperCase() || "BLACK MAMBA");
    Alert.alert("GUARDADO");
  };

  const restaurarBD = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
      });
      if (res.canceled) return;
      const src = res.assets[0].uri;
      const dbDir = `${FileSystem.documentDirectory}SQLite/`;
      const dbPath = `${dbDir}${DB_NAME}`;
      const dirInfo = await FileSystem.getInfoAsync(dbDir);
      if (!dirInfo.exists) await FileSystem.makeDirectoryAsync(dbDir, { intermediates: true });
      await resetDb();
      await FileSystem.copyAsync({ from: src, to: dbPath });
      Alert.alert("BD RESTAURADA", "REINICIA LA APP PARA APLICAR CAMBIOS.");
    } catch (e: any) {
      Alert.alert("ERROR", String(e?.message ?? e));
    }
  };

  const cerrarSesion = async () => {
    await logout();
    router.replace("/login");
  };

  const eliminarUsuario = (u: Usuario) => {
    Alert.alert("ELIMINAR", `¿ELIMINAR ${u.Nombre.toUpperCase()}?`, [
      { text: "CANCELAR", style: "cancel" },
      {
        text: "ELIMINAR",
        style: "destructive",
        onPress: async () => {
          await deleteUsuario(u.Id);
          await load();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <Header title="AJUSTES" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 40, gap: 14 }}>
        <Section title="TEMA">
          <Row>
            <Text style={txtLabel(colors.text)}>MODO OSCURO</Text>
            <Switch value={name === "dark"} onValueChange={toggle} />
          </Row>
        </Section>

        <Section title="NEGOCIO">
          <Text style={txtHint(colors.textMuted)}>APARECE EN TICKETS Y CORTE</Text>
          <TextInput
            value={neg}
            onChangeText={(t) => setNeg(t.toUpperCase())}
            autoCapitalize="characters"
            style={inputStyle(colors)}
          />
          <NeoButton label="Guardar" variant="green" onPress={guardarNeg} />
        </Section>

        <Section title="USUARIOS / CAJEROS">
          {users.map((u) => (
            <Pressable
              key={u.Id}
              onPress={() => {
                setEditing(u);
                setModalOpen(true);
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Ionicons name="person-circle-outline" size={26} color={colors.accent} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={txtLabel(colors.text)}>{u.Nombre.toUpperCase()}</Text>
                <Text style={{ color: colors.textMuted, fontFamily: "SpaceGrotesk_500Medium", fontSize: 11 }}>
                  {u.Rol.toUpperCase()} {u.Pin ? "• PIN" : "• SIN PIN"}
                </Text>
              </View>
              <Pressable onPress={() => eliminarUsuario(u)} hitSlop={10} style={{ padding: 6 }}>
                <Ionicons name="trash-outline" size={18} color={colors.pink} />
              </Pressable>
            </Pressable>
          ))}
          <View style={{ marginTop: 8 }}>
            <NeoButton
              label="+ Nuevo usuario"
              variant="yellow"
              onPress={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            />
          </View>
        </Section>

        <Section title="BASE DE DATOS">
          <Text style={txtHint(colors.textMuted)}>
            EL RESPALDO SE HACE DESDE CORTE DE CAJA. AQUI PUEDES RESTAURAR UN RESPALDO EXISTENTE.
          </Text>
          <NeoButton label="Restaurar BD" variant="blue" onPress={restaurarBD} />
        </Section>

        <Section title="SESION">
          <NeoButton label="Cerrar sesion" variant="pink" onPress={cerrarSesion} />
        </Section>

        <Text
          style={{
            color: colors.textMuted,
            textAlign: "center",
            fontFamily: "SpaceGrotesk_500Medium",
            fontSize: 11,
            marginTop: 10,
          }}
        >
          BLACK MAMBA POS · V{Constants.expoConfig?.version ?? "1.0.0"}
        </Text>
      </ScrollView>

      <UsuarioModal
        visible={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSaved={async () => {
          setModalOpen(false);
          await load();
        }}
      />
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.border,
        padding: 12,
        gap: 8,
      }}
    >
      <Text
        style={{
          color: colors.textMuted,
          fontFamily: "SpaceGrotesk_700Bold",
          fontSize: 11,
          letterSpacing: 1,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      {children}
    </View>
  );
}

const txtLabel = (c: string) =>
  ({ color: c, fontFamily: "SpaceGrotesk_700Bold", fontSize: 14 } as const);

const txtHint = (c: string) =>
  ({ color: c, fontFamily: "SpaceGrotesk_500Medium", fontSize: 11 } as const);

const inputStyle = (c: { card: string; text: string }) => ({
  backgroundColor: c.card,
  borderColor: "#000",
  borderWidth: 2,
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingVertical: 10,
  color: c.text,
  fontFamily: "SpaceGrotesk_700Bold",
  fontSize: 14,
});

function UsuarioModal({
  visible,
  editing,
  onClose,
  onSaved,
}: {
  visible: boolean;
  editing: Usuario | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const { colors } = useTheme();
  const [nombre, setNombre] = useState("");
  const [pin, setPin] = useState("");
  const [rol, setRol] = useState<"Admin" | "Cajero">("Cajero");

  useEffect(() => {
    if (editing) {
      setNombre(editing.Nombre);
      setPin(editing.Pin ?? "");
      setRol(editing.Rol);
    } else {
      setNombre("");
      setPin("");
      setRol("Cajero");
    }
  }, [editing, visible]);

  const save = async () => {
    if (!nombre.trim()) {
      Alert.alert("FALTA NOMBRE");
      return;
    }
    const payload = {
      Nombre: nombre.trim().toUpperCase(),
      Pin: pin.trim() ? pin.trim() : null,
      Rol: rol,
    };
    if (editing) await updateUsuario(editing.Id, payload);
    else await createUsuario(payload);
    await onSaved();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          padding: 16,
          backgroundColor: "rgba(0,0,0,0.6)",
        }}
      >
        <View
          style={{
            backgroundColor: colors.bg,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: "#000",
            padding: 16,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontFamily: "SpaceGrotesk_700Bold",
              fontSize: 16,
              marginBottom: 10,
              letterSpacing: 1,
            }}
          >
            {editing ? "EDITAR USUARIO" : "NUEVO USUARIO"}
          </Text>
          <Text style={txtHint(colors.textMuted)}>NOMBRE</Text>
          <TextInput
            value={nombre}
            onChangeText={(t) => setNombre(t.toUpperCase())}
            autoCapitalize="characters"
            style={inputStyle(colors)}
          />
          <View style={{ height: 8 }} />
          <Text style={txtHint(colors.textMuted)}>PIN (4 DIGITOS, VACIO = SIN PIN)</Text>
          <TextInput
            value={pin}
            onChangeText={(t) => setPin(t.replace(/\D/g, "").slice(0, 4))}
            keyboardType="number-pad"
            secureTextEntry
            style={inputStyle(colors)}
          />
          <View style={{ height: 8 }} />
          <Text style={txtHint(colors.textMuted)}>ROL</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
            {(["Admin", "Cajero"] as const).map((r) => (
              <Pressable
                key={r}
                onPress={() => setRol(r)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderWidth: 2,
                  borderColor: "#000",
                  borderRadius: 10,
                  alignItems: "center",
                  backgroundColor: rol === r ? colors.yellow : colors.card,
                }}
              >
                <Text
                  style={{
                    color: rol === r ? "#000" : colors.text,
                    fontFamily: "SpaceGrotesk_700Bold",
                    letterSpacing: 1,
                  }}
                >
                  {r.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
            <View style={{ flex: 1 }}>
              <NeoButton label="Cancelar" variant="surface" full onPress={onClose} />
            </View>
            <View style={{ flex: 1 }}>
              <NeoButton label="Guardar" variant="green" full onPress={save} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
