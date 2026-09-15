import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/Header";
import { NeoButton } from "@/components/NeoButton";
import { ProductCard } from "@/components/ProductCard";
import { CartItemRow } from "@/components/CartItem";
import { PaymentMethodChip, METODOS } from "@/components/PaymentMethodChip";
import { Ticket } from "@/components/Ticket";
import { listProductos, type Producto } from "@/db/productos.repo";
import { checkoutCart, type MetodoPago } from "@/db/ventas.repo";
import { useCart } from "@/stores/cart.store";
import { useSession } from "@/stores/session.store";
import { useTheme } from "@/stores/theme.store";
import { money, parseAmount } from "@/utils/money";

type MobileTab = "productos" | "carrito";

export default function POSScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { colors } = useTheme();
  const cart = useCart();
  const { usuario, negocio } = useSession();
  const router = useRouter();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [search, setSearch] = useState("");
  const [mobileTab, setMobileTab] = useState<MobileTab>("productos");
  const [ticket, setTicket] = useState<null | {
    folio: number;
    fecha: Date;
    items: typeof cart.items;
    metodo: MetodoPago;
    total: number;
    recibido?: number;
    cambio?: number;
  }>(null);

  const load = useCallback(async () => {
    const rows = await listProductos(search);
    setProductos(rows);
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!usuario) router.replace("/login");
  }, [usuario, router]);

  const total = cart.total();
  const requiereCambio = cart.metodo === "Efectivo" || cart.metodo === "Dolares";
  const recibidoNum = parseAmount(cart.recibido);
  const cambio = requiereCambio ? recibidoNum - total : 0;
  const puedeCobrar =
    cart.items.length > 0 && (!requiereCambio || recibidoNum >= total);

  const cobrar = async () => {
    if (!puedeCobrar || !usuario) return;
    try {
      const ids = await checkoutCart(
        cart.items.map((i) => ({
          productoId: i.productoId,
          nombre: i.nombre,
          precio: i.precio,
          cantidad: i.cantidad,
          esServicio: i.esServicio,
        })),
        cart.metodo,
        usuario
      );
      const t = {
        folio: ids[0],
        fecha: new Date(),
        items: cart.items,
        metodo: cart.metodo,
        total,
        recibido: requiereCambio ? recibidoNum : undefined,
        cambio: requiereCambio ? cambio : undefined,
      };
      cart.clear();
      setTicket(t);
      setMobileTab("productos");
      await load();
    } catch (e: any) {
      Alert.alert("ERROR", String(e?.message ?? e));
    }
  };

  const productsPanel = (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          margin: 10,
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
          placeholder="BUSCAR PRODUCTO O CODIGO..."
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
          style={{
            flex: 1,
            color: colors.text,
            paddingVertical: 10,
            paddingHorizontal: 8,
            fontFamily: "SpaceGrotesk_500Medium",
            fontSize: 13,
          }}
        />
        {!!search && (
          <Pressable onPress={() => setSearch("")} hitSlop={10}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </View>
      <FlatList
        data={productos}
        keyExtractor={(p) => String(p.Id)}
        numColumns={isTablet ? undefined : 2}
        key={isTablet ? "grid-t" : "grid-m"}
        contentContainerStyle={{
          paddingHorizontal: 6,
          paddingBottom: 20,
          flexDirection: isTablet ? "row" : undefined,
          flexWrap: isTablet ? "wrap" : undefined,
        }}
        columnWrapperStyle={
          !isTablet ? { justifyContent: "space-between" } : undefined
        }
        renderItem={({ item }) => (
          <ProductCard
            producto={item}
            onPress={() =>
              cart.add({
                productoId: item.Id,
                nombre: item.Nombre,
                precio: item.Precio,
                stock: item.Stock,
                esServicio: item.EsServicio,
              })
            }
            width={isTablet ? 180 : (width - 40) / 2}
          />
        )}
        ListEmptyComponent={
          <View style={{ padding: 40, alignItems: "center" }}>
            <Text
              style={{
                color: colors.textMuted,
                fontFamily: "SpaceGrotesk_500Medium",
              }}
            >
              SIN PRODUCTOS
            </Text>
          </View>
        }
      />
    </View>
  );

  const cartPanel = (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        padding: 12,
        borderLeftWidth: isTablet ? 2 : 0,
        borderColor: colors.border,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontFamily: "SpaceGrotesk_700Bold",
            fontSize: 16,
            letterSpacing: 1,
          }}
        >
          CARRITO ({cart.count()})
        </Text>
        {cart.items.length > 0 && (
          <NeoButton
            label="Vaciar"
            variant="pink"
            size="sm"
            onPress={() => cart.clear()}
          />
        )}
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 8 }}>
        {cart.items.length === 0 ? (
          <View style={{ padding: 30, alignItems: "center" }}>
            <Ionicons name="cart-outline" size={48} color={colors.textMuted} />
            <Text
              style={{
                color: colors.textMuted,
                marginTop: 8,
                fontFamily: "SpaceGrotesk_500Medium",
                fontSize: 12,
              }}
            >
              AGREGA PRODUCTOS AL CARRITO
            </Text>
          </View>
        ) : (
          cart.items.map((it) => (
            <CartItemRow
              key={it.productoId}
              item={it}
              onInc={() => cart.inc(it.productoId)}
              onDec={() => cart.dec(it.productoId)}
              onRemove={() => cart.remove(it.productoId)}
            />
          ))
        )}
      </ScrollView>

      <View style={{ marginTop: 6 }}>
        <Text
          style={{
            color: colors.textMuted,
            fontFamily: "SpaceGrotesk_700Bold",
            fontSize: 11,
            letterSpacing: 1,
            marginBottom: 4,
          }}
        >
          METODO DE PAGO
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4 }}>
          {METODOS.map((m) => (
            <PaymentMethodChip
              key={m.key}
              method={m}
              selected={cart.metodo === m.key}
              onPress={() => cart.setMetodo(m.key)}
            />
          ))}
        </View>

        {requiereCambio && (
          <View style={{ marginTop: 10 }}>
            <Text
              style={{
                color: colors.textMuted,
                fontFamily: "SpaceGrotesk_700Bold",
                fontSize: 11,
                letterSpacing: 1,
                marginBottom: 4,
              }}
            >
              MONTO RECIBIDO
            </Text>
            <TextInput
              value={cart.recibido}
              onChangeText={cart.setRecibido}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              style={{
                backgroundColor: colors.card,
                borderWidth: 2,
                borderColor: colors.borderStrong,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: colors.text,
                fontFamily: "SpaceGrotesk_700Bold",
                fontSize: 18,
              }}
            />
            {cart.items.length > 0 && (
              <Text
                style={{
                  color: cambio >= 0 ? colors.green : colors.pink,
                  fontFamily: "SpaceGrotesk_700Bold",
                  fontSize: 14,
                  marginTop: 4,
                }}
              >
                CAMBIO: {money(Math.max(0, cambio))}
              </Text>
            )}
          </View>
        )}

        <View
          style={{
            marginTop: 10,
            paddingVertical: 10,
            paddingHorizontal: 12,
            backgroundColor: colors.surface2,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: colors.border,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontFamily: "SpaceGrotesk_700Bold",
              fontSize: 18,
              letterSpacing: 1,
            }}
          >
            TOTAL
          </Text>
          <Text
            style={{
              color: colors.green,
              fontFamily: "SpaceGrotesk_700Bold",
              fontSize: 26,
            }}
          >
            {money(total)}
          </Text>
        </View>
        <View style={{ marginTop: 10 }}>
          <NeoButton
            label="Cobrar venta"
            onPress={cobrar}
            variant="black"
            size="lg"
            full
            disabled={!puedeCobrar}
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <Header title="Power Gym" showBackoffice />
      {isTablet ? (
        <View style={{ flex: 1, flexDirection: "row" }}>
          <View style={{ flex: 6 }}>{productsPanel}</View>
          <View style={{ flex: 4 }}>{cartPanel}</View>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {mobileTab === "productos" ? productsPanel : cartPanel}
          <MobileTabs
            tab={mobileTab}
            setTab={setMobileTab}
            cartCount={cart.count()}
          />
        </View>
      )}
      <Ticket
        visible={ticket !== null}
        onClose={() => setTicket(null)}
        negocio={negocio}
        cajero={usuario ?? ""}
        folio={ticket?.folio ?? 0}
        fecha={ticket?.fecha ?? new Date()}
        items={ticket?.items ?? []}
        metodo={ticket?.metodo ?? "Efectivo"}
        total={ticket?.total ?? 0}
        recibido={ticket?.recibido}
        cambio={ticket?.cambio}
      />
    </SafeAreaView>
  );
}

function MobileTabs({
  tab,
  setTab,
  cartCount,
}: {
  tab: MobileTab;
  setTab: (t: MobileTab) => void;
  cartCount: number;
}) {
  const { colors } = useTheme();
  const router = useRouter();
  const items = [
    { key: "productos" as const, icon: "grid-outline", label: "PRODUCTOS" },
    { key: "carrito" as const, icon: "cart-outline", label: "CARRITO", badge: cartCount },
    { key: "historial", icon: "time-outline", label: "HISTORIAL", route: "/historial" },
    { key: "corte", icon: "receipt-outline", label: "CORTE", route: "/corte" },
    { key: "ajustes", icon: "settings-outline", label: "AJUSTES", route: "/ajustes" },
  ];
  return (
    <View
      style={{
        flexDirection: "row",
        borderTopWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.bg,
      }}
    >
      {items.map((it: any) => {
        const active = tab === it.key;
        return (
          <Pressable
            key={it.key}
            onPress={() => {
              if (it.route) router.push(it.route);
              else setTab(it.key);
            }}
            style={{
              flex: 1,
              paddingVertical: 8,
              alignItems: "center",
              backgroundColor: active ? colors.surface2 : "transparent",
            }}
          >
            <View>
              <Ionicons
                name={it.icon}
                size={22}
                color={active ? colors.accent : colors.textMuted}
              />
              {"badge" in it && it.badge > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -8,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: colors.accent,
                    paddingHorizontal: 4,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: colors.white,
                      fontFamily: "SpaceGrotesk_700Bold",
                      fontSize: 10,
                    }}
                  >
                    {it.badge}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={{
                fontSize: 9,
                marginTop: 4,
                color: active ? colors.text : colors.textMuted,
                fontFamily: "SpaceGrotesk_700Bold",
                letterSpacing: 0.5,
              }}
            >
              {it.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
