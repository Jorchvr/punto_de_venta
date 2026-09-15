import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/Header";
import { NeoButton } from "@/components/NeoButton";
import {
  fromSqlite,
  toSqlite,
  ventasByRango,
  type Venta,
} from "@/db/ventas.repo";
import { useTheme } from "@/stores/theme.store";
import { addDays, endOfDay, fmtDate, fmtTime, startOfDay } from "@/utils/date";
import { money } from "@/utils/money";

type TabKey = "vendedores" | "productos" | "detalle";
type Quick = "HOY" | "SEMANA" | "MES" | "90D" | "TODO";

export default function HistorialScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [desde, setDesde] = useState<Date>(startOfDay(new Date()));
  const [hasta, setHasta] = useState<Date>(endOfDay(new Date()));
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);
  const [tab, setTab] = useState<TabKey>("vendedores");
  const [ventas, setVentas] = useState<Venta[]>([]);

  const load = useCallback(async () => {
    const rows = await ventasByRango(toSqlite(desde), toSqlite(hasta));
    setVentas(rows);
  }, [desde, hasta]);

  useEffect(() => {
    load();
  }, [load]);

  const setQuick = (q: Quick) => {
    const now = new Date();
    if (q === "HOY") {
      setDesde(startOfDay(now));
      setHasta(endOfDay(now));
    } else if (q === "SEMANA") {
      setDesde(startOfDay(addDays(now, -7)));
      setHasta(endOfDay(now));
    } else if (q === "MES") {
      setDesde(startOfDay(addDays(now, -30)));
      setHasta(endOfDay(now));
    } else if (q === "90D") {
      setDesde(startOfDay(addDays(now, -90)));
      setHasta(endOfDay(now));
    } else {
      setDesde(new Date(2000, 0, 1));
      setHasta(endOfDay(now));
    }
  };

  const activas = useMemo(() => ventas.filter((v) => v.Refundada === 0), [ventas]);

  const ingresoTotal = activas.reduce((a, v) => a + v.Total, 0);
  const unidades = activas.reduce((a, v) => {
    const m = /^(\d+)x/.exec(v.Concepto);
    return a + (m ? parseInt(m[1], 10) : 0);
  }, 0);
  const vendedores = new Set(activas.map((v) => v.Usuario));

  const topByUser = useMemo(() => {
    const map = new Map<string, { tickets: Set<string>; unidades: number; ingreso: number }>();
    for (const v of activas) {
      const k = v.Usuario;
      const m = /^(\d+)x/.exec(v.Concepto);
      const cant = m ? parseInt(m[1], 10) : 0;
      const cur = map.get(k) ?? { tickets: new Set(), unidades: 0, ingreso: 0 };
      const day = fmtDate(fromSqlite(v.Fecha));
      cur.tickets.add(day + "|" + v.Id);
      cur.unidades += cant;
      cur.ingreso += v.Total;
      map.set(k, cur);
    }
    return Array.from(map.entries())
      .map(([usuario, s]) => ({
        usuario,
        tickets: s.tickets.size,
        unidades: s.unidades,
        ingreso: s.ingreso,
      }))
      .sort((a, b) => b.ingreso - a.ingreso);
  }, [activas]);

  const topByProd = useMemo(() => {
    const map = new Map<string, { cantidad: number; ingreso: number }>();
    for (const v of activas) {
      const m = /^(\d+)x\s*(.*)$/.exec(v.Concepto);
      if (!m) continue;
      const nombre = m[2].trim();
      const cant = parseInt(m[1], 10);
      const cur = map.get(nombre) ?? { cantidad: 0, ingreso: 0 };
      cur.cantidad += cant;
      cur.ingreso += v.Total;
      map.set(nombre, cur);
    }
    return Array.from(map.entries())
      .map(([producto, s]) => ({ producto, ...s }))
      .sort((a, b) => b.ingreso - a.ingreso);
  }, [activas]);

  const topVendedor = topByUser[0]?.usuario ?? "—";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface2 }} edges={["top"]}>
      <Header title="Historial" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          padding: 12,
          paddingBottom: 40,
          width: "100%",
          maxWidth: 1200,
          alignSelf: "center",
        }}
      >
        <View style={{ flexDirection: "row", gap: 8 }}>
          <DatePill
            label="DESDE"
            value={desde}
            onPress={() => setShowFrom(true)}
          />
          <DatePill label="HASTA" value={hasta} onPress={() => setShowTo(true)} />
        </View>
        {showFrom && (
          <DateTimePicker
            value={desde}
            mode="date"
            onChange={(_, d) => {
              setShowFrom(Platform.OS === "ios");
              if (d) setDesde(startOfDay(d));
            }}
          />
        )}
        {showTo && (
          <DateTimePicker
            value={hasta}
            mode="date"
            onChange={(_, d) => {
              setShowTo(Platform.OS === "ios");
              if (d) setHasta(endOfDay(d));
            }}
          />
        )}
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8, gap: 6 }}>
          {(["HOY", "SEMANA", "MES", "90D", "TODO"] as Quick[]).map((q) => (
            <QuickChip key={q} label={q} onPress={() => setQuick(q)} />
          ))}
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 14, gap: 8 }}>
          <KPI label="INGRESO TIENDA" value={money(ingresoTotal)} color={colors.green} />
          <KPI label="UNIDADES" value={String(unidades)} />
          <KPI label="VENDEDORES" value={String(vendedores.size)} />
          <KPI label="TOP VENDEDOR" value={topVendedor.toUpperCase()} />
        </View>

        <View
          style={{
            flexDirection: "row",
            marginTop: 14,
            borderRadius: 10,
            overflow: "hidden",
            borderWidth: 2,
            borderColor: colors.border,
          }}
        >
          {(["vendedores", "productos", "detalle"] as TabKey[]).map((k) => (
            <Pressable
              key={k}
              onPress={() => setTab(k)}
              style={{
                flex: 1,
                paddingVertical: 10,
                backgroundColor: tab === k ? colors.accent : colors.card,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: tab === k ? colors.white : colors.text,
                  fontFamily: "SpaceGrotesk_700Bold",
                  fontSize: 13,
                  letterSpacing: 0.3,
                }}
              >
                {k[0].toUpperCase() + k.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={{ marginTop: 10 }}>
          {tab === "vendedores" && (
            <TableCard>
              <Row header cells={["#", "USUARIO", "TICKETS", "UND.", "INGRESO"]} widths={[30, 130, 60, 50, 90]} />
              {topByUser.map((r, i) => (
                <Row
                  key={r.usuario}
                  cells={[
                    String(i + 1),
                    r.usuario.toUpperCase(),
                    String(r.tickets),
                    String(r.unidades),
                    money(r.ingreso),
                  ]}
                  widths={[30, 130, 60, 50, 90]}
                />
              ))}
              {topByUser.length === 0 && <Empty />}
            </TableCard>
          )}
          {tab === "productos" && (
            <TableCard>
              <Row header cells={["#", "PRODUCTO", "CANT.", "INGRESO"]} widths={[30, 170, 60, 90]} />
              {topByProd.map((r, i) => (
                <Row
                  key={r.producto}
                  cells={[String(i + 1), r.producto.toUpperCase(), String(r.cantidad), money(r.ingreso)]}
                  widths={[30, 170, 60, 90]}
                />
              ))}
              {topByProd.length === 0 && <Empty />}
            </TableCard>
          )}
          {tab === "detalle" && <Detalle ventas={ventas} />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DatePill({
  label,
  value,
  onPress,
}: {
  label: string;
  value: Date;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: colors.card,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: 10,
        padding: 10,
      }}
    >
      <Text
        style={{
          color: colors.textMuted,
          fontFamily: "SpaceGrotesk_700Bold",
          fontSize: 10,
          letterSpacing: 1,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: colors.text,
          fontFamily: "SpaceGrotesk_700Bold",
          fontSize: 14,
          marginTop: 2,
        }}
      >
        {fmtDate(value)}
      </Text>
    </Pressable>
  );
}

function QuickChip({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: colors.surface2,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text
        style={{
          color: colors.text,
          fontFamily: "SpaceGrotesk_700Bold",
          fontSize: 11,
          letterSpacing: 1,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function KPI({ label, value, color }: { label: string; value: string; color?: string }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexGrow: 1,
        minWidth: 140,
        backgroundColor: colors.card,
        borderWidth: 2,
        borderColor: colors.borderStrong,
        borderRadius: 10,
        padding: 10,
      }}
    >
      <Text
        style={{
          color: colors.textMuted,
          fontFamily: "SpaceGrotesk_700Bold",
          fontSize: 10,
          letterSpacing: 1,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: color ?? colors.text,
          fontFamily: "SpaceGrotesk_700Bold",
          fontSize: 18,
          marginTop: 2,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function TableCard({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: 10,
        padding: 6,
      }}
    >
      {children}
    </View>
  );
}

function Row({
  cells,
  widths,
  header,
}: {
  cells: string[];
  widths: number[];
  header?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderBottomWidth: header ? 2 : 1,
        borderColor: colors.border,
      }}
    >
      {cells.map((c, i) => (
        <Text
          key={i}
          numberOfLines={1}
          style={{
            width: widths[i],
            color: header ? colors.textMuted : colors.text,
            fontFamily: header ? "SpaceGrotesk_700Bold" : "SpaceGrotesk_500Medium",
            fontSize: header ? 10 : 12,
            letterSpacing: header ? 1 : 0,
          }}
        >
          {c}
        </Text>
      ))}
    </View>
  );
}

function Empty() {
  const { colors } = useTheme();
  return (
    <Text style={{ color: colors.textMuted, padding: 20, textAlign: "center" }}>
      SIN DATOS
    </Text>
  );
}

function Detalle({ ventas }: { ventas: Venta[] }) {
  const { colors } = useTheme();
  const grouped = useMemo(() => {
    const map = new Map<string, Venta[]>();
    for (const v of ventas) {
      const arr = map.get(v.Usuario) ?? [];
      arr.push(v);
      map.set(v.Usuario, arr);
    }
    return Array.from(map.entries());
  }, [ventas]);

  if (grouped.length === 0) return <Empty />;

  return (
    <View style={{ gap: 10 }}>
      {grouped.map(([usuario, lista]) => (
        <View
          key={usuario}
          style={{
            backgroundColor: colors.card,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: colors.border,
            padding: 10,
          }}
        >
          <Text
            style={{
              color: colors.accent,
              fontFamily: "SpaceGrotesk_700Bold",
              fontSize: 13,
              letterSpacing: 1,
              marginBottom: 6,
            }}
          >
            {usuario.toUpperCase()} • {lista.length} MOV.
          </Text>
          {lista.map((v) => (
            <View
              key={v.Id}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 4,
                borderBottomWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: v.Refundada ? colors.pink : colors.text,
                    fontFamily: "SpaceGrotesk_500Medium",
                    fontSize: 12,
                    textDecorationLine: v.Refundada ? "line-through" : "none",
                  }}
                >
                  {v.Concepto.toUpperCase()}
                </Text>
                <Text
                  style={{
                    color: colors.textMuted,
                    fontFamily: "SpaceGrotesk_500Medium",
                    fontSize: 10,
                  }}
                >
                  {fmtDate(fromSqlite(v.Fecha))} {fmtTime(fromSqlite(v.Fecha))} • {v.MetodoPago.toUpperCase()}
                  {v.Refundada ? " • REFUNDIDA" : ""}
                </Text>
              </View>
              <Text
                style={{
                  color: v.Refundada ? colors.pink : colors.green,
                  fontFamily: "SpaceGrotesk_700Bold",
                  fontSize: 13,
                }}
              >
                {money(v.Total)}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
