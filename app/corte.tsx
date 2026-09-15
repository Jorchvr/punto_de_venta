import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/Header";
import { NeoButton } from "@/components/NeoButton";
import { fromSqlite, ventasHoy, type Venta } from "@/db/ventas.repo";
import { useSession } from "@/stores/session.store";
import { useTheme } from "@/stores/theme.store";
import { fmtDateTime, fmtTime } from "@/utils/date";
import { money } from "@/utils/money";
import { respaldar as respaldarBDPlatform } from "@/utils/backup";
import { printHtml } from "@/utils/print";

interface Grupo {
  metodo: string;
  ventas: number;
  monto: number;
}

export default function CorteScreen() {
  const { colors } = useTheme();
  const { usuario, negocio } = useSession();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [showDetalle, setShowDetalle] = useState(false);

  const load = useCallback(async () => {
    setVentas(await ventasHoy());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activas = useMemo(() => ventas.filter((v) => v.Refundada === 0), [ventas]);
  const total = activas.reduce((a, v) => a + v.Total, 0);
  const numVentas = activas.length;

  const grupos: Grupo[] = useMemo(() => {
    const metodos = ["Efectivo", "Transferencia", "Tarjeta", "Dolares"];
    return metodos.map((m) => {
      const list = activas.filter((v) => v.MetodoPago === m);
      return {
        metodo: m,
        ventas: list.length,
        monto: list.reduce((a, v) => a + v.Total, 0),
      };
    });
  }, [activas]);

  const compartirPDF = async () => {
    try {
      const html = corteHtml({ negocio, cajero: usuario ?? "", fecha: new Date(), numVentas, total, grupos, ventas });
      await printHtml(html);
    } catch (e: any) {
      Alert.alert("ERROR", String(e?.message ?? e));
    }
  };

  const respaldarBD = async () => {
    try {
      const r = await respaldarBDPlatform();
      if (!r.ok && r.message) Alert.alert("AVISO", r.message);
      else if (r.ok && r.message && Platform.OS === "web") Alert.alert("OK", r.message);
    } catch (e: any) {
      Alert.alert("ERROR", String(e?.message ?? e));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface2 }} edges={["top"]}>
      <Header title="Corte de caja" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          padding: 12,
          paddingBottom: 40,
          alignItems: "center",
          width: "100%",
          maxWidth: 800,
          alignSelf: "center",
        }}
      >
        <View
          style={{
            width: isTablet ? 340 : "100%",
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            borderWidth: 2,
            borderColor: colors.borderStrong,
            padding: 16,
          }}
        >
          <Text
            style={{
              textAlign: "center",
              fontFamily: "SpaceGrotesk_700Bold",
              fontSize: 22,
              color: "#000",
              letterSpacing: 2,
            }}
          >
            {negocio.toUpperCase()}
          </Text>
          <Text
            style={{
              textAlign: "center",
              fontFamily: "SpaceGrotesk_700Bold",
              fontSize: 12,
              color: "#000",
              letterSpacing: 2,
              marginTop: 2,
            }}
          >
            CORTE DE CAJA
          </Text>
          <TicketRow k="FECHA" v={fmtDateTime(new Date())} />
          <TicketRow k="CAJERO" v={(usuario ?? "").toUpperCase()} />
          <Dashed />
          <TicketRow k="# VENTAS" v={String(numVentas)} />
          <TicketRow k="INGRESOS" v={money(total)} />
          <Dashed />
          <TicketRow k="TOTAL CAJA" v={money(total)} big />
          <Dashed />
          <Text
            style={{
              fontFamily: "SpaceGrotesk_700Bold",
              fontSize: 11,
              color: "#000",
              letterSpacing: 1,
              marginBottom: 4,
            }}
          >
            DESGLOSE POR METODO
          </Text>
          {grupos.map((g) => (
            <TicketRow
              key={g.metodo}
              k={`${g.metodo.toUpperCase()} (${g.ventas})`}
              v={money(g.monto)}
            />
          ))}
          <Dashed />
          <Pressable
            onPress={() => setShowDetalle((v) => !v)}
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 6 }}
          >
            <Ionicons
              name={showDetalle ? "chevron-up" : "chevron-down"}
              size={16}
              color="#000"
            />
            <Text
              style={{
                fontFamily: "SpaceGrotesk_700Bold",
                fontSize: 11,
                color: "#000",
                letterSpacing: 1,
                marginLeft: 4,
              }}
            >
              {showDetalle ? "OCULTAR DETALLE" : "VER DETALLE"}
            </Text>
          </Pressable>
          {showDetalle &&
            ventas.map((v) => (
              <View
                key={v.Id}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 2,
                }}
              >
                <Text
                  style={{
                    color: "#000",
                    fontFamily: "SpaceGrotesk_500Medium",
                    fontSize: 10,
                    flex: 1,
                    textDecorationLine: v.Refundada ? "line-through" : "none",
                  }}
                >
                  {fmtTime(fromSqlite(v.Fecha))} {v.Concepto.toUpperCase()}
                </Text>
                <Text style={{ color: "#000", fontFamily: "SpaceGrotesk_700Bold", fontSize: 10 }}>
                  {money(v.Total)}
                </Text>
              </View>
            ))}
        </View>

        <View style={{ marginTop: 14, width: isTablet ? 340 : "100%", gap: 8 }}>
          <NeoButton label="Compartir PDF" variant="green" full onPress={compartirPDF} />
          <NeoButton label="Respaldar BD" variant="blue" full onPress={respaldarBD} />
          <NeoButton label="Cerrar" variant="black" full onPress={() => router.back()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TicketRow({ k, v, big }: { k: string; v: string; big?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 }}>
      <Text style={{ color: "#000", fontFamily: "SpaceGrotesk_700Bold", fontSize: big ? 14 : 11 }}>
        {k}
      </Text>
      <Text
        style={{
          color: "#000",
          fontFamily: big ? "SpaceGrotesk_700Bold" : "SpaceGrotesk_500Medium",
          fontSize: big ? 14 : 11,
        }}
      >
        {v}
      </Text>
    </View>
  );
}

function Dashed() {
  return (
    <View
      style={{
        borderTopWidth: 1,
        borderColor: "#D9D9DF",
        borderStyle: "dashed",
        marginVertical: 6,
      }}
    />
  );
}

function corteHtml(p: {
  negocio: string;
  cajero: string;
  fecha: Date;
  numVentas: number;
  total: number;
  grupos: Grupo[];
  ventas: Venta[];
}): string {
  const detalle = p.ventas
    .map(
      (v) => `<div style="display:flex;justify-content:space-between;font-size:10px;${
        v.Refundada ? "text-decoration:line-through" : ""
      }"><span>${fmtTime(fromSqlite(v.Fecha))} ${v.Concepto}</span><span>$${v.Total.toFixed(2)}</span></div>`
    )
    .join("");
  const desglose = p.grupos
    .map(
      (g) =>
        `<div style="display:flex;justify-content:space-between"><span>${g.metodo.toUpperCase()} (${g.ventas})</span><span>$${g.monto.toFixed(
          2
        )}</span></div>`
    )
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"/><style>
    body{font-family:'Courier New',monospace;color:#000;background:#fff;padding:16px;width:320px;margin:0 auto;font-size:12px}
    h1{text-align:center;font-size:20px;margin:0;letter-spacing:2px}
    h2{text-align:center;font-size:12px;margin:4px 0}
    hr{border:none;border-top:1px dashed #000;margin:6px 0}
    .row{display:flex;justify-content:space-between;padding:2px 0}
    .total{font-weight:bold;font-size:14px}
    .label{font-weight:bold;font-size:11px;letter-spacing:1px;margin-top:4px}
  </style></head><body>
    <h1>${p.negocio}</h1>
    <h2>CORTE DE CAJA</h2>
    <div class="row"><span>FECHA</span><span>${fmtDateTime(p.fecha)}</span></div>
    <div class="row"><span>CAJERO</span><span>${p.cajero.toUpperCase()}</span></div>
    <hr/>
    <div class="row"><span># VENTAS</span><span>${p.numVentas}</span></div>
    <div class="row"><span>INGRESOS</span><span>$${p.total.toFixed(2)}</span></div>
    <hr/>
    <div class="row total"><span>TOTAL CAJA</span><span>$${p.total.toFixed(2)}</span></div>
    <hr/>
    <div class="label">DESGLOSE POR METODO</div>
    ${desglose}
    <hr/>
    <div class="label">DETALLE</div>
    ${detalle}
  </body></html>`;
}
