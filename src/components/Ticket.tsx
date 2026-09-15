import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NeoButton } from "./NeoButton";
import { money } from "../utils/money";
import { fmtDateTime } from "../utils/date";
import { printHtml } from "../utils/print";
import type { CartItem } from "../stores/cart.store";
import type { MetodoPago } from "../db/ventas.repo";

interface Props {
  visible: boolean;
  onClose: () => void;
  negocio: string;
  cajero: string;
  folio: number;
  fecha: Date;
  items: CartItem[];
  metodo: MetodoPago;
  total: number;
  recibido?: number;
  cambio?: number;
}

function ticketHtml(p: Omit<Props, "visible" | "onClose">): string {
  const rows = p.items
    .map(
      (i) => `
        <tr>
          <td style="text-align:center">${i.cantidad}</td>
          <td>${i.nombre}</td>
          <td style="text-align:right">$${i.precio.toFixed(2)}</td>
          <td style="text-align:right">$${(i.precio * i.cantidad).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const cambioBlock =
    p.recibido != null
      ? `<div style="display:flex;justify-content:space-between"><span>RECIBIDO</span><span>$${p.recibido.toFixed(
          2
        )}</span></div>
         <div style="display:flex;justify-content:space-between"><span>CAMBIO</span><span>$${(
           p.cambio ?? 0
         ).toFixed(2)}</span></div>`
      : "";

  return `<!doctype html><html><head><meta charset="utf-8"/><style>
    body{font-family:'Courier New',monospace;color:#000;background:#fff;padding:16px;font-size:12px;width:300px;margin:0 auto}
    h1{text-align:center;font-size:20px;margin:0;letter-spacing:2px}
    h2{text-align:center;font-size:12px;margin:4px 0 8px}
    hr{border:none;border-top:1px dashed #000;margin:6px 0}
    table{width:100%;border-collapse:collapse}
    th,td{font-size:11px;padding:2px 0}
    th{border-bottom:1px solid #000;text-align:left}
    .row{display:flex;justify-content:space-between;font-size:12px;margin:2px 0}
    .total{font-weight:bold;font-size:14px}
    .center{text-align:center;font-size:10px;margin-top:8px}
  </style></head><body>
    <h1>${p.negocio}</h1>
    <h2>TICKET DE VENTA</h2>
    <div class="row"><span>FECHA</span><span>${fmtDateTime(p.fecha)}</span></div>
    <div class="row"><span>CAJERO</span><span>${p.cajero}</span></div>
    <div class="row"><span>FOLIO</span><span>#${p.folio}</span></div>
    <hr/>
    <table>
      <thead><tr><th>CANT</th><th>PRODUCTO</th><th style="text-align:right">P.U.</th><th style="text-align:right">TOTAL</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <hr/>
    <div class="row total"><span>TOTAL</span><span>$${p.total.toFixed(2)}</span></div>
    <div class="row"><span>METODO</span><span>${p.metodo.toUpperCase()}</span></div>
    ${cambioBlock}
    <div class="center">GRACIAS POR SU COMPRA</div>
  </body></html>`;
}

export function Ticket(p: Props) {
  const share = async () => {
    try {
      await printHtml(ticketHtml(p));
    } catch (e) {
      console.warn("share ticket", e);
    }
  };

  return (
    <Modal visible={p.visible} transparent animationType="fade" onRequestClose={p.onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
      >
        <View
          style={{
            width: 320,
            maxWidth: "100%",
            maxHeight: "90%",
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            borderWidth: 2,
            borderColor: "#000",
          }}
        >
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Text
              style={{
                textAlign: "center",
                fontFamily: "SpaceGrotesk_700Bold",
                fontSize: 20,
                letterSpacing: 2,
                color: "#000",
              }}
            >
              {p.negocio.toUpperCase()}
            </Text>
            <Text
              style={{
                textAlign: "center",
                fontFamily: "SpaceGrotesk_500Medium",
                fontSize: 11,
                color: "#000",
                marginBottom: 6,
              }}
            >
              TICKET DE VENTA
            </Text>
            <Row k="FECHA" v={fmtDateTime(p.fecha)} />
            <Row k="CAJERO" v={p.cajero.toUpperCase()} />
            <Row k="FOLIO" v={`#${p.folio}`} />
            <Dashed />
            <View style={{ flexDirection: "row", paddingVertical: 4 }}>
              <Cell w={40} txt="CANT" bold />
              <Cell w={120} txt="PRODUCTO" bold />
              <Cell w={50} txt="P.U." bold align="right" />
              <Cell w={60} txt="TOTAL" bold align="right" />
            </View>
            <View style={{ borderBottomWidth: 1, borderColor: "#000" }} />
            {p.items.map((i) => (
              <View
                key={i.productoId}
                style={{ flexDirection: "row", paddingVertical: 2 }}
              >
                <Cell w={40} txt={String(i.cantidad)} />
                <Cell w={120} txt={i.nombre.toUpperCase()} />
                <Cell w={50} txt={money(i.precio)} align="right" />
                <Cell w={60} txt={money(i.precio * i.cantidad)} align="right" />
              </View>
            ))}
            <Dashed />
            <Row k="TOTAL" v={money(p.total)} big />
            <Row k="METODO" v={p.metodo.toUpperCase()} />
            {p.recibido != null && (
              <>
                <Row k="RECIBIDO" v={money(p.recibido)} />
                <Row k="CAMBIO" v={money(p.cambio ?? 0)} />
              </>
            )}
            <Text
              style={{
                textAlign: "center",
                marginTop: 10,
                color: "#000",
                fontFamily: "SpaceGrotesk_500Medium",
                fontSize: 10,
              }}
            >
              GRACIAS POR SU COMPRA
            </Text>
          </ScrollView>
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              padding: 12,
              borderTopWidth: 1,
              borderColor: "#000",
            }}
          >
            <View style={{ flex: 1 }}>
              <NeoButton label="Compartir" onPress={share} variant="green" full />
            </View>
            <View style={{ flex: 1 }}>
              <NeoButton label="Cerrar" onPress={p.onClose} variant="black" full />
            </View>
          </View>
          <Pressable
            onPress={p.onClose}
            style={{ position: "absolute", top: 8, right: 8, padding: 6 }}
          >
            <Ionicons name="close" size={22} color="#000" />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function Row({ k, v, big }: { k: string; v: string; big?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 }}>
      <Text
        style={{
          color: "#000",
          fontFamily: "SpaceGrotesk_700Bold",
          fontSize: big ? 14 : 11,
        }}
      >
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

function Cell({
  w,
  txt,
  bold,
  align,
}: {
  w: number;
  txt: string;
  bold?: boolean;
  align?: "left" | "right";
}) {
  return (
    <Text
      style={{
        width: w,
        color: "#000",
        fontFamily: bold ? "SpaceGrotesk_700Bold" : "SpaceGrotesk_500Medium",
        fontSize: 10,
        textAlign: align ?? "left",
      }}
    >
      {txt}
    </Text>
  );
}

function Dashed() {
  return (
    <View
      style={{
        borderTopWidth: 1,
        borderColor: "#000",
        borderStyle: "dashed",
        marginVertical: 6,
      }}
    />
  );
}

export { ticketHtml };
