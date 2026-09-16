import { getDb } from "./client";
import { api } from "@/api/client";
import { isCloudActive } from "@/stores/cloud.store";

export type MetodoPago = "Efectivo" | "Transferencia" | "Tarjeta" | "Dolares";

export interface Venta {
  Id: number;
  Fecha: string;
  Concepto: string;
  Total: number;
  MetodoPago: MetodoPago;
  Usuario: string;
  Categoria: string;
  StockDespues: number | null;
  Refundada: number;
  ProductoId: number | null;
}

export interface CartLine {
  productoId: number;
  nombre: string;
  precio: number;
  cantidad: number;
  esServicio: number;
}

export async function checkoutCart(
  lines: CartLine[],
  metodo: MetodoPago,
  usuario: string
): Promise<number[]> {
  if (lines.length === 0) throw new Error("Carrito vacio");
  const fechaLocal = toSqlite(new Date());

  if (isCloudActive()) {
    await api.post("/ventas", { lines, metodo, usuario, fecha: fechaLocal });
    return lines.map((_, i) => i);
  }

  const db = await getDb();
  const insertedIds: number[] = [];

  await db.withTransactionAsync(async () => {
    for (const line of lines) {
      const total = line.precio * line.cantidad;
      let stockDespues: number | null = null;

      if (line.esServicio === 0) {
        const p = await db.getFirstAsync<{ Stock: number }>(
          "SELECT Stock FROM Productos WHERE Id=?",
          [line.productoId]
        );
        const stockActual = p?.Stock ?? 0;
        stockDespues = stockActual - line.cantidad;
        await db.runAsync("UPDATE Productos SET Stock=? WHERE Id=?", [
          stockDespues,
          line.productoId,
        ]);
      }

      const concepto = `${line.cantidad}x ${line.nombre}`;
      const res = await db.runAsync(
        `INSERT INTO Ventas (Fecha, Concepto, Total, MetodoPago, Usuario, Categoria, StockDespues, ProductoId)
         VALUES (?, ?, ?, ?, ?, 'PuntoDeVenta', ?, ?)`,
        [fechaLocal, concepto, total, metodo, usuario, stockDespues, line.productoId]
      );
      insertedIds.push(res.lastInsertRowId);
    }
  });

  return insertedIds;
}

export async function ventasByRango(
  desdeIso: string,
  hastaIso: string
): Promise<Venta[]> {
  if (isCloudActive()) {
    return api.get<Venta[]>(
      `/ventas?desde=${encodeURIComponent(desdeIso)}&hasta=${encodeURIComponent(hastaIso)}`
    );
  }
  const db = await getDb();
  return db.getAllAsync<Venta>(
    "SELECT * FROM Ventas WHERE Fecha >= ? AND Fecha <= ? ORDER BY Fecha DESC",
    [desdeIso, hastaIso]
  );
}

export async function ventasHoy(): Promise<Venta[]> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  return ventasByRango(toSqlite(start), toSqlite(end));
}

export async function refundVenta(id: number): Promise<void> {
  if (isCloudActive()) {
    await api.post(`/ventas/${id}/refund`);
    return;
  }
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    const v = await db.getFirstAsync<Venta>("SELECT * FROM Ventas WHERE Id=?", [id]);
    if (!v || v.Refundada === 1) return;
    if (v.ProductoId != null) {
      const cantMatch = /^(\d+)x/.exec(v.Concepto);
      const cant = cantMatch ? parseInt(cantMatch[1], 10) : 0;
      if (cant > 0) {
        await db.runAsync(
          "UPDATE Productos SET Stock = Stock + ? WHERE Id = ?",
          [cant, v.ProductoId]
        );
      }
    }
    await db.runAsync("UPDATE Ventas SET Refundada=1 WHERE Id=?", [id]);
  });
}

export function toSqlite(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function fromSqlite(s: string): Date {
  if (s.includes("T") || s.endsWith("Z")) return new Date(s);
  const parts = s.split(" ");
  const [y, m, d] = parts[0].split("-").map(Number);
  const [h, mi, se] = (parts[1] || "00:00:00").split(":").map(Number);
  return new Date(y, m - 1, d, h, mi, se);
}
