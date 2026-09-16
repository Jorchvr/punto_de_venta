import { getDb } from "./client";
import { api } from "@/api/client";
import { isCloudActive } from "@/stores/cloud.store";

export interface Producto {
  Id: number;
  Nombre: string;
  Precio: number;
  Stock: number;
  Costo: number;
  CodigoBarras: string;
  EsServicio: number;
  CreadoEn: string;
}

export interface ProductoInput {
  Nombre: string;
  Precio: number;
  Stock: number;
  Costo: number;
  CodigoBarras: string;
  EsServicio: number;
}

export async function listProductos(search = ""): Promise<Producto[]> {
  if (isCloudActive()) {
    const q = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
    return api.get<Producto[]>(`/productos${q}`);
  }
  const db = await getDb();
  if (search.trim()) {
    const q = `%${search.trim().toUpperCase()}%`;
    return db.getAllAsync<Producto>(
      "SELECT * FROM Productos WHERE UPPER(Nombre) LIKE ? OR CodigoBarras LIKE ? ORDER BY Nombre ASC",
      [q, `%${search.trim()}%`]
    );
  }
  return db.getAllAsync<Producto>("SELECT * FROM Productos ORDER BY Nombre ASC");
}

export async function getProducto(id: number): Promise<Producto | null> {
  if (isCloudActive()) {
    const list = await api.get<Producto[]>("/productos");
    return list.find((p) => p.Id === id) ?? null;
  }
  const db = await getDb();
  const row = await db.getFirstAsync<Producto>(
    "SELECT * FROM Productos WHERE Id = ?",
    [id]
  );
  return row ?? null;
}

export async function createProducto(p: ProductoInput): Promise<number> {
  if (isCloudActive()) {
    const r = await api.post<{ id: number }>("/productos", p);
    return r.id;
  }
  const db = await getDb();
  const res = await db.runAsync(
    "INSERT INTO Productos (Nombre, Precio, Stock, Costo, CodigoBarras, EsServicio) VALUES (?, ?, ?, ?, ?, ?)",
    [p.Nombre, p.Precio, p.Stock, p.Costo, p.CodigoBarras, p.EsServicio]
  );
  return res.lastInsertRowId;
}

export async function updateProducto(
  id: number,
  p: ProductoInput
): Promise<void> {
  if (isCloudActive()) {
    await api.put(`/productos/${id}`, p);
    return;
  }
  const db = await getDb();
  await db.runAsync(
    "UPDATE Productos SET Nombre=?, Precio=?, Stock=?, Costo=?, CodigoBarras=?, EsServicio=? WHERE Id=?",
    [p.Nombre, p.Precio, p.Stock, p.Costo, p.CodigoBarras, p.EsServicio, id]
  );
}

export async function deleteProducto(id: number): Promise<void> {
  if (isCloudActive()) {
    await api.del(`/productos/${id}`);
    return;
  }
  const db = await getDb();
  await db.runAsync("DELETE FROM Productos WHERE Id=?", [id]);
}
