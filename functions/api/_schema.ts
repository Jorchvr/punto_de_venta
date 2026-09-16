export const SCHEMA_SQL = `
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
`;

let ensured = false;

export async function ensureSchema(db: D1Database): Promise<void> {
  if (ensured) return;
  const statements = SCHEMA_SQL.split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => db.prepare(s));
  await db.batch(statements);
  const seed = await db.prepare("SELECT COUNT(*) as c FROM Usuarios").first<{ c: number }>();
  if ((seed?.c ?? 0) === 0) {
    await db
      .prepare("INSERT INTO Usuarios (Nombre, Pin, Rol) VALUES (?, ?, ?)")
      .bind("ADMIN", null, "Admin")
      .run();
  }
  ensured = true;
}
