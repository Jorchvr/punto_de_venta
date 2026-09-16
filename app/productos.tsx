import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
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
import { Header } from "@/components/Header";
import { NeoButton } from "@/components/NeoButton";
import {
  createProducto,
  deleteProducto,
  listProductos,
  updateProducto,
  type Producto,
  type ProductoInput,
} from "@/db/productos.repo";
import { useTheme } from "@/stores/theme.store";
import { money } from "@/utils/money";
import { avisar, confirmar } from "@/utils/confirm";

export default function ProductosScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [items, setItems] = useState<Producto[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Producto | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setItems(await listProductos(search));
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (p: Producto) => {
    setEditing(p);
    setModalOpen(true);
  };

  const remove = (p: Producto) => {
    confirmar(
      "Eliminar producto",
      `¿Eliminar ${p.Nombre}?`,
      async () => {
        await deleteProducto(p.Id);
        await load();
      },
      { textoConfirmar: "Eliminar", destructivo: true }
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface2 }} edges={["top"]}>
      <Header title="Productos" onBack={() => router.back()} />
      <View
        style={{
          padding: 10,
          flexDirection: "row",
          gap: 8,
          width: "100%",
          maxWidth: 1000,
          alignSelf: "center",
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderWidth: 2,
            borderRadius: 10,
            paddingHorizontal: 10,
          }}
        >
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={(t) => setSearch(t.toUpperCase())}
            placeholder="BUSCAR..."
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            style={{
              flex: 1,
              color: colors.text,
              paddingVertical: 10,
              paddingHorizontal: 8,
              fontFamily: "Fraunces_500Medium",
              fontSize: 13,
            }}
          />
        </View>
        <NeoButton label="+ NUEVO" variant="green" onPress={openNew} />
      </View>

      <FlatList
        data={items}
        keyExtractor={(p) => String(p.Id)}
        style={{ width: "100%", maxWidth: 1000, alignSelf: "center" }}
        contentContainerStyle={{ padding: 10, paddingBottom: 40 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => openEdit(item)}
            onLongPress={() => remove(item)}
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderWidth: 2,
              borderRadius: 10,
              padding: 12,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.text,
                  fontFamily: "Fraunces_700Bold",
                  fontSize: 14,
                }}
              >
                {item.Nombre.toUpperCase()}
              </Text>
              <Text
                style={{
                  color: colors.textMuted,
                  fontFamily: "Fraunces_500Medium",
                  fontSize: 11,
                  marginTop: 2,
                }}
              >
                {item.EsServicio ? "SERVICIO" : `STOCK: ${item.Stock}`}
                {item.CodigoBarras ? `  •  ${item.CodigoBarras}` : ""}
              </Text>
            </View>
            <Text
              style={{
                color: colors.green,
                fontFamily: "Fraunces_700Bold",
                fontSize: 16,
              }}
            >
              {money(item.Precio)}
            </Text>
            <Pressable onPress={() => remove(item)} hitSlop={10} style={{ padding: 8, marginLeft: 4 }}>
              <Ionicons name="trash-outline" size={18} color={colors.pink} />
            </Pressable>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={{ color: colors.textMuted, textAlign: "center", padding: 30 }}>
            SIN PRODUCTOS
          </Text>
        }
      />

      <ProductoModal
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

function ProductoModal({
  visible,
  editing,
  onClose,
  onSaved,
}: {
  visible: boolean;
  editing: Producto | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const { colors } = useTheme();
  const [form, setForm] = useState<ProductoInput>({
    Nombre: "",
    Precio: 0,
    Stock: 0,
    Costo: 0,
    CodigoBarras: "",
    EsServicio: 0,
  });
  const [precioStr, setPrecioStr] = useState("");
  const [stockStr, setStockStr] = useState("");
  const [costoStr, setCostoStr] = useState("");

  useEffect(() => {
    if (editing) {
      setForm({
        Nombre: editing.Nombre,
        Precio: editing.Precio,
        Stock: editing.Stock,
        Costo: editing.Costo,
        CodigoBarras: editing.CodigoBarras,
        EsServicio: editing.EsServicio,
      });
      setPrecioStr(String(editing.Precio));
      setStockStr(String(editing.Stock));
      setCostoStr(String(editing.Costo));
    } else {
      setForm({
        Nombre: "",
        Precio: 0,
        Stock: 0,
        Costo: 0,
        CodigoBarras: "",
        EsServicio: 0,
      });
      setPrecioStr("");
      setStockStr("");
      setCostoStr("");
    }
  }, [editing, visible]);

  const save = async () => {
    if (!form.Nombre.trim()) {
      avisar("Falta el nombre");
      return;
    }
    const payload: ProductoInput = {
      ...form,
      Nombre: form.Nombre.trim().toUpperCase(),
      Precio: parseFloat(precioStr) || 0,
      Stock: parseInt(stockStr, 10) || 0,
      Costo: parseFloat(costoStr) || 0,
    };
    if (editing) await updateProducto(editing.Id, payload);
    else await createProducto(payload);
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
            maxHeight: "90%",
          }}
        >
          <ScrollView>
            <Text
              style={{
                color: colors.text,
                fontFamily: "Fraunces_700Bold",
                fontSize: 18,
                letterSpacing: 1,
                marginBottom: 12,
              }}
            >
              {editing ? "EDITAR PRODUCTO" : "NUEVO PRODUCTO"}
            </Text>
            <Field
              label="NOMBRE"
              value={form.Nombre}
              onChange={(t) => setForm({ ...form, Nombre: t.toUpperCase() })}
              autoCapitalize="characters"
            />
            <Field
              label="CODIGO DE BARRAS (OPCIONAL)"
              value={form.CodigoBarras}
              onChange={(t) => setForm({ ...form, CodigoBarras: t })}
            />
            <Field
              label="COSTO"
              value={costoStr}
              onChange={setCostoStr}
              keyboardType="decimal-pad"
            />
            <Field
              label="PRECIO DE VENTA"
              value={precioStr}
              onChange={setPrecioStr}
              keyboardType="decimal-pad"
            />
            <Field
              label="STOCK INICIAL"
              value={stockStr}
              onChange={setStockStr}
              keyboardType="number-pad"
              disabled={form.EsServicio === 1}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 8,
                paddingVertical: 8,
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontFamily: "Fraunces_700Bold",
                  fontSize: 12,
                  letterSpacing: 1,
                }}
              >
                ES SERVICIO (SIN STOCK)
              </Text>
              <Switch
                value={form.EsServicio === 1}
                onValueChange={(v) =>
                  setForm({ ...form, EsServicio: v ? 1 : 0, Stock: v ? 0 : form.Stock })
                }
              />
            </View>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
              <View style={{ flex: 1 }}>
                <NeoButton label="Cancelar" variant="surface" full onPress={onClose} />
              </View>
              <View style={{ flex: 1 }}>
                <NeoButton label="Guardar" variant="green" full onPress={save} />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function Field({
  label,
  value,
  onChange,
  keyboardType,
  autoCapitalize,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (t: string) => void;
  keyboardType?: "default" | "decimal-pad" | "number-pad";
  autoCapitalize?: "characters" | "none";
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ marginTop: 8 }}>
      <Text
        style={{
          color: colors.textMuted,
          fontFamily: "Fraunces_700Bold",
          fontSize: 11,
          letterSpacing: 1,
          marginBottom: 4,
        }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        editable={!disabled}
        keyboardType={keyboardType ?? "default"}
        autoCapitalize={autoCapitalize ?? "none"}
        style={{
          backgroundColor: colors.card,
          borderColor: colors.borderStrong,
          borderWidth: 2,
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 10,
          color: colors.text,
          fontFamily: "Fraunces_500Medium",
          fontSize: 14,
          opacity: disabled ? 0.5 : 1,
        }}
      />
    </View>
  );
}
