import { getDb } from "./client";

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
        `INSERT INTO Ventas (Concepto, Total, MetodoPago, Usuario, Categoria, StockDespues, ProductoId)
         VALUES (?, ?, ?, ?, 'PuntoDeVenta', ?, ?)`,
        [concepto, total, metodo, usuario, stockDespues, line.productoId]
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
  const db = await getDb();
  return db.getAllAsync<Venta>(
    "SELECT * FROM Ventas WHERE Fecha >= ? AND Fecha <= ? ORDER BY Fecha DESC",
    [desdeIso, hastaIso]
  );
}

export async function ventasHoy(): Promise<Venta[]> {
  const db = await getDb();
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  return db.getAllAsync<Venta>(
    "SELECT * FROM Ventas WHERE Fecha >= ? AND Fecha <= ? ORDER BY Fecha DESC",
    [toSqlite(start), toSqlite(end)]
  );
}

export async function refundVenta(id: number): Promise<void> {
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
  // SQLite returns "YYYY-MM-DD HH:MM:SS" in local time from CURRENT_TIMESTAMP (UTC actually).
  // Handle both.
  const iso = s.includes("T") ? s : s.replace(" ", "T") + "Z";
  return new Date(iso);
}
