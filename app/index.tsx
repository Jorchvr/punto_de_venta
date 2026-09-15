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
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <Card>
        <SectionLabel>TIENDA · {productos.length} PRODUCTOS</SectionLabel>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.surface2,
            borderColor: colors.borderStrong,
            borderWidth: 1.5,
            borderRadius: 12,
            paddingHorizontal: 12,
            marginTop: 4,
          }}
        >
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={(t) => setSearch(t.toUpperCase())}
            placeholder="BUSCAR PRODUCTO O CÓDIGO"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            style={{
              flex: 1,
              color: colors.text,
              paddingVertical: 12,
              paddingHorizontal: 10,
              fontFamily: "SpaceGrotesk_600SemiBold",
              fontSize: 14,
            }}
          />
          {!!search && (
            <Pressable onPress={() => setSearch("")} hitSlop={10}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        <View style={{ marginTop: 14 }}>
          <SectionLabel>PRODUCTOS RÁPIDOS</SectionLabel>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginHorizontal: -8,
              marginTop: 4,
            }}
          >
            {productos.map((item) => (
              <ProductCard
                key={item.Id}
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
                width={isTablet ? 170 : (width - 64) / 2}
              />
            ))}
            {productos.length === 0 && (
              <View style={{ padding: 40, alignItems: "center", width: "100%" }}>
                <Text
                  style={{
                    color: colors.textMuted,
                    fontFamily: "SpaceGrotesk_700Bold",
                    letterSpacing: 0.5,
                  }}
                >
                  SIN PRODUCTOS
                </Text>
              </View>
            )}
          </View>
        </View>
      </Card>

      <View style={{ height: 14 }} />

      <Card>
        <SectionLabel>ACCIONES RÁPIDAS</SectionLabel>
        <QuickActions />
      </Card>
    </ScrollView>
  );

  const cartPanel = (
    <View style={{ flex: 1, padding: 12 }}>
      <Card style={{ flex: 1, padding: 0 }}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: 8,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottomWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontFamily: "SpaceGrotesk_700Bold",
              fontSize: 15,
              letterSpacing: 0.8,
            }}
          >
            CARRITO · {cart.count()} ITEMS
          </Text>
          {cart.items.length > 0 && (
            <Pressable
              onPress={() => cart.clear()}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: colors.danger,
              }}
            >
              <Text
                style={{
                  color: colors.danger,
                  fontFamily: "SpaceGrotesk_700Bold",
                  fontSize: 11,
                  letterSpacing: 0.5,
                }}
              >
                VACIAR
              </Text>
            </Pressable>
          )}
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10 }}
        >
          {cart.items.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: "center" }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 999,
                  backgroundColor: colors.surface2,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <Ionicons name="cart-outline" size={30} color={colors.textMuted} />
              </View>
              <Text
                style={{
                  color: colors.textMuted,
                  fontFamily: "SpaceGrotesk_600SemiBold",
                  fontSize: 13,
                  letterSpacing: 0.5,
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

        <View
          style={{
            padding: 14,
            borderTopWidth: 1,
            borderColor: colors.border,
            gap: 12,
          }}
        >
          <SectionLabel>MÉTODO DE PAGO</SectionLabel>
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
            <View>
              <SectionLabel>MONTO RECIBIDO</SectionLabel>
              <TextInput
                value={cart.recibido}
                onChangeText={cart.setRecibido}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                style={{
                  backgroundColor: colors.surface2,
                  borderWidth: 1.5,
                  borderColor: colors.borderStrong,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  color: colors.text,
                  fontFamily: "SpaceGrotesk_700Bold",
                  fontSize: 20,
                  marginTop: 4,
                }}
              />
              {cart.items.length > 0 && (
                <Text
                  style={{
                    color: cambio >= 0 ? colors.green : colors.danger,
                    fontFamily: "SpaceGrotesk_700Bold",
                    fontSize: 14,
                    marginTop: 6,
                    letterSpacing: 0.3,
                  }}
                >
                  CAMBIO: {money(Math.max(0, cambio))}
                </Text>
              )}
            </View>
          )}

          <View
            style={{
              paddingVertical: 14,
              paddingHorizontal: 16,
              backgroundColor: colors.text,
              borderRadius: 14,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: colors.white,
                fontFamily: "SpaceGrotesk_700Bold",
                fontSize: 16,
                letterSpacing: 1,
              }}
            >
              TOTAL
            </Text>
            <Text
              style={{
                color: colors.white,
                fontFamily: "SpaceGrotesk_700Bold",
                fontSize: 30,
                letterSpacing: 0.5,
              }}
            >
              {money(total)}
            </Text>
          </View>
          <NeoButton
            label="Cobrar venta"
            onPress={cobrar}
            variant="primary"
            size="lg"
            full
            disabled={!puedeCobrar}
          />
        </View>
      </Card>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface2 }} edges={["top"]}>
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

function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ position: "relative" }}>
      <View
        style={{
          position: "absolute",
          top: 5,
          left: 5,
          right: 0,
          bottom: 0,
          backgroundColor: "#0F0F17",
          borderRadius: 14,
        }}
      />
      <View
        style={[
          {
            backgroundColor: colors.card,
            borderColor: "#0F0F17",
            borderWidth: 2.5,
            borderRadius: 14,
            padding: 16,
          },
          style,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const QUICK = [
  { route: "/corte", icon: "receipt-outline" as const, label: "CORTE DE CAJA", color: "#FDE047" },
  { route: "/historial", icon: "time-outline" as const, label: "HISTORIAL", color: "#60A5FA" },
  { route: "/devoluciones", icon: "return-up-back" as const, label: "DEVOLUCIONES", color: "#F472B6" },
  { route: "/ajustes", icon: "settings-outline" as const, label: "AJUSTES", color: "#A78BFA" },
];

function QuickActions() {
  const router = useRouter();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -6 }}>
      {QUICK.map((q) => (
        <View key={q.route} style={{ width: "50%", padding: 6 }}>
          <QuickTile
            icon={q.icon}
            label={q.label}
            color={q.color}
            onPress={() => router.push(q.route as any)}
          />
        </View>
      ))}
    </View>
  );
}

function QuickTile({
  icon,
  label,
  color,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  color: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const [pressed, setPressed] = useState(false);
  const OFFSET = 5;
  const SHADOW = "#0F0F17";

  return (
    <View style={{ position: "relative", height: 92 }}>
      <View
        style={{
          position: "absolute",
          top: OFFSET,
          left: OFFSET,
          right: 0,
          bottom: 0,
          backgroundColor: SHADOW,
          borderRadius: 12,
        }}
      />
      <Pressable
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={{
          flex: 1,
          backgroundColor: colors.card,
          borderColor: SHADOW,
          borderWidth: 2.5,
          borderRadius: 12,
          padding: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          transform: [
            { translateX: pressed ? OFFSET : 0 },
            { translateY: pressed ? OFFSET : 0 },
          ],
        }}
      >
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 10,
            backgroundColor: color,
            borderWidth: 2.5,
            borderColor: SHADOW,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={icon} size={26} color={SHADOW} />
        </View>
        <Text
          style={{
            flex: 1,
            color: colors.text,
            fontFamily: "SpaceGrotesk_700Bold",
            fontSize: 14,
            letterSpacing: 0.6,
          }}
        >
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <Text
      style={{
        color: colors.textMuted,
        fontFamily: "SpaceGrotesk_700Bold",
        fontSize: 11,
        letterSpacing: 1.2,
        marginBottom: 8,
      }}
    >
      {children}
    </Text>
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
        borderTopWidth: 1,
        borderColor: colors.borderStrong,
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
              paddingVertical: 10,
              alignItems: "center",
              backgroundColor: active ? colors.surface2 : "transparent",
            }}
          >
            <View>
              <Ionicons
                name={it.icon}
                size={24}
                color={active ? colors.accent : colors.textMuted}
              />
              {"badge" in it && it.badge > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -8,
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
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
                      fontSize: 11,
                    }}
                  >
                    {it.badge}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={{
                fontSize: 10,
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
