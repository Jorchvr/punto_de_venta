import React, { useCallback, useEffect, useState } from "react";
import {
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
import { useCloud } from "@/stores/cloud.store";
import { restaurar as restaurarBDPlatform } from "@/utils/backup";
import { avisar, confirmar } from "@/utils/confirm";
import { healthCheck } from "@/api/client";

export default function AjustesScreen() {
  const { colors } = useTheme();
  const { negocio, setNegocio } = useSession();
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
    await setNegocio(neg.trim().toUpperCase() || "POWER GYM");
    avisar("Guardado");
  };

  const restaurarBD = async () => {
    try {
      const r = await restaurarBDPlatform();
      if (r.ok) avisar("BD restaurada", r.message);
      else if (r.message) avisar("Aviso", r.message);
    } catch (e: any) {
      avisar("Error", String(e?.message ?? e));
    }
  };

  const eliminarUsuario = (u: Usuario) => {
    confirmar(
      "Eliminar usuario",
      `¿Eliminar ${u.Nombre}?`,
      async () => {
        await deleteUsuario(u.Id);
        await load();
      },
      { textoConfirmar: "Eliminar", destructivo: true }
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface2 }} edges={["top"]}>
      <Header title="Ajustes" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          padding: 14,
          paddingBottom: 40,
          gap: 14,
          width: "100%",
          maxWidth: 800,
          alignSelf: "center",
        }}
      >
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
                <Text style={{ color: colors.textMuted, fontFamily: "Fraunces_500Medium", fontSize: 11 }}>
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

        <NubeSection />

        <Text
          style={{
            color: colors.textMuted,
            textAlign: "center",
            fontFamily: "Fraunces_500Medium",
            fontSize: 11,
            marginTop: 10,
          }}
        >
          POWER GYM POS · v{Constants.expoConfig?.version ?? "1.0.0"}
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

function NubeSection() {
  const { colors } = useTheme();
  const { enabled, apiKey, status, lastError, setEnabled, setApiKey } = useCloud();
  const [key, setKey] = useState(apiKey);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    setKey(apiKey);
  }, [apiKey]);

  const guardar = async () => {
    await setApiKey(key.trim());
    avisar("API key guardada");
  };

  const probar = async () => {
    setChecking(true);
    const ok = await healthCheck();
    setChecking(false);
    avisar(ok ? "Conexión OK" : "Error de conexión", ok ? undefined : lastError ?? "");
  };

  const dotColor =
    status === "ok" ? colors.success : status === "error" ? colors.danger : colors.textMuted;

  return (
    <Section title="BD EN LA NUBE (CLOUDFLARE D1)">
      <Text style={txtHint(colors.textMuted)}>
        SI ACTIVAS, TODAS LAS VENTAS/PRODUCTOS/USUARIOS SE COMPARTEN ENTRE TODOS LOS DISPOSITIVOS QUE USEN LA MISMA API KEY.
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: dotColor }} />
        <Text style={{ color: colors.textMuted, fontFamily: "Fraunces_600SemiBold", fontSize: 12 }}>
          {status === "ok" ? "CONECTADO" : status === "error" ? "ERROR" : "INACTIVO"}
        </Text>
        <View style={{ flex: 1 }} />
        <Switch value={enabled} onValueChange={setEnabled} />
      </View>
      <Text style={txtHint(colors.textMuted)}>API KEY</Text>
      <TextInput
        value={key}
        onChangeText={setKey}
        placeholder="pega aquí la clave que configuraste en Cloudflare"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        autoCapitalize="none"
        style={inputStyle(colors)}
      />
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <NeoButton label="Guardar" variant="green" full onPress={guardar} />
        </View>
        <View style={{ flex: 1 }}>
          <NeoButton
            label={checking ? "Probando..." : "Probar conexión"}
            variant="blue"
            full
            onPress={probar}
            disabled={checking || !key.trim()}
          />
        </View>
      </View>
      {lastError && status === "error" && (
        <Text style={{ color: colors.danger, fontFamily: "Fraunces_500Medium", fontSize: 11 }}>
          {lastError}
        </Text>
      )}
    </Section>
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
          fontFamily: "Fraunces_700Bold",
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
  ({ color: c, fontFamily: "Fraunces_700Bold", fontSize: 14 } as const);

const txtHint = (c: string) =>
  ({ color: c, fontFamily: "Fraunces_500Medium", fontSize: 11 } as const);

const inputStyle = (c: { card: string; text: string }) => ({
  backgroundColor: c.card,
  borderColor: "#D9D9DF",
  borderWidth: 1,
  borderRadius: 12,
  paddingHorizontal: 12,
  paddingVertical: 10,
  color: c.text,
  fontFamily: "Fraunces_700Bold",
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
      avisar("Falta el nombre");
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
            borderColor: colors.borderStrong,
            padding: 16,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontFamily: "Fraunces_700Bold",
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
                  borderColor: colors.borderStrong,
                  borderRadius: 10,
                  alignItems: "center",
                  backgroundColor: rol === r ? colors.yellow : colors.card,
                }}
              >
                <Text
                  style={{
                    color: rol === r ? "#000" : colors.text,
                    fontFamily: "Fraunces_700Bold",
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
