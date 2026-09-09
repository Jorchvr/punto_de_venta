import type { SQLiteDatabase } from "expo-sqlite";

export const DB_NAME = "blackmamba.db";
const CURRENT_VERSION = 1;

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await db.execAsync("PRAGMA journal_mode = WAL;");
  await db.execAsync("PRAGMA foreign_keys = ON;");

  const result = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version;"
  );
  const version = result?.user_version ?? 0;

  if (version < 1) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS Productos (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        Nombre TEXT NOT NULL,
        Precio REAL NOT NULL,
        Stock INTEGER NOT NULL DEFAULT 0,
        Costo REAL DEFAULT 0,
        CodigoBarras TEXT DEFAULT '',
        EsServicio INTEGER DEFAULT 0,
        CreadoEn DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_productos_codigo ON Productos(CodigoBarras);

      CREATE TABLE IF NOT EXISTS Ventas (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        Fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        Concepto TEXT NOT NULL,
        Total REAL NOT NULL,
        MetodoPago TEXT NOT NULL,
        Usuario TEXT NOT NULL,
        Categoria TEXT DEFAULT 'PuntoDeVenta',
        StockDespues INTEGER,
        Refundada INTEGER DEFAULT 0,
        ProductoId INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON Ventas(Fecha);
      CREATE INDEX IF NOT EXISTS idx_ventas_producto ON Ventas(ProductoId);

      CREATE TABLE IF NOT EXISTS Usuarios (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        Nombre TEXT NOT NULL,
        Pin TEXT,
        Rol TEXT DEFAULT 'Cajero'
      );
    `);
  }

  await db.execAsync(`PRAGMA user_version = ${CURRENT_VERSION};`);

  await seedIfEmpty(db);
}

async function seedIfEmpty(db: SQLiteDatabase): Promise<void> {
  const productos = await db.getFirstAsync<{ c: number }>(
    "SELECT COUNT(*) as c FROM Productos"
  );
  if ((productos?.c ?? 0) === 0) {
    const seed: Array<[string, number, number, number, string]> = [
      ["AGUA CIEL 600ML", 15, 10, 8, "7501055310821"],
      ["GATORADE 500ML", 30, 10, 18, "7501055309139"],
      ["PROTEINA WHEY 30G", 65, 10, 40, ""],
      ["BARRA PROTEICA", 45, 10, 25, ""],
      ["POWERADE 500ML", 28, 10, 17, ""],
      ["PRE-WORKOUT SHOT", 90, 10, 55, ""],
      ["CREATINA 5G", 55, 10, 30, ""],
      ["MEMBRESIA MENSUAL", 350, 0, 0, ""],
    ];
    for (const [nombre, precio, stock, costo, codigo] of seed) {
      const esServicio = nombre.includes("MEMBRESIA") ? 1 : 0;
      await db.runAsync(
        "INSERT INTO Productos (Nombre, Precio, Stock, Costo, CodigoBarras, EsServicio) VALUES (?, ?, ?, ?, ?, ?)",
        [nombre, precio, stock, costo, codigo, esServicio]
      );
    }
  }

  const usuarios = await db.getFirstAsync<{ c: number }>(
    "SELECT COUNT(*) as c FROM Usuarios"
  );
  if ((usuarios?.c ?? 0) === 0) {
    await db.runAsync(
      "INSERT INTO Usuarios (Nombre, Pin, Rol) VALUES (?, ?, ?)",
      ["ADMIN", null, "Admin"]
    );
  }
}
