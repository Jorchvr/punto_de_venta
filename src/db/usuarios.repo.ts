import { getDb } from "./client";
import { api } from "@/api/client";
import { isCloudActive } from "@/stores/cloud.store";

export interface Usuario {
  Id: number;
  Nombre: string;
  Pin: string | null;
  Rol: "Admin" | "Cajero";
}

export async function listUsuarios(): Promise<Usuario[]> {
  if (isCloudActive()) return api.get<Usuario[]>("/usuarios");
  const db = await getDb();
  return db.getAllAsync<Usuario>("SELECT * FROM Usuarios ORDER BY Nombre ASC");
}

export async function createUsuario(u: Omit<Usuario, "Id">): Promise<number> {
  if (isCloudActive()) {
    const r = await api.post<{ id: number }>("/usuarios", u);
    return r.id;
  }
  const db = await getDb();
  const res = await db.runAsync(
    "INSERT INTO Usuarios (Nombre, Pin, Rol) VALUES (?, ?, ?)",
    [u.Nombre, u.Pin, u.Rol]
  );
  return res.lastInsertRowId;
}

export async function updateUsuario(id: number, u: Omit<Usuario, "Id">): Promise<void> {
  if (isCloudActive()) {
    await api.put(`/usuarios/${id}`, u);
    return;
  }
  const db = await getDb();
  await db.runAsync(
    "UPDATE Usuarios SET Nombre=?, Pin=?, Rol=? WHERE Id=?",
    [u.Nombre, u.Pin, u.Rol, id]
  );
}

export async function deleteUsuario(id: number): Promise<void> {
  if (isCloudActive()) {
    await api.del(`/usuarios/${id}`);
    return;
  }
  const db = await getDb();
  await db.runAsync("DELETE FROM Usuarios WHERE Id=?", [id]);
}
